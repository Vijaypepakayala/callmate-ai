// ============================================================
// AI Receptionist — Core Conversation Orchestrator
// ============================================================
// This is the brain of CallMate AI. It orchestrates:
// 1. Telnyx Call Control for voice
// 2. OpenAI for intelligent responses
// 3. SSML Voice Engine for emotional speech
// 4. Ambient Sounds for realism
// 5. Database for state management
// ============================================================

import { db } from './db'
import { callControl } from './telnyx'
import { messaging } from './telnyx'
import { buildSystemPrompt, getAIResponse, summarizeCall } from './openai'
import { buildNaturalSSML, buildGreetingSSML, getVoiceConfig } from './voice-engine'
import { startAmbience, playTypingSounds, playThinkingSounds, playHoldTransition, stopAllAmbient, getAmbientConfig, detectAmbientTrigger } from './ambient-sounds'
import { sleep } from './utils'
import type { ConversationMessage, CallerIntent, VoiceStyle, AmbientConfig, VoiceConfig } from '@/types'

// ============================================================
// Handle Incoming Call — The Entry Point
// ============================================================

export async function handleIncomingCall(
  callControlId: string,
  callerNumber: string,
  calledNumber: string
): Promise<void> {
  console.log(`[Receptionist] Incoming call from ${callerNumber} to ${calledNumber}`)

  // Find the business that owns this number
  const phoneRecord = await db.phoneNumber.findUnique({
    where: { phoneNumber: calledNumber },
    include: {
      business: {
        include: {
          settings: true,
          faqs: true,
        },
      },
    },
  })

  if (!phoneRecord || !phoneRecord.business.settings) {
    console.error(`[Receptionist] No business found for number ${calledNumber}`)
    // Answer and apologize
    await callControl.answer(callControlId)
    await sleep(500)
    const defaultSSML = buildNaturalSSML(
      "I'm sorry, this number is not currently configured. Please try again later. Goodbye.",
      { voiceName: 'en-US-JennyNeural', style: 'empathetic', personality: 'warm-friendly', speakingRate: '0%', pitch: '0%' }
    )
    await callControl.speak(callControlId, defaultSSML)
    await sleep(5000)
    await callControl.hangup(callControlId)
    return
  }

  const business = phoneRecord.business
  const settings = business.settings!

  // Create call record in DB
  const call = await db.call.create({
    data: {
      businessId: business.id,
      callControlId,
      callerNumber,
      calledNumber,
      direction: 'inbound',
      status: 'ringing',
    },
  })

  // Initialize conversation state
  await db.conversationState.create({
    data: {
      callControlId,
      businessId: business.id,
      messages: '[]',
      currentIntent: 'unknown',
      gatherState: 'listening',
      metadata: JSON.stringify({ callId: call.id }),
    },
  })

  // Answer the call
  await callControl.answer(callControlId, JSON.stringify({ businessId: business.id }))
  console.log(`[Receptionist] Answered call ${callControlId} for ${business.name}`)
}

// ============================================================
// Handle Call Answered — Start the Conversation
// ============================================================

export async function handleCallAnswered(
  callControlId: string
): Promise<void> {
  const state = await db.conversationState.findUnique({
    where: { callControlId },
  })
  if (!state) return

  const settings = await db.businessSettings.findUnique({
    where: { businessId: state.businessId },
    include: { business: true },
  })
  if (!settings) return

  const voiceConfig = getVoiceConfig(settings)
  const ambientConfig = getAmbientConfig(settings)

  // Update call status
  const metadata = JSON.parse(state.metadata)
  await db.call.update({
    where: { id: metadata.callId },
    data: { status: 'answered' },
  })

  // Start ambient office sounds (subtle background)
  await startAmbience(callControlId, ambientConfig)

  // Small pause before greeting (feels natural, like picking up phone)
  await sleep(400)

  // Build and speak the greeting with cheerful emotion
  const greetingText = settings.greeting
    .replace('{business_name}', settings.business.name)
    .replace('{name}', settings.business.name)
  const greetingSSML = buildGreetingSSML(greetingText, voiceConfig)

  // Use speak-and-gather so caller can interrupt if they want (barge-in)
  if (settings.bargeInEnabled) {
    await callControl.speakAndGather(callControlId, greetingSSML, {
      interruptEnabled: true,
      minSilenceMs: getMinSilence(settings.interruptSensitivity),
      clientState: JSON.stringify({ state: 'greeting' }),
    })
  } else {
    await callControl.speak(callControlId, greetingSSML, {
      clientState: JSON.stringify({ state: 'greeting' }),
    })
  }

  // Save greeting to conversation
  const messages: ConversationMessage[] = [{
    role: 'assistant',
    content: greetingText,
    timestamp: Date.now(),
    emotion: 'cheerful',
  }]
  await db.conversationState.update({
    where: { callControlId },
    data: { messages: JSON.stringify(messages) },
  })
}

// ============================================================
// Handle Speech Input — The Conversation Loop
// ============================================================

export async function handleSpeechGathered(
  callControlId: string,
  speechResult: string,
  confidence: number
): Promise<void> {
  console.log(`[Receptionist] Speech: "${speechResult}" (confidence: ${confidence})`)

  const state = await db.conversationState.findUnique({
    where: { callControlId },
  })
  if (!state) return

  const settings = await db.businessSettings.findUnique({
    where: { businessId: state.businessId },
    include: { business: { include: { faqs: true } } },
  })
  if (!settings) return

  const voiceConfig = getVoiceConfig(settings)
  const ambientConfig = getAmbientConfig(settings)
  const messages: ConversationMessage[] = JSON.parse(state.messages)

  // Add caller's speech to conversation
  messages.push({
    role: 'user',
    content: speechResult,
    timestamp: Date.now(),
  })

  // Build system prompt with business context
  const systemPrompt = buildSystemPrompt({
    businessName: settings.business.name,
    aiPersonality: settings.aiPersonality,
    greeting: settings.greeting,
    businessHours: settings.businessHours,
    faqs: settings.business.faqs.map(f => ({ question: f.question, answer: f.answer })),
    transferNumber: settings.transferNumber,
    currentTime: new Date().toLocaleString('en-US', { timeZone: settings.business.timezone || 'America/New_York' }),
  })

  // Get AI response
  const aiResponse = await getAIResponse(systemPrompt, messages)
  console.log(`[Receptionist] AI: "${aiResponse.text}" [${aiResponse.emotion}]`)

  // Add AI response to conversation
  messages.push({
    role: 'assistant',
    content: aiResponse.text,
    timestamp: Date.now(),
    emotion: aiResponse.emotion,
  })

  // Detect if we should play ambient sounds based on response
  const ambientTrigger = detectAmbientTrigger(aiResponse.text)
  if (ambientTrigger === 'typing') {
    await playTypingSounds(callControlId, ambientConfig)
    // Add a natural thinking pause
    await sleep(settings.thinkingPauseMs)
  } else if (ambientTrigger === 'thinking') {
    await playThinkingSounds(callControlId, ambientConfig)
    await sleep(settings.thinkingPauseMs)
  } else if (ambientTrigger === 'hold-transition') {
    await playHoldTransition(callControlId, ambientConfig)
    await sleep(800)
  }

  // Build SSML with detected emotion and natural pausing
  const voiceWithEmotion = {
    ...voiceConfig,
    style: aiResponse.emotion,
  }
  const responseSSML = buildNaturalSSML(
    aiResponse.text,
    voiceWithEmotion,
    settings.sentencePauseMs
  )

  // Handle actions from AI response
  if (aiResponse.action) {
    await handleAction(
      callControlId,
      state.businessId,
      aiResponse.action,
      messages,
      ambientConfig,
      settings.smsFromNumber || ''
    )
  }

  // Update conversation state
  await db.conversationState.update({
    where: { callControlId },
    data: {
      messages: JSON.stringify(messages),
      currentIntent: aiResponse.intent || state.currentIntent,
    },
  })

  // Check if call should end
  if (aiResponse.action?.startsWith('end_call')) {
    await callControl.speak(callControlId, responseSSML)
    await sleep(3000)
    await stopAllAmbient(callControlId)
    await callControl.hangup(callControlId)
    return
  }

  // Check if transfer was requested
  if (aiResponse.action?.startsWith('transfer') && settings.transferNumber) {
    await callControl.speak(callControlId, responseSSML)
    await sleep(2000)
    await stopAllAmbient(callControlId)
    await callControl.transfer(callControlId, settings.transferNumber)
    return
  }

  // Speak response and listen for next input (conversation loop)
  if (settings.bargeInEnabled) {
    await callControl.speakAndGather(callControlId, responseSSML, {
      interruptEnabled: true,
      minSilenceMs: getMinSilence(settings.interruptSensitivity),
      clientState: JSON.stringify({ state: 'conversation' }),
    })
  } else {
    await callControl.speak(callControlId, responseSSML, {
      clientState: JSON.stringify({ state: 'conversation' }),
    })
  }
}

// ============================================================
// Handle Speak Finished — Start Listening Again
// ============================================================

export async function handleSpeakFinished(
  callControlId: string
): Promise<void> {
  const state = await db.conversationState.findUnique({
    where: { callControlId },
  })
  if (!state) return

  const settings = await db.businessSettings.findUnique({
    where: { businessId: state.businessId },
  })
  if (!settings) return

  // If barge-in is disabled, we need to manually start gathering after speak finishes
  if (!settings.bargeInEnabled) {
    await callControl.gather(callControlId, {
      interruptEnabled: false,
      minSilenceMs: getMinSilence(settings.interruptSensitivity),
      clientState: JSON.stringify({ state: 'listening' }),
    })
  }
  // If barge-in enabled, gather_using_speak already handles the transition
}

// ============================================================
// Handle Call Ended — Cleanup & Summary
// ============================================================

export async function handleCallEnded(
  callControlId: string
): Promise<void> {
  console.log(`[Receptionist] Call ended: ${callControlId}`)

  const state = await db.conversationState.findUnique({
    where: { callControlId },
  })
  if (!state) return

  const metadata = JSON.parse(state.metadata)
  const messages: ConversationMessage[] = JSON.parse(state.messages)

  // Summarize the call
  let summary = 'Call ended.'
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  let confidence = 0.5

  if (messages.length > 2) {
    try {
      const result = await summarizeCall(messages)
      summary = result.summary
      sentiment = result.sentiment
      confidence = result.confidence
    } catch (error) {
      console.error('[Receptionist] Failed to summarize call:', error)
    }
  }

  // Calculate duration
  const call = await db.call.findFirst({
    where: { callControlId },
  })

  const duration = call
    ? Math.round((Date.now() - call.startedAt.getTime()) / 1000)
    : 0

  // Update call record
  await db.call.updateMany({
    where: { callControlId },
    data: {
      status: 'completed',
      endedAt: new Date(),
      duration,
      transcript: JSON.stringify(messages),
      summary,
      callerIntent: state.currentIntent,
      sentiment,
      aiConfidence: confidence,
    },
  })

  // Clean up conversation state
  await db.conversationState.delete({
    where: { callControlId },
  }).catch(() => {}) // Ignore if already deleted
}

// ============================================================
// Handle Actions (booking, messages, transfers)
// ============================================================

async function handleAction(
  callControlId: string,
  businessId: string,
  action: string,
  messages: ConversationMessage[],
  ambientConfig: AmbientConfig,
  smsFromNumber: string
): Promise<void> {
  const parts = action.split('|')
  const actionType = parts[0]

  switch (actionType) {
    case 'book_appointment': {
      const [, name, date, time, service, phone] = parts
      try {
        // Play typing sounds while "booking"
        await playTypingSounds(callControlId, ambientConfig)

        await db.appointment.create({
          data: {
            businessId,
            callId: callControlId,
            callerName: name || 'Unknown',
            callerNumber: phone || '',
            scheduledAt: new Date(`${date} ${time}`),
            service: service || 'General',
            status: 'confirmed',
          },
        })

        // Update call record
        await db.call.updateMany({
          where: { callControlId },
          data: { appointmentBooked: true },
        })

        // Send SMS confirmation
        if (smsFromNumber && phone) {
          try {
            await messaging.sendSMS(
              smsFromNumber,
              phone,
              `✅ Your appointment has been confirmed!\n\n📅 ${date} at ${time}\n💼 ${service || 'General appointment'}\n\nWe look forward to seeing you! Reply CANCEL to cancel.`
            )
            await db.call.updateMany({
              where: { callControlId },
              data: { smsSent: true },
            })
          } catch (smsError) {
            console.error('[Receptionist] SMS confirmation failed:', smsError)
          }
        }

        console.log(`[Receptionist] Appointment booked: ${name}, ${date} ${time}`)
      } catch (error) {
        console.error('[Receptionist] Failed to book appointment:', error)
      }
      break
    }

    case 'take_message': {
      const [, name, phone, messageText] = parts
      try {
        await db.call.updateMany({
          where: { callControlId },
          data: { messageTaken: true },
        })
        console.log(`[Receptionist] Message taken from ${name}: ${messageText}`)
      } catch (error) {
        console.error('[Receptionist] Failed to save message:', error)
      }
      break
    }

    case 'transfer': {
      await db.call.updateMany({
        where: { callControlId },
        data: { transferred: true },
      })
      break
    }

    case 'end_call': {
      // Nothing extra needed — handled by caller
      break
    }
  }
}

// ============================================================
// Helpers
// ============================================================

function getMinSilence(sensitivity: string): number {
  switch (sensitivity) {
    case 'low': return 1200     // Wait longer before detecting end of speech
    case 'medium': return 800   // Default
    case 'high': return 500     // Quick to detect pauses
    default: return 800
  }
}

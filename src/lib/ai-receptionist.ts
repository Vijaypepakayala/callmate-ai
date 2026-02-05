// ============================================================
// AI Receptionist — Core Logic (Demo Mode)
// ============================================================
// Handles the AI conversation flow for incoming calls
// Uses Telnyx Call Control + OpenAI for natural conversation
// ============================================================

import { callControl, messaging } from './telnyx'
import { buildSystemPrompt, getAIResponse } from './openai'
import { buildNaturalSSML, buildGreetingSSML } from './voice-engine'
import { sleep } from './utils'
import type { ConversationMessage, CallerIntent, VoiceStyle, VoiceConfig } from '@/types'

// In-memory conversation store for demo
const conversations = new Map<string, {
  messages: ConversationMessage[]
  callerNumber: string
  calledNumber: string
  intent: CallerIntent
}>()

// Default demo settings
const DEFAULT_SETTINGS = {
  businessName: 'CallMate AI Demo',
  greeting: 'Thanks for calling! This is an AI receptionist demo powered by CallMate. How can I help you today?',
  voiceName: 'Azure.en-US-JennyNeural',
  voiceStyle: 'cheerful' as VoiceStyle,
  personality: 'warm-friendly',
  ambientEnabled: true,
}

const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  voiceName: DEFAULT_SETTINGS.voiceName,
  style: DEFAULT_SETTINGS.voiceStyle,
  personality: 'warm-friendly',
  speakingRate: '-5%',
  pitch: '2%',
}

export async function handleIncomingCall(
  callControlId: string,
  from: string,
  to: string
) {
  console.log(`[AI] Incoming call from ${from} to ${to}`)

  // Initialize conversation
  conversations.set(callControlId, {
    messages: [],
    callerNumber: from,
    calledNumber: to,
    intent: 'unknown',
  })

  // Answer the call
  try {
    await callControl.answer(callControlId)
  } catch (err) {
    console.error('[AI] Failed to answer call:', err)
  }
}

export async function handleCallAnswered(callControlId: string) {
  console.log(`[AI] Call answered: ${callControlId}`)

  // Small natural pause before greeting
  await sleep(500)

  // Build greeting SSML with emotion
  const ssml = buildGreetingSSML(DEFAULT_SETTINGS.greeting, DEFAULT_VOICE_CONFIG)

  // Speak the greeting and gather response
  try {
    await callControl.speakAndGather(callControlId, ssml)
  } catch (err) {
    console.error('[AI] Failed to speak greeting:', err)
  }
}

export async function handleSpeechGathered(
  callControlId: string,
  speechResult: string,
  confidence: number
) {
  console.log(`[AI] Speech gathered (${confidence}): "${speechResult}"`)

  const convo = conversations.get(callControlId)
  if (!convo) return

  // Add caller message
  convo.messages.push({
    role: 'user',
    content: speechResult,
    timestamp: Date.now(),
  })

  // Get AI response
  const systemPrompt = buildSystemPrompt({
    businessName: DEFAULT_SETTINGS.businessName,
    aiPersonality: DEFAULT_SETTINGS.personality,
    greeting: DEFAULT_SETTINGS.greeting,
    businessHours: '9am - 5pm, Monday to Friday',
    faqs: [],
    transferNumber: null,
    currentTime: new Date().toLocaleString(),
  })

  const aiResult = await getAIResponse(systemPrompt, convo.messages)
  const aiResponse = aiResult.text

  // Add AI response to history
  convo.messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: Date.now(),
    emotion: DEFAULT_SETTINGS.voiceStyle,
  })

  // Build SSML with emotion
  const ssml = buildNaturalSSML(aiResponse, DEFAULT_VOICE_CONFIG)

  // Small thinking pause for naturalness
  await sleep(300)

  // Speak response and gather next input
  try {
    await callControl.speakAndGather(callControlId, ssml)
  } catch (err) {
    console.error('[AI] Failed to speak response:', err)
  }
}

export async function handleSpeakFinished(callControlId: string) {
  console.log(`[AI] Speak finished, re-gathering: ${callControlId}`)

  // Start listening again
  try {
    await callControl.gather(callControlId)
  } catch (err) {
    console.error('[AI] Failed to re-gather:', err)
  }
}

export async function handleCallEnded(callControlId: string) {
  console.log(`[AI] Call ended: ${callControlId}`)

  const convo = conversations.get(callControlId)
  if (convo) {
    console.log(`[AI] Conversation had ${convo.messages.length} messages`)
    // Clean up
    conversations.delete(callControlId)
  }
}

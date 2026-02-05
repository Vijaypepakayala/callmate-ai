// ============================================================
// Voice Webhook — Telnyx Call Control Event Handler
// ============================================================
// Handles all voice events from Telnyx Call Control v2:
// - call.initiated → New incoming call
// - call.answered → Call was answered
// - call.gather.ended → Speech input received
// - call.speak.completed → TTS finished
// - call.hangup → Call ended
// - call.playback.started/ended → Ambient sound events
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  handleIncomingCall,
  handleCallAnswered,
  handleSpeechGathered,
  handleSpeakFinished,
  handleCallEnded,
} from '@/lib/ai-receptionist'
import type { TelnyxWebhookEvent, TelnyxCallPayload } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TelnyxWebhookEvent
    const eventType = body.data.event_type
    const payload = body.data.payload as TelnyxCallPayload

    console.log(`[Webhook:Voice] Event: ${eventType}`, {
      callControlId: payload.call_control_id,
      from: payload.from,
      to: payload.to,
    })

    switch (eventType) {
      // ─── New incoming call ───────────────────────────────
      case 'call.initiated': {
        if (payload.direction === 'incoming') {
          // Don't await — respond to webhook immediately, handle async
          handleIncomingCall(
            payload.call_control_id,
            payload.from,
            payload.to
          ).catch(err => console.error('[Webhook:Voice] handleIncomingCall error:', err))
        }
        break
      }

      // ─── Call was answered ───────────────────────────────
      case 'call.answered': {
        handleCallAnswered(payload.call_control_id)
          .catch(err => console.error('[Webhook:Voice] handleCallAnswered error:', err))
        break
      }

      // ─── Speech gathered (caller spoke) ──────────────────
      case 'call.gather.ended': {
        const speech = payload.speech
        if (speech?.result && speech.result.trim().length > 0) {
          handleSpeechGathered(
            payload.call_control_id,
            speech.result,
            speech.confidence || 0.5
          ).catch(err => console.error('[Webhook:Voice] handleSpeechGathered error:', err))
        } else {
          // No speech detected — might be silence timeout, re-prompt
          handleSpeakFinished(payload.call_control_id)
            .catch(err => console.error('[Webhook:Voice] handleSpeakFinished error:', err))
        }
        break
      }

      // ─── TTS finished speaking ───────────────────────────
      case 'call.speak.completed':
      case 'call.speak.ended': {
        handleSpeakFinished(payload.call_control_id)
          .catch(err => console.error('[Webhook:Voice] handleSpeakFinished error:', err))
        break
      }

      // ─── Call ended/hung up ──────────────────────────────
      case 'call.hangup':
      case 'call.machine.detection.ended': {
        handleCallEnded(payload.call_control_id)
          .catch(err => console.error('[Webhook:Voice] handleCallEnded error:', err))
        break
      }

      // ─── Playback events (ambient sounds) ─────────────────
      case 'call.playback.started':
      case 'call.playback.ended': {
        // Informational — log but don't act
        const clientState = payload.client_state
          ? JSON.parse(Buffer.from(payload.client_state, 'base64').toString())
          : null
        console.log(`[Webhook:Voice] Playback ${eventType}:`, clientState)
        break
      }

      // ─── Gather using speak completed ─────────────────────
      case 'call.gather.completed': {
        // gather_using_speak completed — speech was collected during speak
        const speech = payload.speech
        if (speech?.result && speech.result.trim().length > 0) {
          handleSpeechGathered(
            payload.call_control_id,
            speech.result,
            speech.confidence || 0.5
          ).catch(err => console.error('[Webhook:Voice] handleSpeechGathered error:', err))
        }
        break
      }

      default: {
        console.log(`[Webhook:Voice] Unhandled event: ${eventType}`)
      }
    }

    // Always respond 200 to Telnyx quickly
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook:Voice] Error processing webhook:', error)
    // Still respond 200 — don't want Telnyx to retry
    return NextResponse.json({ received: true, error: 'Internal error' }, { status: 200 })
  }
}

// Telnyx sends GET to verify webhook URL
export async function GET() {
  return NextResponse.json({ status: 'CallMate AI Voice Webhook Active' })
}

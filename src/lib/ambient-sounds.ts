// ============================================================
// Ambient Sound Engine — Realistic Office Sounds
// ============================================================
// Controls background ambient sounds during calls to create
// the illusion of a real person at a real desk.
// ============================================================

import { callControl } from './telnyx'
import type { AmbientSoundType, AmbientConfig } from '@/types'

const WEBHOOK_BASE = process.env.WEBHOOK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Get the full URL for an ambient sound file.
 * Files are served from /public/audio/ as static assets.
 */
function getAudioUrl(soundType: AmbientSoundType): string {
  return `${WEBHOOK_BASE}/audio/${soundType}.mp3`
}

/**
 * Start background office ambience on a call.
 * Uses overlay mode to mix with the call audio at low volume.
 */
export async function startAmbience(
  callControlId: string,
  config: AmbientConfig
): Promise<void> {
  if (!config.enabled) return

  try {
    await callControl.playAudio(callControlId, getAudioUrl('office-ambience'), {
      loop: true,
      overlay: true,
      clientState: JSON.stringify({ type: 'ambient', sound: 'office-ambience' }),
    })
    console.log(`[Ambient] Started office ambience on call ${callControlId}`)
  } catch (error) {
    // Non-critical — don't fail the call if ambient sounds fail
    console.warn('[Ambient] Failed to start office ambience:', error)
  }
}

/**
 * Play typing sounds — used when AI says "Let me check on that..."
 * Gives the caller the impression the receptionist is looking something up.
 */
export async function playTypingSounds(
  callControlId: string,
  config: AmbientConfig
): Promise<void> {
  if (!config.enabled || !config.typingSounds) return

  try {
    await callControl.playAudio(callControlId, getAudioUrl('typing'), {
      loop: false,
      overlay: true,
      clientState: JSON.stringify({ type: 'ambient', sound: 'typing' }),
    })
    console.log(`[Ambient] Playing typing sounds on call ${callControlId}`)
  } catch (error) {
    console.warn('[Ambient] Failed to play typing sounds:', error)
  }
}

/**
 * Play thinking sounds — pen clicking, paper rustling
 * Used during natural "thinking" pauses.
 */
export async function playThinkingSounds(
  callControlId: string,
  config: AmbientConfig
): Promise<void> {
  if (!config.enabled) return

  try {
    await callControl.playAudio(callControlId, getAudioUrl('thinking'), {
      loop: false,
      overlay: true,
      clientState: JSON.stringify({ type: 'ambient', sound: 'thinking' }),
    })
    console.log(`[Ambient] Playing thinking sounds on call ${callControlId}`)
  } catch (error) {
    console.warn('[Ambient] Failed to play thinking sounds:', error)
  }
}

/**
 * Play hold transition sound — used when transferring or putting caller on brief hold
 */
export async function playHoldTransition(
  callControlId: string,
  config: AmbientConfig
): Promise<void> {
  if (!config.enabled || !config.holdMusic) return

  try {
    await callControl.playAudio(callControlId, getAudioUrl('hold-transition'), {
      loop: false,
      overlay: false, // This one takes over audio briefly
      clientState: JSON.stringify({ type: 'ambient', sound: 'hold-transition' }),
    })
    console.log(`[Ambient] Playing hold transition on call ${callControlId}`)
  } catch (error) {
    console.warn('[Ambient] Failed to play hold transition:', error)
  }
}

/**
 * Stop all ambient playback on a call
 */
export async function stopAllAmbient(callControlId: string): Promise<void> {
  try {
    await callControl.stopAudio(callControlId, { stop: 'all' })
    console.log(`[Ambient] Stopped all ambient on call ${callControlId}`)
  } catch (error) {
    console.warn('[Ambient] Failed to stop ambient:', error)
  }
}

/**
 * Get ambient config from business settings
 */
export function getAmbientConfig(settings: {
  ambientEnabled: boolean
  ambientVolume: number
  typingSoundsEnabled: boolean
  holdMusicEnabled: boolean
}): AmbientConfig {
  return {
    enabled: settings.ambientEnabled,
    volume: settings.ambientVolume,
    typingSounds: settings.typingSoundsEnabled,
    holdMusic: settings.holdMusicEnabled,
  }
}

/**
 * Determine if we should play ambient sounds based on AI response context.
 * Returns the type of ambient sound to play, or null if none.
 */
export function detectAmbientTrigger(aiText: string): AmbientSoundType | null {
  const lowerText = aiText.toLowerCase()

  // Typing/looking up triggers
  const lookupPhrases = [
    'let me check',
    'let me look',
    'one moment',
    'give me a moment',
    'let me see',
    'looking that up',
    'checking on that',
    'pulling up',
    'let me find',
    'searching for',
  ]
  if (lookupPhrases.some(phrase => lowerText.includes(phrase))) {
    return 'typing'
  }

  // Thinking triggers
  const thinkingPhrases = [
    'hmm',
    'let me think',
    'good question',
    'that\'s a great question',
  ]
  if (thinkingPhrases.some(phrase => lowerText.includes(phrase))) {
    return 'thinking'
  }

  // Hold triggers
  const holdPhrases = [
    'transfer you',
    'put you through',
    'connect you',
    'hold on',
    'please hold',
  ]
  if (holdPhrases.some(phrase => lowerText.includes(phrase))) {
    return 'hold-transition'
  }

  return null
}

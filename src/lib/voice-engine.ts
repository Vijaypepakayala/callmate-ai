// ============================================================
// Voice Engine — SSML Builder with Emotional Neural Voices
// ============================================================
// Builds SSML payloads for Telnyx's Azure Neural TTS voices
// with emotion styles, prosody control, and natural pauses.
// ============================================================

import type { VoiceStyle, VoiceConfig } from '@/types'

/**
 * Escape special XML characters in text
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Build full SSML with emotional voice style and prosody
 */
export function buildSSML(
  text: string,
  config: VoiceConfig,
  options: {
    pauseBeforeMs?: number
    pauseAfterMs?: number
    emphasis?: 'none' | 'reduced' | 'moderate' | 'strong'
  } = {}
): string {
  const { pauseBeforeMs, pauseAfterMs, emphasis } = options
  const escapedText = escapeXml(text)

  // Build the inner content with optional pauses and emphasis
  let innerContent = ''

  if (pauseBeforeMs && pauseBeforeMs > 0) {
    innerContent += `<break time="${pauseBeforeMs}ms"/>`
  }

  if (emphasis && emphasis !== 'none') {
    innerContent += `<emphasis level="${emphasis}">${escapedText}</emphasis>`
  } else {
    innerContent += escapedText
  }

  if (pauseAfterMs && pauseAfterMs > 0) {
    innerContent += `<break time="${pauseAfterMs}ms"/>`
  }

  // Wrap in prosody for rate/pitch control
  const prosodyContent = `<prosody rate="${config.speakingRate}" pitch="${config.pitch}">${innerContent}</prosody>`

  // Wrap in express-as for emotion
  const expressContent = `<mstts:express-as style="${config.style}">${prosodyContent}</mstts:express-as>`

  // Full SSML document
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${config.voiceName}">
    ${expressContent}
  </voice>
</speak>`
}

/**
 * Build SSML with natural sentence-level pauses
 * Splits text into sentences and adds micro-pauses between them
 * for a more natural speaking cadence.
 */
export function buildNaturalSSML(
  text: string,
  config: VoiceConfig,
  sentencePauseMs: number = 300
): string {
  // Split into sentences while preserving punctuation
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text]
  const escapedSentences = sentences.map(s => escapeXml(s.trim()))

  // Build inner content with pauses between sentences
  let innerContent = ''
  escapedSentences.forEach((sentence, idx) => {
    innerContent += sentence
    if (idx < escapedSentences.length - 1) {
      innerContent += `<break time="${sentencePauseMs}ms"/>`
    }
  })

  // Wrap in prosody
  const prosodyContent = `<prosody rate="${config.speakingRate}" pitch="${config.pitch}">${innerContent}</prosody>`

  // Wrap in express-as for emotion
  const expressContent = `<mstts:express-as style="${config.style}">${prosodyContent}</mstts:express-as>`

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${config.voiceName}">
    ${expressContent}
  </voice>
</speak>`
}

/**
 * Build a "thinking" SSML — filler phrase with natural pause
 * Used when the AI needs a moment to process (e.g., "Let me check on that...")
 */
export function buildThinkingSSML(config: VoiceConfig): string {
  const fillerPhrases = [
    'Let me check on that for you.',
    'One moment please.',
    'Sure, let me look into that.',
    'Hmm, let me see.',
    'Give me just a moment.',
  ]
  const phrase = fillerPhrases[Math.floor(Math.random() * fillerPhrases.length)]

  return buildSSML(phrase, { ...config, style: 'friendly' }, {
    pauseAfterMs: 500,
  })
}

/**
 * Build greeting SSML with a warm, welcoming tone
 */
export function buildGreetingSSML(
  greeting: string,
  config: VoiceConfig
): string {
  return buildNaturalSSML(greeting, {
    ...config,
    style: 'cheerful', // Always cheerful for greetings
  })
}

/**
 * Build empathetic response SSML for when caller seems upset
 */
export function buildEmpatheticSSML(
  text: string,
  config: VoiceConfig
): string {
  return buildNaturalSSML(text, {
    ...config,
    style: 'empathetic',
    speakingRate: '-10%', // Slightly slower for empathy
  })
}

/**
 * Convert emotion tag from AI response to appropriate voice style,
 * falling back to the configured default style
 */
export function emotionToStyle(
  emotion: VoiceStyle | undefined,
  defaultStyle: VoiceStyle,
  supportedStyles: VoiceStyle[]
): VoiceStyle {
  if (emotion && supportedStyles.includes(emotion)) {
    return emotion
  }
  return defaultStyle
}

/**
 * Get the voice config from business settings
 */
export function getVoiceConfig(settings: {
  voiceName: string
  voiceStyle: string
  speakingRate: string
  voicePitch: string
}): VoiceConfig {
  return {
    voiceName: settings.voiceName,
    style: settings.voiceStyle as VoiceStyle,
    personality: 'warm-friendly',
    speakingRate: settings.speakingRate,
    pitch: settings.voicePitch,
  }
}

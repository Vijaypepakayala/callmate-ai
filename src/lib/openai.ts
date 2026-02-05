// ============================================================
// OpenAI Client — Streaming Conversation Engine
// ============================================================

import OpenAI from 'openai'
import type { ConversationMessage, CallerIntent, VoiceStyle } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ============================================================
// System Prompt Builder
// ============================================================

export function buildSystemPrompt(config: {
  businessName: string
  aiPersonality: string
  greeting: string
  businessHours: string
  faqs: { question: string; answer: string }[]
  transferNumber: string | null
  currentTime: string
}): string {
  const faqSection = config.faqs.length > 0
    ? `\n\nFREQUENTLY ASKED QUESTIONS:\n${config.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')}`
    : ''

  return `You are the AI receptionist for "${config.businessName}".

PERSONALITY: ${config.aiPersonality}

CURRENT TIME: ${config.currentTime}

BUSINESS HOURS:
${config.businessHours}

CORE CAPABILITIES:
1. GREET callers warmly and determine their intent
2. BOOK APPOINTMENTS — ask for name, preferred date/time, service needed, phone number
3. TAKE MESSAGES — get caller's name, number, and message for the business owner
4. ANSWER QUESTIONS — use the FAQ knowledge base below
5. TRANSFER — if caller insists on speaking to a human, offer to transfer${config.transferNumber ? ` (transfer number available)` : ' (no transfer number configured, take a message instead)'}

CONVERSATION RULES:
- Be concise. Keep responses to 1-3 sentences max. This is a phone call, not a chat.
- Sound natural. Use filler words occasionally ("Sure thing!", "Of course!", "Let me check on that...")
- Don't repeat information the caller already gave you
- If you're unsure, ask clarifying questions
- When booking: confirm all details before finalizing
- If caller seems frustrated, acknowledge it with empathy
- Always confirm the caller's phone number for callbacks
- End calls with a brief, warm goodbye

RESPONSE FORMAT:
Respond with ONLY the spoken words. No asterisks, no stage directions, no markdown.
Keep responses SHORT — this is voice, not text. One to three sentences ideal.

EMOTION TAGS:
After your response, add an emotion tag on a new line: [EMOTION:style]
Valid styles: cheerful, empathetic, friendly, hopeful, sad, serious
Choose based on context (e.g., use empathetic for complaints, cheerful for bookings).
Default to friendly if unsure.

INTENT DETECTION:
When you've identified the caller's intent, include on a new line: [INTENT:type]
Types: appointment, question, message, transfer, unknown

ACTION TRIGGERS:
- When an appointment is fully confirmed: [ACTION:book_appointment|name|date|time|service|phone]
- When a message is complete: [ACTION:take_message|name|phone|message]
- When transfer is requested: [ACTION:transfer]
- When call should end naturally: [ACTION:end_call]
${faqSection}`
}

// ============================================================
// Chat Completion (Non-streaming for call control)
// ============================================================

export async function getAIResponse(
  systemPrompt: string,
  messages: ConversationMessage[]
): Promise<{
  text: string
  emotion: VoiceStyle
  intent: CallerIntent | null
  action: string | null
}> {
  const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as 'system' | 'assistant' | 'user',
      content: m.content,
    })),
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: chatMessages,
    temperature: 0.7,
    max_tokens: 250,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  })

  const rawContent = response.choices[0]?.message?.content || "I'm sorry, could you repeat that?"
  return parseAIResponse(rawContent)
}

// ============================================================
// Response Parser — Extracts emotion, intent, actions
// ============================================================

function parseAIResponse(raw: string): {
  text: string
  emotion: VoiceStyle
  intent: CallerIntent | null
  action: string | null
} {
  let text = raw
  let emotion: VoiceStyle = 'friendly'
  let intent: CallerIntent | null = null
  let action: string | null = null

  // Extract emotion tag
  const emotionMatch = text.match(/\[EMOTION:(\w+)\]/)
  if (emotionMatch) {
    const validEmotions: VoiceStyle[] = ['cheerful', 'empathetic', 'friendly', 'hopeful', 'sad', 'serious']
    const parsed = emotionMatch[1] as VoiceStyle
    if (validEmotions.includes(parsed)) {
      emotion = parsed
    }
    text = text.replace(/\[EMOTION:\w+\]/g, '')
  }

  // Extract intent tag
  const intentMatch = text.match(/\[INTENT:(\w+)\]/)
  if (intentMatch) {
    intent = intentMatch[1] as CallerIntent
    text = text.replace(/\[INTENT:\w+\]/g, '')
  }

  // Extract action tag
  const actionMatch = text.match(/\[ACTION:([^\]]+)\]/)
  if (actionMatch) {
    action = actionMatch[1]
    text = text.replace(/\[ACTION:[^\]]+\]/g, '')
  }

  // Clean up
  text = text.trim().replace(/\n+/g, ' ')

  return { text, emotion, intent, action }
}

// ============================================================
// Conversation Summarizer
// ============================================================

export async function summarizeCall(messages: ConversationMessage[]): Promise<{
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  confidence: number
}> {
  const transcript = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'Caller' : 'AI'}: ${m.content}`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Summarize this phone call in 1-2 sentences. Also rate the caller\'s sentiment as positive/neutral/negative and your confidence (0-1). Format: SUMMARY: ...\nSENTIMENT: ...\nCONFIDENCE: ...',
      },
      { role: 'user', content: transcript },
    ],
    temperature: 0.3,
    max_tokens: 150,
  })

  const output = response.choices[0]?.message?.content || ''
  const summaryMatch = output.match(/SUMMARY:\s*(.+)/i)
  const sentimentMatch = output.match(/SENTIMENT:\s*(\w+)/i)
  const confidenceMatch = output.match(/CONFIDENCE:\s*([\d.]+)/i)

  return {
    summary: summaryMatch?.[1]?.trim() || 'Call completed.',
    sentiment: (sentimentMatch?.[1]?.toLowerCase() as 'positive' | 'neutral' | 'negative') || 'neutral',
    confidence: parseFloat(confidenceMatch?.[1] || '0.5'),
  }
}

import { NextRequest, NextResponse } from 'next/server'

const TELNYX_API_KEY = process.env.TELNYX_API_KEY

// Simple rate limiter: max 20 requests per minute per IP
const rateLimit = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    const { text, voice } = await req.json()

    if (!text || text.length > 500) {
      return NextResponse.json({ error: 'Text required (max 500 chars)' }, { status: 400 })
    }

    const response = await fetch('https://api.telnyx.com/v2/text-to-speech/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice || 'Azure.en-US-JennyNeural',
        output_format: 'mp3',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[TTS] Telnyx error:', error)
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    console.error('[TTS] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { DEMO_VOICES } from '@/lib/demo-config'

const TELNYX_API_KEY = process.env.TELNYX_API_KEY
const allowedVoices = new Set<string>(Object.values(DEMO_VOICES))

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

    if (typeof text !== 'string' || !text.trim() || text.length > 500) {
      return NextResponse.json({ error: 'Text required (max 500 chars)' }, { status: 400 })
    }
    if (voice !== undefined && (typeof voice !== 'string' || !allowedVoices.has(voice))) {
      return NextResponse.json({ error: 'Unknown demo voice' }, { status: 400 })
    }
    if (!TELNYX_API_KEY) {
      return NextResponse.json({ error: 'Speech is temporarily unavailable' }, { status: 503 })
    }

    const response = await fetch('https://api.telnyx.com/v2/text-to-speech/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TELNYX_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: voice || DEMO_VOICES.clinicmate,
        output_type: 'binary_output',
        telnyx: { response_format: 'mp3' },
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
        'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[TTS] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

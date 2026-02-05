// ============================================================
// Settings API — Business Configuration
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    const settings = await db.businessSettings.findUnique({
      where: { businessId },
      include: { business: { include: { faqs: true, numbers: true } } },
    })

    if (!settings) {
      return NextResponse.json({ success: false, error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('[API:Settings] GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, ...updates } = body

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    // Validate allowed fields
    const allowedFields = [
      'greeting', 'businessHours', 'afterHoursMsg', 'aiPersonality',
      'maxCallDuration', 'transferNumber',
      'voiceName', 'voiceStyle', 'voicePersonality', 'speakingRate', 'voicePitch',
      'bargeInEnabled', 'thinkingPauseMs', 'sentencePauseMs', 'interruptSensitivity',
      'ambientEnabled', 'ambientVolume', 'typingSoundsEnabled', 'holdMusicEnabled',
      'smsConfirmations', 'smsFromNumber',
    ]

    const filteredUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value
      }
    }

    const settings = await db.businessSettings.upsert({
      where: { businessId },
      update: filteredUpdates,
      create: { businessId, ...filteredUpdates },
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('[API:Settings] PUT error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// FAQ management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, action, ...data } = body

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    if (action === 'add_faq') {
      const faq = await db.fAQ.create({
        data: {
          businessId,
          question: data.question,
          answer: data.answer,
          category: data.category || 'General',
        },
      })
      return NextResponse.json({ success: true, data: faq })
    }

    if (action === 'delete_faq') {
      await db.fAQ.delete({ where: { id: data.faqId } })
      return NextResponse.json({ success: true })
    }

    if (action === 'update_faq') {
      const faq = await db.fAQ.update({
        where: { id: data.faqId },
        data: {
          question: data.question,
          answer: data.answer,
          category: data.category,
        },
      })
      return NextResponse.json({ success: true, data: faq })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[API:Settings] POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

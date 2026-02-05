// ============================================================
// Calls API — Call History & Transcripts
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const intent = searchParams.get('intent')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    const where: Record<string, unknown> = { businessId }
    if (status) where.status = status
    if (intent) where.callerIntent = intent
    if (dateFrom || dateTo) {
      where.startedAt = {}
      if (dateFrom) (where.startedAt as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.startedAt as Record<string, unknown>).lte = new Date(dateTo)
    }

    const [calls, total] = await Promise.all([
      db.call.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.call.count({ where }),
    ])

    // Parse transcript JSON for each call
    const formattedCalls = calls.map(call => ({
      ...call,
      transcript: call.transcript ? JSON.parse(call.transcript) : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        calls: formattedCalls,
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('[API:Calls] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// Analytics API — Call Statistics & Insights
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    // Calculate date range
    const now = new Date()
    const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }
    const days = daysMap[period] || 7
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const calls = await db.call.findMany({
      where: {
        businessId,
        startedAt: { gte: startDate },
      },
      orderBy: { startedAt: 'desc' },
    })

    // Aggregate stats
    const totalCalls = calls.length
    const answeredCalls = calls.filter(c => c.status === 'completed' || c.status === 'answered').length
    const missedCalls = calls.filter(c => c.status === 'missed' || c.status === 'failed').length

    const completedCalls = calls.filter(c => c.duration && c.duration > 0)
    const avgDuration = completedCalls.length > 0
      ? Math.round(completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) / completedCalls.length)
      : 0

    const appointmentsBooked = calls.filter(c => c.appointmentBooked).length
    const messagesTaken = calls.filter(c => c.messageTaken).length

    // Intent breakdown
    const intentCounts: Record<string, number> = {}
    calls.forEach(c => {
      const intent = c.callerIntent || 'unknown'
      intentCounts[intent] = (intentCounts[intent] || 0) + 1
    })
    const topIntents = Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count)

    // Calls by hour
    const hourCounts: Record<number, number> = {}
    calls.forEach(c => {
      const hour = new Date(c.startedAt).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    const callsByHour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourCounts[i] || 0,
    }))

    // Sentiment breakdown
    const sentimentCounts: Record<string, number> = {}
    calls.forEach(c => {
      const sentiment = c.sentiment || 'unknown'
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1
    })
    const sentimentBreakdown = Object.entries(sentimentCounts)
      .map(([sentiment, count]) => ({ sentiment, count }))

    // Calls over time (daily)
    const dailyCounts: Record<string, number> = {}
    calls.forEach(c => {
      const date = new Date(c.startedAt).toISOString().split('T')[0]
      dailyCounts[date] = (dailyCounts[date] || 0) + 1
    })

    // Fill in missing days
    const callsOverTime: { date: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      callsOverTime.push({ date: dateStr, count: dailyCounts[dateStr] || 0 })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCalls,
        answeredCalls,
        missedCalls,
        avgDuration,
        appointmentsBooked,
        messagesTaken,
        topIntents,
        callsByHour,
        sentimentBreakdown,
        callsOverTime,
      },
    })
  } catch (error) {
    console.error('[API:Analytics] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

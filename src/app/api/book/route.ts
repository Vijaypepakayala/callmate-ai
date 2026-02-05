import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company, phone, message } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 })
    }

    const booking = {
      id: crypto.randomUUID(),
      name,
      email,
      company: company || '',
      phone: phone || '',
      message: message || '',
      createdAt: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || 'unknown',
    }

    // Log to console (visible in Vercel logs)
    console.log('[BOOKING]', JSON.stringify(booking))

    // In production, you'd save to a database or send an email
    // For now, we log it and could add email notification later

    return NextResponse.json({
      ok: true,
      message: 'Booking request received',
    })
  } catch (error) {
    console.error('[BOOKING] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

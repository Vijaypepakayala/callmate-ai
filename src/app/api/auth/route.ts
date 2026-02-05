// ============================================================
// Auth API — Simple JWT-based Authentication
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash, randomBytes } from 'crypto'

const AUTH_SECRET = process.env.AUTH_SECRET || 'callmate-dev-secret'

function hashPassword(password: string): string {
  return createHash('sha256').update(password + AUTH_SECRET).digest('hex')
}

function generateToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    nonce: randomBytes(16).toString('hex'),
  })).toString('base64')

  const signature = createHash('sha256')
    .update(payload + AUTH_SECRET)
    .digest('hex')
    .slice(0, 32)

  return `${payload}.${signature}`
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [payload, signature] = token.split('.')
    const expectedSig = createHash('sha256')
      .update(payload + AUTH_SECRET)
      .digest('hex')
      .slice(0, 32)

    if (signature !== expectedSig) return null

    const data = JSON.parse(Buffer.from(payload, 'base64').toString())
    if (data.exp < Date.now()) return null

    return { userId: data.userId }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name, phone } = body

    // ─── Register ─────────────────────────────────────
    if (action === 'register') {
      if (!email || !password || !name) {
        return NextResponse.json(
          { success: false, error: 'Email, password, and business name are required' },
          { status: 400 }
        )
      }

      const existing = await db.business.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      const business = await db.business.create({
        data: {
          name,
          email,
          password: hashPassword(password),
          phone: phone || null,
          settings: {
            create: {}, // Creates with all defaults
          },
        },
        include: { settings: true },
      })

      const token = generateToken(business.id)

      return NextResponse.json({
        success: true,
        data: {
          token,
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
          },
        },
      })
    }

    // ─── Login ────────────────────────────────────────
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        )
      }

      const business = await db.business.findUnique({ where: { email } })
      if (!business || business.password !== hashPassword(password)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const token = generateToken(business.id)

      return NextResponse.json({
        success: true,
        data: {
          token,
          business: {
            id: business.id,
            name: business.name,
            email: business.email,
          },
        },
      })
    }

    // ─── Verify Token ─────────────────────────────────
    if (action === 'verify') {
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '') || body.token
      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
      }

      const decoded = verifyToken(token)
      if (!decoded) {
        return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
      }

      const business = await db.business.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true },
      })

      if (!business) {
        return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, data: { business } })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[API:Auth] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// ============================================================
// Numbers API — Phone Number Management
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { numbers } from '@/lib/telnyx'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const action = searchParams.get('action')

    if (action === 'search') {
      // Search for available numbers to buy
      const state = searchParams.get('state') || ''
      const areaCode = searchParams.get('areaCode') || ''

      const result = await numbers.search({
        country: 'US',
        state,
        areaCode,
        limit: 20,
        features: ['voice', 'sms'],
      }) as { data: Array<{ phone_number: string; region_information: Array<{ region_name: string; region_type: string }>; features: Array<{ name: string }> }> }

      return NextResponse.json({
        success: true,
        data: result.data?.map((n: { phone_number: string; region_information: Array<{ region_name: string; region_type: string }>; features: Array<{ name: string }> }) => ({
          phoneNumber: n.phone_number,
          region: n.region_information?.[0]?.region_name,
          features: n.features?.map((f: { name: string }) => f.name),
        })) || [],
      })
    }

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    // List business's numbers
    const phoneNumbers = await db.phoneNumber.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: phoneNumbers })
  } catch (error) {
    console.error('[API:Numbers] GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { businessId, action, phoneNumber, label } = body

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'businessId required' }, { status: 400 })
    }

    if (action === 'buy') {
      if (!phoneNumber) {
        return NextResponse.json({ success: false, error: 'phoneNumber required' }, { status: 400 })
      }

      // Order the number from Telnyx
      const orderResult = await numbers.order(phoneNumber) as { data: { id: string; phone_numbers: Array<{ id: string }> } }

      // Store in our DB
      const record = await db.phoneNumber.create({
        data: {
          businessId,
          phoneNumber,
          telnyxId: orderResult.data?.phone_numbers?.[0]?.id,
          label: label || 'Main Line',
          isActive: true,
        },
      })

      return NextResponse.json({ success: true, data: record })
    }

    if (action === 'add_existing') {
      // Add a number the user already owns on Telnyx
      const record = await db.phoneNumber.create({
        data: {
          businessId,
          phoneNumber,
          label: label || 'Main Line',
          isActive: true,
        },
      })

      return NextResponse.json({ success: true, data: record })
    }

    if (action === 'toggle') {
      const { numberId, isActive } = body
      const record = await db.phoneNumber.update({
        where: { id: numberId },
        data: { isActive },
      })
      return NextResponse.json({ success: true, data: record })
    }

    if (action === 'delete') {
      const { numberId } = body
      await db.phoneNumber.delete({ where: { id: numberId } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[API:Numbers] POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

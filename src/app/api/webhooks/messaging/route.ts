// ============================================================
// Messaging Webhook — Telnyx SMS Event Handler
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { messaging } from '@/lib/telnyx'
import type { TelnyxWebhookEvent, TelnyxMessagePayload } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TelnyxWebhookEvent
    const eventType = body.data.event_type
    const payload = body.data.payload as TelnyxMessagePayload

    console.log(`[Webhook:SMS] Event: ${eventType}`, {
      from: payload.from?.phone_number,
      to: payload.to?.[0]?.phone_number,
      direction: payload.direction,
    })

    switch (eventType) {
      case 'message.received': {
        const fromNumber = payload.from.phone_number
        const toNumber = payload.to[0]?.phone_number
        const messageText = payload.text

        // Find the business
        const phoneRecord = await db.phoneNumber.findUnique({
          where: { phoneNumber: toNumber },
          include: { business: { include: { settings: true } } },
        })

        if (phoneRecord) {
          // Store the message
          await db.message.create({
            data: {
              businessId: phoneRecord.businessId,
              fromNumber,
              toNumber,
              direction: 'inbound',
              body: messageText,
              status: 'received',
              telnyxMsgId: payload.id,
            },
          })

          // Handle CANCEL keyword for appointment cancellation
          if (messageText.trim().toUpperCase() === 'CANCEL') {
            const recentAppointment = await db.appointment.findFirst({
              where: {
                businessId: phoneRecord.businessId,
                callerNumber: fromNumber,
                status: 'confirmed',
                scheduledAt: { gte: new Date() },
              },
              orderBy: { scheduledAt: 'asc' },
            })

            if (recentAppointment) {
              await db.appointment.update({
                where: { id: recentAppointment.id },
                data: { status: 'cancelled' },
              })

              if (phoneRecord.business.settings?.smsFromNumber) {
                await messaging.sendSMS(
                  phoneRecord.business.settings.smsFromNumber,
                  fromNumber,
                  `Your appointment on ${recentAppointment.scheduledAt.toLocaleDateString()} has been cancelled. If you'd like to reschedule, just give us a call!`
                )
              }
            }
          }

          // Handle CONFIRM keyword
          if (messageText.trim().toUpperCase() === 'CONFIRM') {
            if (phoneRecord.business.settings?.smsFromNumber) {
              await messaging.sendSMS(
                phoneRecord.business.settings.smsFromNumber,
                fromNumber,
                `Thank you for confirming! We look forward to seeing you. 🙌`
              )
            }
          }
        }
        break
      }

      case 'message.sent':
      case 'message.delivered': {
        // Update message status
        if (payload.id) {
          await db.message.updateMany({
            where: { telnyxMsgId: payload.id },
            data: { status: eventType === 'message.delivered' ? 'delivered' : 'sent' },
          })
        }
        break
      }

      case 'message.sending_failed': {
        if (payload.id) {
          await db.message.updateMany({
            where: { telnyxMsgId: payload.id },
            data: { status: 'failed' },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('[Webhook:SMS] Error:', error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'CallMate AI Messaging Webhook Active' })
}

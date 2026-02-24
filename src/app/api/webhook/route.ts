import { NextRequest, NextResponse } from "next/server"

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Telnyx webhook structure: body.data.event_type and body.data.payload
    const eventType = body?.data?.event_type
    const payload = body?.data?.payload
    const callControlId = payload?.call_control_id
    const clientState = payload?.client_state

    console.log(`[Webhook] Event: ${eventType}, call_control_id: ${callControlId}, client_state present: ${!!clientState}`)

    // When call is answered, start the AI assistant
    if (eventType === "call.answered" && callControlId) {
      let assistantId: string | null = null

      if (clientState) {
        try {
          const decoded = JSON.parse(Buffer.from(clientState, "base64").toString())
          assistantId = decoded.assistant_id
          console.log(`[Webhook] Decoded assistant_id: ${assistantId}`)
        } catch (e) {
          console.error("[Webhook] Failed to decode client_state:", e)
        }
      }

      if (assistantId) {
        console.log(`[Webhook] Starting AI assistant ${assistantId} on call ${callControlId}`)

        const res = await fetch(
          `https://api.telnyx.com/v2/calls/${callControlId}/actions/ai_assistant_start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${TELNYX_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              assistant: { id: assistantId },
              voice: { voice: "Telnyx.NaturalHD.astra" },
              transcription: { model: "distil-whisper/distil-large-v2", language: "auto" },
            }),
          }
        )

        const data = await res.json()
        console.log(`[Webhook] ai_assistant_start response (${res.status}):`, JSON.stringify(data))
      } else {
        console.log("[Webhook] No assistant_id found, skipping")
      }
    }

    // Also handle call.initiated - answer outbound calls
    if (eventType === "call.initiated" && callControlId && payload?.direction === "outgoing") {
      console.log(`[Webhook] Outgoing call initiated, will wait for answer event`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("[Webhook] Error:", error)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telnyx Voice AI Webhook Active" })
}

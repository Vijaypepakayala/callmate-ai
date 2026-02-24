import { NextRequest, NextResponse } from "next/server"

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body?.data?.event_type
    const payload = body?.data?.payload

    console.log(`[Webhook] Event: ${eventType}`)

    // When the call is answered, start the AI assistant
    if (eventType === "call.answered" && payload?.call_control_id) {
      const clientState = payload.client_state
        ? JSON.parse(Buffer.from(payload.client_state, "base64").toString())
        : null

      if (clientState?.assistant_id) {
        console.log(`[Webhook] Starting AI assistant: ${clientState.assistant_id}`)

        const res = await fetch(
          `https://api.telnyx.com/v2/calls/${payload.call_control_id}/actions/ai_assistant_start`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${TELNYX_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              assistant_id: clientState.assistant_id,
            }),
          }
        )

        const data = await res.json()
        if (!res.ok) {
          console.error("[Webhook] Failed to start AI assistant:", data)
        } else {
          console.log("[Webhook] AI assistant started successfully")
        }
      }
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

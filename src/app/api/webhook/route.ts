import { createHash } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { DEMOS, demoForNumber, isDemoId, type DemoId } from "@/lib/demo-config"

function commandId(callControlId: string, action: string): string {
  const hex = createHash("sha256").update(`${callControlId}:${action}`).digest("hex")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

async function callAction(callControlId: string, action: string, body: Record<string, unknown>) {
  const response = await fetch(`https://api.telnyx.com/v2/calls/${encodeURIComponent(callControlId)}/actions/${action}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, command_id: commandId(callControlId, action) }),
  })
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    console.error(`[Webhook] ${action} failed`, response.status, result?.errors?.map((e: { code?: string }) => e.code))
  }
  return response.ok
}

function demoFromClientState(clientState: unknown): DemoId | null {
  if (typeof clientState !== "string") return null
  try {
    const data = JSON.parse(Buffer.from(clientState, "base64").toString("utf8"))
    return isDemoId(data?.use_case) ? data.use_case : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELNYX_WEBHOOK_SECRET
  if (secret && request.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  let event: { data?: { event_type?: string; payload?: { call_control_id?: string; client_state?: string; direction?: string; to?: string } } }
  try {
    event = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const type = event.data?.event_type
  const payload = event.data?.payload
  const callControlId = payload?.call_control_id
  if (!callControlId || !type) return NextResponse.json({ received: true })

  try {
    if (type === "call.initiated" && payload.direction === "incoming") {
      const demo = demoForNumber(payload.to)
      if (!demo) {
        console.error("[Webhook] Inbound call to an unmapped number")
        return NextResponse.json({ received: true })
      }
      const clientState = Buffer.from(JSON.stringify({ use_case: demo })).toString("base64")
      const ok = await callAction(callControlId, "answer", { client_state: clientState })
      return NextResponse.json({ received: ok }, { status: ok ? 200 : 502 })
    }

    if (type === "call.answered") {
      const demo = demoFromClientState(payload.client_state) || demoForNumber(payload.to)
      if (!demo) {
        console.error("[Webhook] Answered call without a known demo")
        return NextResponse.json({ received: true })
      }
      const ok = await callAction(callControlId, "ai_assistant_start", { assistant: { id: DEMOS[demo] } })
      if (ok) console.log(`[Webhook] Started ${demo} assistant`)
      return NextResponse.json({ received: ok }, { status: ok ? 200 : 502 })
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Webhook] Command failed", error)
    return NextResponse.json({ received: false }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telnyx Voice AI Webhook Active" })
}

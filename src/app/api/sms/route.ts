import { NextRequest, NextResponse } from "next/server"
import { DEMOS, demoForNumber } from "@/lib/demo-config"

type Address = string | { phone_number?: string }

function number(value: Address | Address[] | undefined): string | null {
  if (Array.isArray(value)) return number(value[0])
  if (typeof value === "string") return value
  return value?.phone_number || null
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELNYX_WEBHOOK_SECRET
  if (!secret || request.nextUrl.searchParams.get("token") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  let event: { data?: { event_type?: string; payload?: { from?: Address; to?: Address[]; text?: string } } }
  try {
    event = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (event.data?.event_type !== "message.received") return NextResponse.json({ received: true })
  const from = number(event.data.payload?.from)
  const to = number(event.data.payload?.to)
  const demo = demoForNumber(to)
  if (!from || !to || !demo) return NextResponse.json({ received: true })
  if (/^(STOP|UNSUBSCRIBE|CANCEL|END|QUIT|HELP|START)$/i.test(event.data.payload?.text?.trim() || "")) {
    return NextResponse.json({ received: true })
  }
  const response = await fetch(`https://api.telnyx.com/v2/ai/assistants/${DEMOS[demo]}/chat/sms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: to, to: from }),
  })
  if (!response.ok) {
    console.error("[SMS] Assistant reply failed", demo, response.status)
    return NextResponse.json({ received: false }, { status: 502 })
  }
  return NextResponse.json({ received: true })
}

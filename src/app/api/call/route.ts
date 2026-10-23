import { NextRequest, NextResponse } from "next/server"
import { DEMOS, demoNumbers, isDemoId } from "@/lib/demo-config"

// Short-term demo guard. A persistent store is needed before open public traffic.
const rateLimitMap = new Map<string, number[]>()

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown"
  const now = Date.now()
  const recent = (rateLimitMap.get(ip) || []).filter((time) => now - time < 3600000)
  rateLimitMap.set(ip, recent)
  if (recent.length >= 3) {
    return NextResponse.json({ error: "Rate limit exceeded. Max 3 calls per hour." }, { status: 429 })
  }

  let body: { phoneNumber?: unknown; useCase?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }
  const phone = typeof body?.phoneNumber === "string" ? body.phoneNumber.replace(/[\s()-]/g, "") : ""
  if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number with country code." }, { status: 400 })
  }
  if (!isDemoId(body?.useCase)) {
    return NextResponse.json({ error: "Invalid use case." }, { status: 400 })
  }

  const apiKey = process.env.TELNYX_API_KEY
  const connectionId = process.env.TELNYX_CALL_CONTROL_APP_ID
  const from = demoNumbers()[body.useCase]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://callmate-ai-omega.vercel.app"
  const webhookSecret = process.env.TELNYX_WEBHOOK_SECRET
  if (!apiKey || !connectionId || !from || !webhookSecret) {
    console.error("[API:call] Telnyx configuration is incomplete")
    return NextResponse.json({ error: "Calling is temporarily unavailable." }, { status: 503 })
  }

  const clientState = Buffer.from(JSON.stringify({ use_case: body.useCase })).toString("base64")
  try {
    const response = await fetch("https://api.telnyx.com/v2/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        to: phone,
        from,
        answering_machine_detection: "disabled",
        client_state: clientState,
        webhook_url: `${baseUrl.replace(/\/$/, "")}/api/webhook?token=${encodeURIComponent(webhookSecret)}`,
        webhook_url_method: "POST",
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error("[API:call] Telnyx dial failed", response.status, result?.errors?.map((e: { code?: string }) => e.code))
      return NextResponse.json({ error: "Failed to initiate call. Please try again." }, { status: 502 })
    }
    recent.push(Date.now())
    return NextResponse.json({
      success: true,
      message: "Call initiated! Pick up your phone.",
      callControlId: result.data?.call_control_id,
      demo: body.useCase,
      assistantId: DEMOS[body.useCase],
    })
  } catch (error) {
    console.error("[API:call] Dial request failed", error)
    return NextResponse.json({ error: "Calling is temporarily unavailable." }, { status: 502 })
  }
}

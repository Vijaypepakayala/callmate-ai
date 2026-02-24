import { NextRequest, NextResponse } from "next/server"

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!
const FROM_NUMBER = "+27101579079"
const CONNECTION_ID = "2902230293131822598"

const ASSISTANT_MAP: Record<string, string> = {
  clinicmate: "assistant-5df07b81-fe5d-489f-ac82-c8679bbbfe2b",
  orderai: "assistant-a974e21f-b039-4e2b-9b60-192c5b71a98d",
  debtshield: "assistant-d6bd4d43-e0ff-46f7-9c49-459029734423",
  propbot: "assistant-1b18fd4b-ad02-463f-b541-c1604829230e",
  tutorcall: "assistant-c2360316-580a-4e9d-924b-a51fa0fc4e8c",
  recruitai: "assistant-42b7b64d-14ad-4d2b-ac47-0233e155b561",
  fitcall: "assistant-0fb9a725-3036-47d0-aedd-2b629fffb030",
  legalease: "assistant-881e0fcc-745e-4373-8363-9a95a8c8db05",
}

// Simple in-memory rate limiter: 3 calls per IP per hour
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < hour)
  rateLimitMap.set(ip, timestamps)
  return timestamps.length >= 3
}

function recordCall(ip: string) {
  const timestamps = rateLimitMap.get(ip) || []
  timestamps.push(Date.now())
  rateLimitMap.set(ip, timestamps)
}

async function pollCallStatus(callControlId: string, maxAttempts: number = 30): Promise<boolean> {
  // Poll by attempting ai_assistant_start until the call is answered
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 1000))
    
    const res = await fetch(
      `https://api.telnyx.com/v2/calls/${callControlId}/actions/ai_assistant_start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TELNYX_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistant: { id: "assistant-42b7b64d-14ad-4d2b-ac47-0233e155b561" },
        }),
      }
    )
    const data = await res.json()
    
    if (res.ok) return true
    
    const code = data?.errors?.[0]?.code
    if (code === "90034") continue // not answered yet
    if (code === "90018") return false // call ended
    return false // unknown error
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 3 calls per hour." },
        { status: 429 }
      )
    }

    const { phoneNumber, useCase } = await request.json()

    if (
      !phoneNumber ||
      typeof phoneNumber !== "string" ||
      !phoneNumber.startsWith("+") ||
      phoneNumber.replace(/\D/g, "").length < 10
    ) {
      return NextResponse.json(
        { error: "Invalid phone number. Must start with + and have at least 10 digits." },
        { status: 400 }
      )
    }

    const assistantId = ASSISTANT_MAP[useCase]
    if (!assistantId) {
      return NextResponse.json(
        { error: "Invalid use case." },
        { status: 400 }
      )
    }

    const clientState = Buffer.from(
      JSON.stringify({ assistant_id: assistantId, use_case: useCase })
    ).toString("base64")

    // Initiate outbound call
    const callRes = await fetch("https://api.telnyx.com/v2/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        connection_id: CONNECTION_ID,
        to: phoneNumber.replace(/\s/g, ""),
        from: FROM_NUMBER,
        answering_machine_detection: "disabled",
        client_state: clientState,
        webhook_url: "https://callmate-ai-omega.vercel.app/api/webhook",
        webhook_url_method: "POST",
      }),
    })

    const callData = await callRes.json()

    if (!callRes.ok) {
      console.error("[API:call] Telnyx error:", callData)
      return NextResponse.json(
        { error: "Failed to initiate call. Please try again." },
        { status: 500 }
      )
    }

    recordCall(ip)

    return NextResponse.json({
      success: true,
      message: "Call initiated! Pick up your phone.",
      callControlId: callData.data?.call_control_id,
    })
  } catch (error) {
    console.error("[API:call] Error:", error)
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    )
  }
}

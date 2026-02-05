import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'CallMate AI API' })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'CallMate AI API' })
}

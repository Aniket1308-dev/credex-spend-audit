import { NextResponse } from "next/server"
import { AuditInput, AuditResult } from "@/lib/auditEngine"
import { generatePersonalizedSummary } from "@/lib/summary"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      input?: AuditInput
      result?: AuditResult
    }

    if (!body.input || !body.result) {
      return NextResponse.json({ error: "Missing audit input or result." }, { status: 400 })
    }

    const summary = await generatePersonalizedSummary(body.input, body.result)

    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: "Could not generate summary." }, { status: 500 })
  }
}

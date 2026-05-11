import { NextResponse } from "next/server"
import { AuditInput, AuditResult } from "@/lib/auditEngine"
import { createAuditSlug, saveAudit } from "@/lib/auditStore"
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
    const slug = createAuditSlug()
    const audit = await saveAudit({
      slug,
      input: body.input,
      result: {
        ...body.result,
        summary,
      },
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      audit,
      shareUrl: `/audit/${audit.slug}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save audit."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { AuditInput, AuditResult } from "@/lib/auditEngine"

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

export function buildSummaryFallback(result: AuditResult) {
  if (result.estimatedMonthlySavings > 500) {
    return `Your AI stack has a meaningful optimization opportunity: $${result.estimatedMonthlySavings}/mo, or $${result.estimatedAnnualSavings}/year. The biggest wins are likely to come from cleaning up inactive seats, downgrading oversized plans, and reviewing high API usage before the next renewal. Because the savings are above $500/mo, this is also a strong fit for a Credex review, especially if discounted credits can replace retail spend.`
  }

  if (result.estimatedMonthlySavings < 100) {
    return `Your AI spend looks disciplined. The audit found only $${result.estimatedMonthlySavings}/mo in obvious savings against $${result.totalMonthlySpend}/mo in current spend, so there is no need to force a downgrade just to create activity. The best next step is to keep monitoring seats before renewals and sign up for alerts when pricing or credit opportunities change for your stack.`
  }

  return `Your AI stack has a practical savings opportunity of $${result.estimatedMonthlySavings}/mo, or $${result.estimatedAnnualSavings}/year. The strongest next step is to clean up paid seats that are not active and downgrade any plan that is sized for a larger team than yours. This is not a full procurement overhaul yet, but it is enough to justify reviewing invoices before the next billing cycle.`
}

export async function generatePersonalizedSummary(input: AuditInput, result: AuditResult) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return buildSummaryFallback(result)

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
        max_tokens: 180,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: `Write a concise, specific ~100-word AI spend audit summary for a startup founder. Do not do any math. Use only these already-computed numbers and recommendations. Be honest if savings are low. Mention Credex only if monthly savings are above $500.\n\nInput:\n${JSON.stringify(input)}\n\nAudit result:\n${JSON.stringify(result)}`,
          },
        ],
      }),
    })

    if (!response.ok) return buildSummaryFallback(result)

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>
    }
    const summary = data.content?.find((item) => item.type === "text")?.text?.trim()

    return summary || buildSummaryFallback(result)
  } catch {
    return buildSummaryFallback(result)
  }
}

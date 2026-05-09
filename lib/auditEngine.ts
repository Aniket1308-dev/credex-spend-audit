import { getPricingPlan, getPricingTool, type UseCase } from "@/lib/pricingData"

export type AuditToolInput = {
  id: string
  toolId: string
  planId: string
  monthlySpend: number
  seats: number
  activeUsers: number
}

export type AuditInput = {
  teamSize: number
  useCase: UseCase
  tools: AuditToolInput[]
}

export type AuditRecommendation = {
  type: "seats" | "downgrade" | "api-review" | "switch"
  title: string
  detail: string
  monthlySavings: number
}

export type ToolAuditResult = AuditToolInput & {
  toolName: string
  planName: string
  utilization: number
  wastedMonthlySpend: number
  riskLevel: "low" | "medium" | "high"
  recommendations: AuditRecommendation[]
}

export type SavingsTier = "high" | "medium" | "low" | "optimal"

export type AuditResult = {
  totalMonthlySpend: number
  totalMonthlySavings: number
  annualSavings: number
  utilization: number
  savingsTier: SavingsTier
  headline: string
  upsellMessage: string
  tools: ToolAuditResult[]
}

function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function getSavingsTier(savings: number): SavingsTier {
  if (savings >= 500) return "high"
  if (savings >= 250) return "medium"
  if (savings >= 100) return "low"
  return "optimal"
}

function getCheaperAlternative(toolId: string, useCase: UseCase) {
  const codingAlternatives = new Set(["cursor", "github-copilot", "windsurf"])
  const assistantAlternatives = new Set(["chatgpt", "claude", "gemini"])

  if (useCase === "coding" && assistantAlternatives.has(toolId)) {
    return "GitHub Copilot or Cursor"
  }

  if ((useCase === "writing" || useCase === "research") && codingAlternatives.has(toolId)) {
    return "Claude, ChatGPT, or Gemini"
  }

  return null
}

export function runAudit(input: AuditInput): AuditResult {
  const auditedTools = input.tools.map((tool): ToolAuditResult => {
    const pricingTool = getPricingTool(tool.toolId)
    const pricingPlan = getPricingPlan(tool.toolId, tool.planId)
    const toolName = pricingTool?.name ?? "Unknown tool"
    const planName = pricingPlan?.name ?? "Custom plan"
    const safeSeats = Math.max(tool.seats, 1)
    const safeActiveUsers = Math.max(tool.activeUsers, 0)
    const utilization = Math.min(Math.round((safeActiveUsers / safeSeats) * 100), 100)
    const recommendations: AuditRecommendation[] = []

    const unusedSeats = Math.max(tool.seats - tool.activeUsers, 0)
    const spendPerSeat = tool.seats > 0 ? tool.monthlySpend / tool.seats : tool.monthlySpend

    if (tool.seats > input.teamSize) {
      const extraSeats = tool.seats - input.teamSize
      recommendations.push({
        type: "seats",
        title: "Seat count exceeds team size",
        detail: `Reduce ${extraSeats} seat${extraSeats === 1 ? "" : "s"} so this tool matches your ${input.teamSize}-person team.`,
        monthlySavings: Math.round(extraSeats * spendPerSeat),
      })
    } else if (unusedSeats > 0 && utilization < 75) {
      recommendations.push({
        type: "seats",
        title: "Unused seats are inflating spend",
        detail: `Remove ${unusedSeats} inactive seat${unusedSeats === 1 ? "" : "s"} or reassign them to active teammates.`,
        monthlySavings: Math.round(unusedSeats * spendPerSeat),
      })
    }

    const lowerPlan = pricingTool?.plans
      .filter((plan) => plan.rank < (pricingPlan?.rank ?? 0))
      .sort((a, b) => b.rank - a.rank)[0]

    if (pricingPlan && lowerPlan && pricingPlan.rank >= 3 && utilization < 80) {
      const downgradeSavings = Math.max((pricingPlan.monthlyPrice - lowerPlan.monthlyPrice) * safeSeats, 0)
      recommendations.push({
        type: "downgrade",
        title: "Plan looks overqualified",
        detail: `${planName} may be more than this team needs. Try ${lowerPlan.name} for the next billing cycle.`,
        monthlySavings: Math.round(downgradeSavings),
      })
    }

    if (pricingTool?.category === "api" && tool.monthlySpend >= 300) {
      recommendations.push({
        type: "api-review",
        title: "API spend needs a usage review",
        detail: "Check prompts, caching, model choice, and failed requests before adding more budget.",
        monthlySavings: Math.round(tool.monthlySpend * 0.18),
      })
    }

    const alternative = getCheaperAlternative(tool.toolId, input.useCase)
    if (alternative && tool.monthlySpend >= 100) {
      recommendations.push({
        type: "switch",
        title: "Tool may not fit the main use case",
        detail: `For ${input.useCase} work, compare this against ${alternative} before renewal.`,
        monthlySavings: Math.round(tool.monthlySpend * 0.15),
      })
    }

    const uniqueSavings = Math.min(
      Math.round(recommendations.reduce((sum, recommendation) => sum + recommendation.monthlySavings, 0)),
      tool.monthlySpend
    )

    return {
      ...tool,
      toolName,
      planName,
      utilization,
      wastedMonthlySpend: uniqueSavings,
      riskLevel: uniqueSavings >= 250 || utilization < 40 ? "high" : uniqueSavings >= 100 || utilization < 70 ? "medium" : "low",
      recommendations,
    }
  })

  const totalMonthlySpend = Math.round(input.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0))
  const totalMonthlySavings = Math.round(auditedTools.reduce((sum, tool) => sum + tool.wastedMonthlySpend, 0))
  const totalSeats = input.tools.reduce((sum, tool) => sum + tool.seats, 0)
  const totalActiveUsers = input.tools.reduce((sum, tool) => sum + tool.activeUsers, 0)
  const savingsTier = getSavingsTier(totalMonthlySavings)

  return {
    totalMonthlySpend,
    totalMonthlySavings,
    annualSavings: totalMonthlySavings * 12,
    utilization: totalSeats > 0 ? Math.round((totalActiveUsers / totalSeats) * 100) : 0,
    savingsTier,
    headline:
      savingsTier === "optimal"
        ? "You're spending well."
        : `You could save ${currency(totalMonthlySavings)}/mo on AI tools.`,
    upsellMessage:
      totalMonthlySavings >= 500
        ? "Credex can turn this audit into vendor cuts, renewal strategy, and founder-ready savings in one sprint."
        : totalMonthlySavings < 100
          ? "Your AI stack is lean. Keep reviewing seats before each renewal."
          : "Prioritize the highest-risk renewals first, then re-check usage next month.",
    tools: auditedTools,
  }
}

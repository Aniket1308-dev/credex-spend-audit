import {
  getPlanPricing,
  getToolPricing,
  TOOL_PRICING,
  ToolId,
  UseCase,
} from "@/lib/pricingData"

export type AuditInputTool = {
  id: string
  toolId: ToolId
  planId: string
  monthlySpend: number
  totalSeats: number
  activeUsers: number
}

export type AuditInput = {
  teamSize: number
  useCase: UseCase
  tools: AuditInputTool[]
}

export type AuditRecommendation = {
  rule: "unused-seats" | "overqualified-plan" | "api-review" | "switch-tool" | "credits"
  title: string
  detail: string
  monthlySavings: number
}

export type ToolAudit = AuditInputTool & {
  toolName: string
  planName: string
  utilizationRate: number
  risk: "low" | "medium" | "high"
  monthlySavings: number
  annualSavings: number
  recommendations: AuditRecommendation[]
}

export type AuditResult = {
  totalMonthlySpend: number
  totalAnnualSpend: number
  estimatedMonthlySavings: number
  estimatedAnnualSavings: number
  savingsTier: "high" | "medium" | "low" | "optimal"
  summary: string
  tools: ToolAudit[]
}

export function runAudit(input: AuditInput): AuditResult {
  const tools = input.tools.map((tool) => auditTool(tool, input.teamSize, input.useCase))
  const totalMonthlySpend = roundMoney(tools.reduce((sum, tool) => sum + tool.monthlySpend, 0))
  const estimatedMonthlySavings = roundMoney(tools.reduce((sum, tool) => sum + tool.monthlySavings, 0))

  return {
    totalMonthlySpend,
    totalAnnualSpend: roundMoney(totalMonthlySpend * 12),
    estimatedMonthlySavings,
    estimatedAnnualSavings: roundMoney(estimatedMonthlySavings * 12),
    savingsTier: getSavingsTier(estimatedMonthlySavings),
    summary: buildFallbackSummary(estimatedMonthlySavings, totalMonthlySpend),
    tools,
  }
}

function auditTool(tool: AuditInputTool, teamSize: number, useCase: UseCase): ToolAudit {
  const pricing = getToolPricing(tool.toolId)
  const plan = getPlanPricing(tool.toolId, tool.planId)
  const billableSeats = Math.max(tool.totalSeats, 1)
  const activeUsers = Math.max(tool.activeUsers, 0)
  const utilizationRate = Math.min(100, Math.round((activeUsers / billableSeats) * 100))
  const recommendations: AuditRecommendation[] = []

  const unusedSeats = Math.max(tool.totalSeats - activeUsers, 0)
  if (plan?.billingUnit === "seat" && unusedSeats > 0) {
    recommendations.push({
      rule: "unused-seats",
      title: "Trim unused seats",
      detail: `${unusedSeats} of ${tool.totalSeats} paid seats appear inactive. Keep seats close to active users and re-add only when usage returns.`,
      monthlySavings: unusedSeats * plan.monthlyPrice,
    })
  }

  if (plan?.minimumSeats && teamSize < plan.minimumSeats) {
    const downgrade = pricing?.plans
      .filter((candidate) => candidate.billingUnit === "seat")
      .filter((candidate) => candidate.monthlyPrice < plan.monthlyPrice)
      .filter((candidate) => !candidate.minimumSeats || teamSize >= candidate.minimumSeats)
      .sort((a, b) => b.monthlyPrice - a.monthlyPrice)[0]

    if (downgrade) {
      recommendations.push({
        rule: "overqualified-plan",
        title: "Downgrade the plan",
        detail: `${plan.name} is built for larger teams. ${downgrade.name} fits a ${teamSize}-person team with similar core capability.`,
        monthlySavings: Math.max((plan.monthlyPrice - downgrade.monthlyPrice) * Math.max(activeUsers, 1), 0),
      })
    }
  }

  if ((pricing?.category === "api" || plan?.billingUnit === "usage") && tool.monthlySpend >= 250) {
    recommendations.push({
      rule: "api-review",
      title: "Review API usage",
      detail: "High direct API spend is worth checking for model mix, prompt caching, batch jobs, and stale background usage.",
      monthlySavings: Math.round(tool.monthlySpend * 0.2),
    })
  }

  const alternative = findCheaperAlternative(tool.toolId, useCase, tool.monthlySpend, activeUsers)
  if (alternative) {
    recommendations.push({
      rule: "switch-tool",
      title: "Consider a cheaper fit",
      detail: `${alternative.toolName} ${alternative.planName} is a lower-cost fit for ${useCase} work at this team size.`,
      monthlySavings: alternative.savings,
    })
  }

  if (tool.monthlySpend > 500 && ["cursor", "claude", "chatgpt"].includes(tool.toolId)) {
    recommendations.push({
      rule: "credits",
      title: "Check discounted credits",
      detail: "This spend is large enough that discounted credits or a negotiated procurement path can matter more than small plan tweaks.",
      monthlySavings: Math.round(tool.monthlySpend * 0.15),
    })
  }

  const monthlySavings = roundMoney(Math.min(tool.monthlySpend, recommendations.reduce((sum, item) => sum + item.monthlySavings, 0)))

  return {
    ...tool,
    toolName: pricing?.name ?? "Unknown tool",
    planName: plan?.name ?? "Unknown plan",
    utilizationRate,
    risk: getRisk(monthlySavings, utilizationRate),
    monthlySavings,
    annualSavings: roundMoney(monthlySavings * 12),
    recommendations,
  }
}

function findCheaperAlternative(toolId: ToolId, useCase: UseCase, monthlySpend: number, activeUsers: number) {
  const candidates = TOOL_PRICING.flatMap((tool) =>
    tool.plans
      .filter(() => tool.id !== toolId)
      .filter((plan) => plan.billingUnit === "seat")
      .filter((plan) => plan.bestFor.includes(useCase))
      .map((plan) => ({
        toolName: tool.name,
        planName: plan.name,
        estimatedSpend: plan.monthlyPrice * Math.max(activeUsers, 1),
      }))
  ).sort((a, b) => a.estimatedSpend - b.estimatedSpend)

  const best = candidates[0]
  if (!best || monthlySpend - best.estimatedSpend < 100) return null

  return {
    ...best,
    savings: roundMoney(monthlySpend - best.estimatedSpend),
  }
}

function getRisk(monthlySavings: number, utilizationRate: number): ToolAudit["risk"] {
  if (monthlySavings >= 250 || utilizationRate < 50) return "high"
  if (monthlySavings >= 100 || utilizationRate < 75) return "medium"
  return "low"
}

function getSavingsTier(savings: number): AuditResult["savingsTier"] {
  if (savings > 500) return "high"
  if (savings >= 100) return "medium"
  if (savings > 0) return "low"
  return "optimal"
}

function buildFallbackSummary(savings: number, spend: number) {
  if (savings > 500) {
    return `This stack shows $${savings}/mo in likely savings against $${spend}/mo of AI spend. The largest opportunities should be reviewed before renewal, especially unused seats, oversized plans, API usage, and discounted credit options.`
  }

  if (savings < 100) {
    return `You are spending well. The audit found only $${savings}/mo in obvious savings against $${spend}/mo of AI spend, so there is no need to force a downgrade just to show activity.`
  }

  return `This audit found $${savings}/mo in practical savings against $${spend}/mo of AI spend. The best next step is to clean up seats and downgrade any plan that is oversized for current usage.`
}

function roundMoney(value: number) {
  return Math.max(0, Math.round(value))
}


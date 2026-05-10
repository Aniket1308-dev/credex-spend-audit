export type UseCase = "coding" | "writing" | "data" | "research" | "mixed"

export type ToolId =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf"

export type BillingUnit = "seat" | "usage" | "custom"

export type PricingPlan = {
  id: string
  name: string
  monthlyPrice: number
  billingUnit: BillingUnit
  bestFor: UseCase[]
  minimumSeats?: number
  notes?: string
}

export type ToolPricing = {
  id: ToolId
  name: string
  category: "assistant" | "ide" | "api"
  plans: PricingPlan[]
}

export const USE_CASE_LABELS: Record<UseCase, string> = {
  coding: "Coding",
  writing: "Writing",
  data: "Data analysis",
  research: "Research",
  mixed: "Mixed work",
}

export const TOOL_PRICING: ToolPricing[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "ide",
    plans: [
      { id: "hobby", name: "Hobby", monthlyPrice: 0, billingUnit: "seat", bestFor: ["coding"] },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingUnit: "seat", bestFor: ["coding"] },
      { id: "business", name: "Business / Teams", monthlyPrice: 40, billingUnit: "seat", bestFor: ["coding"], minimumSeats: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 0, billingUnit: "custom", bestFor: ["coding"], minimumSeats: 25, notes: "Custom contract. Enter invoice spend manually." },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "ide",
    plans: [
      { id: "individual", name: "Individual / Pro", monthlyPrice: 10, billingUnit: "seat", bestFor: ["coding"] },
      { id: "business", name: "Business", monthlyPrice: 19, billingUnit: "seat", bestFor: ["coding"], minimumSeats: 2 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 39, billingUnit: "seat", bestFor: ["coding"], minimumSeats: 20 },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    category: "assistant",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["writing", "research"] },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingUnit: "seat", bestFor: ["writing", "research", "coding"] },
      { id: "max-5x", name: "Max 5x", monthlyPrice: 100, billingUnit: "seat", bestFor: ["coding", "writing", "research"] },
      { id: "max-20x", name: "Max 20x", monthlyPrice: 200, billingUnit: "seat", bestFor: ["coding", "writing", "research"] },
      { id: "team", name: "Team", monthlyPrice: 30, billingUnit: "seat", bestFor: ["writing", "research", "mixed"], minimumSeats: 5 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 20, billingUnit: "seat", bestFor: ["mixed", "research"], minimumSeats: 25, notes: "Seat fee only; usage billed separately." },
      { id: "api-direct", name: "API direct", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "research", "mixed"], notes: "Usage-based. Enter invoice spend manually." },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "assistant",
    plans: [
      { id: "plus", name: "Plus", monthlyPrice: 20, billingUnit: "seat", bestFor: ["writing", "research", "coding"] },
      { id: "pro", name: "Pro", monthlyPrice: 200, billingUnit: "seat", bestFor: ["coding", "data", "research"] },
      { id: "business", name: "Business", monthlyPrice: 30, billingUnit: "seat", bestFor: ["mixed", "data", "writing"], minimumSeats: 2 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 0, billingUnit: "custom", bestFor: ["mixed", "data"], minimumSeats: 25, notes: "Custom pricing. Enter invoice spend manually." },
      { id: "api-direct", name: "API direct", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "data", "mixed"], notes: "Usage-based. Enter invoice spend manually." },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API direct",
    category: "api",
    plans: [
      { id: "usage", name: "Usage-based", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "research", "mixed"], notes: "Enter invoice spend manually." },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API direct",
    category: "api",
    plans: [
      { id: "usage", name: "Usage-based", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "data", "mixed"], notes: "Enter invoice spend manually." },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "assistant",
    plans: [
      { id: "pro", name: "Google AI Pro", monthlyPrice: 20, billingUnit: "seat", bestFor: ["research", "writing", "data"] },
      { id: "ultra", name: "Google AI Ultra", monthlyPrice: 250, billingUnit: "seat", bestFor: ["research", "data", "mixed"] },
      { id: "api", name: "Gemini API", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "data", "research", "mixed"], notes: "Usage-based. Enter invoice spend manually." },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "ide",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["coding"] },
      { id: "pro", name: "Pro", monthlyPrice: 15, billingUnit: "seat", bestFor: ["coding"] },
      { id: "teams", name: "Teams", monthlyPrice: 30, billingUnit: "seat", bestFor: ["coding"], minimumSeats: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 0, billingUnit: "custom", bestFor: ["coding"], minimumSeats: 25, notes: "Custom contract. Enter invoice spend manually." },
    ],
  },
]

export function getToolPricing(toolId: ToolId) {
  return TOOL_PRICING.find((tool) => tool.id === toolId)
}

export function getPlanPricing(toolId: ToolId, planId: string) {
  return getToolPricing(toolId)?.plans.find((plan) => plan.id === planId)
}

export function estimatePlanSpend(toolId: ToolId, planId: string, seats: number) {
  const plan = getPlanPricing(toolId, planId)
  if (!plan || plan.billingUnit !== "seat") return 0
  return plan.monthlyPrice * Math.max(seats, 1)
}

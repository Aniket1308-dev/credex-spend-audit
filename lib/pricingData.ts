export type UseCase = "coding" | "writing" | "data" | "research" | "mixed"

export type PricingPlan = {
  id: string
  name: string
  monthlyPrice: number
  billingUnit: "seat" | "workspace" | "usage"
  bestFor: UseCase[]
  rank: number
}

export type PricingTool = {
  id: string
  name: string
  category: "assistant" | "coding" | "api" | "agent"
  plans: PricingPlan[]
}

export const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
]

export const PRICING_TOOLS: PricingTool[] = [
  {
    id: "cursor",
    name: "Cursor",
    category: "coding",
    plans: [
      { id: "hobby", name: "Hobby", monthlyPrice: 0, billingUnit: "seat", bestFor: ["coding"], rank: 1 },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingUnit: "seat", bestFor: ["coding"], rank: 2 },
      { id: "business", name: "Business", monthlyPrice: 40, billingUnit: "seat", bestFor: ["coding"], rank: 3 },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "coding",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["coding"], rank: 1 },
      { id: "pro", name: "Pro", monthlyPrice: 10, billingUnit: "seat", bestFor: ["coding"], rank: 2 },
      { id: "business", name: "Business", monthlyPrice: 19, billingUnit: "seat", bestFor: ["coding"], rank: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 39, billingUnit: "seat", bestFor: ["coding"], rank: 4 },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    category: "assistant",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["writing", "research"], rank: 1 },
      { id: "pro", name: "Pro", monthlyPrice: 20, billingUnit: "seat", bestFor: ["writing", "research", "coding"], rank: 2 },
      { id: "team", name: "Team", monthlyPrice: 30, billingUnit: "seat", bestFor: ["mixed", "research", "writing"], rank: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 60, billingUnit: "seat", bestFor: ["mixed"], rank: 4 },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    category: "assistant",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["writing", "research"], rank: 1 },
      { id: "plus", name: "Plus", monthlyPrice: 20, billingUnit: "seat", bestFor: ["writing", "research", "data"], rank: 2 },
      { id: "team", name: "Team", monthlyPrice: 30, billingUnit: "seat", bestFor: ["mixed", "data", "writing"], rank: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 60, billingUnit: "seat", bestFor: ["mixed"], rank: 4 },
    ],
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "api",
    plans: [
      { id: "usage", name: "Usage based", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "research", "mixed"], rank: 2 },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    category: "api",
    plans: [
      { id: "usage", name: "Usage based", monthlyPrice: 0, billingUnit: "usage", bestFor: ["coding", "writing", "data", "research", "mixed"], rank: 2 },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    category: "assistant",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["research", "writing"], rank: 1 },
      { id: "advanced", name: "Advanced", monthlyPrice: 20, billingUnit: "seat", bestFor: ["research", "writing", "data"], rank: 2 },
      { id: "business", name: "Business", monthlyPrice: 24, billingUnit: "seat", bestFor: ["mixed", "data"], rank: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 36, billingUnit: "seat", bestFor: ["mixed"], rank: 4 },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    category: "agent",
    plans: [
      { id: "free", name: "Free", monthlyPrice: 0, billingUnit: "seat", bestFor: ["coding"], rank: 1 },
      { id: "pro", name: "Pro", monthlyPrice: 15, billingUnit: "seat", bestFor: ["coding"], rank: 2 },
      { id: "teams", name: "Teams", monthlyPrice: 30, billingUnit: "seat", bestFor: ["coding", "mixed"], rank: 3 },
      { id: "enterprise", name: "Enterprise", monthlyPrice: 60, billingUnit: "seat", bestFor: ["mixed"], rank: 4 },
    ],
  },
]

export function getPricingTool(toolId: string) {
  return PRICING_TOOLS.find((tool) => tool.id === toolId)
}

export function getPricingPlan(toolId: string, planId: string) {
  return getPricingTool(toolId)?.plans.find((plan) => plan.id === planId)
}

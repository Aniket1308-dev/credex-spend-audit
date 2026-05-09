"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { AuditInput, AuditToolInput } from "@/lib/auditEngine"
import { PRICING_TOOLS, USE_CASE_OPTIONS, getPricingPlan, getPricingTool, type UseCase } from "@/lib/pricingData"
import { Plus, Trash2 } from "lucide-react"

const STORAGE_KEY = "credex-ai-spend-form"

type FormState = {
  teamSize: string
  useCase: UseCase
  tools: AuditToolInput[]
  draft: {
    toolId: string
    planId: string
    seats: string
    activeUsers: string
    monthlySpend: string
  }
}

const defaultTool = PRICING_TOOLS[0]
const defaultPlan = defaultTool.plans[0]

const DEFAULT_STATE: FormState = {
  teamSize: "10",
  useCase: "coding",
  tools: [],
  draft: {
    toolId: defaultTool.id,
    planId: defaultPlan.id,
    seats: "10",
    activeUsers: "7",
    monthlySpend: String(defaultPlan.monthlyPrice * 10),
  },
}

function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function parsePositiveInt(value: string) {
  return Math.max(Number.parseInt(value, 10) || 0, 0)
}

export default function SpendForm({
  onSubmit,
}: {
  onSubmit: (input: AuditInput) => void
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE)
  const hasLoadedSavedForm = useRef(false)

  const selectedTool = getPricingTool(form.draft.toolId) ?? defaultTool
  const selectedPlan = getPricingPlan(form.draft.toolId, form.draft.planId) ?? selectedTool.plans[0]
  const isUsagePlan = selectedPlan.billingUnit === "usage"
  const seats = parsePositiveInt(form.draft.seats)
  const activeUsers = parsePositiveInt(form.draft.activeUsers)
  const teamSize = parsePositiveInt(form.teamSize)
  const monthlySpend = Number.parseFloat(form.draft.monthlySpend) || 0

  const computedSeatSpend = selectedPlan.monthlyPrice * seats
  const canAddTool = teamSize > 0 && monthlySpend >= 0 && seats > 0 && activeUsers >= 0 && activeUsers <= seats
  const canRunAudit = teamSize > 0 && form.tools.length > 0

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        hasLoadedSavedForm.current = true
        return
      }

      try {
        setForm({ ...DEFAULT_STATE, ...JSON.parse(saved) })
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }

      hasLoadedSavedForm.current = true
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!hasLoadedSavedForm.current) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form])

  function updateDraft(nextDraft: Partial<FormState["draft"]>) {
    setForm((current) => ({
      ...current,
      draft: {
        ...current.draft,
        ...nextDraft,
      },
    }))
  }

  function selectTool(toolId: string) {
    const nextTool = getPricingTool(toolId) ?? defaultTool
    const nextPlan = nextTool.plans[0]
    const nextSeats = form.draft.seats || "1"
    updateDraft({
      toolId: nextTool.id,
      planId: nextPlan.id,
      monthlySpend: String(nextPlan.billingUnit === "usage" ? 100 : nextPlan.monthlyPrice * parsePositiveInt(nextSeats)),
    })
  }

  function selectPlan(planId: string) {
    const nextPlan = getPricingPlan(form.draft.toolId, planId) ?? selectedPlan
    updateDraft({
      planId: nextPlan.id,
      monthlySpend: String(nextPlan.billingUnit === "usage" ? monthlySpend || 100 : nextPlan.monthlyPrice * seats),
    })
  }

  function updateSeats(value: string) {
    const nextSeats = parsePositiveInt(value)
    updateDraft({
      seats: value,
      monthlySpend: isUsagePlan ? form.draft.monthlySpend : String(selectedPlan.monthlyPrice * nextSeats),
    })
  }

  function addTool() {
    if (!canAddTool) return

    setForm((current) => ({
      ...current,
      tools: [
        ...current.tools,
        {
          id: crypto.randomUUID(),
          toolId: current.draft.toolId,
          planId: current.draft.planId,
          monthlySpend,
          seats,
          activeUsers,
        },
      ],
      draft: {
        ...current.draft,
        activeUsers: "",
      },
    }))
  }

  function removeTool(id: string) {
    setForm((current) => ({
      ...current,
      tools: current.tools.filter((tool) => tool.id !== id),
    }))
  }

  function runAudit() {
    if (!canRunAudit) return
    onSubmit({
      teamSize,
      useCase: form.useCase,
      tools: form.tools,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team-size">Team size</Label>
            <Input
              id="team-size"
              type="number"
              min="1"
              value={form.teamSize}
              onChange={(event) => setForm((current) => ({ ...current, teamSize: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="use-case">Primary use case</Label>
            <select
              id="use-case"
              value={form.useCase}
              suppressHydrationWarning
              onChange={(event) => setForm((current) => ({ ...current, useCase: event.target.value as UseCase }))}
              className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {USE_CASE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add AI tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tool">Tool</Label>
              <select
                id="tool"
                value={form.draft.toolId}
                suppressHydrationWarning
                onChange={(event) => selectTool(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {PRICING_TOOLS.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select
                id="plan"
                value={form.draft.planId}
                suppressHydrationWarning
                onChange={(event) => selectPlan(event.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {selectedTool.plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} {plan.billingUnit === "seat" ? `- ${currency(plan.monthlyPrice)}/seat` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="seats">Total seats</Label>
              <Input id="seats" type="number" min="1" value={form.draft.seats} onChange={(event) => updateSeats(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="active-users">Active users</Label>
              <Input
                id="active-users"
                type="number"
                min="0"
                value={form.draft.activeUsers}
                onChange={(event) => updateDraft({ activeUsers: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-spend">{isUsagePlan ? "Monthly spend ($)" : "Monthly cost ($)"}</Label>
              <Input
                id="monthly-spend"
                type="number"
                min="0"
                value={form.draft.monthlySpend}
                readOnly={!isUsagePlan}
                onChange={(event) => updateDraft({ monthlySpend: event.target.value })}
              />
            </div>
          </div>

          {!isUsagePlan && (
            <p className="text-sm text-muted-foreground">
              {selectedPlan.name} is calculated at {currency(selectedPlan.monthlyPrice)} per seat: {currency(computedSeatSpend)}/mo.
            </p>
          )}
          {activeUsers > seats && (
            <p className="text-sm text-destructive">Active users cannot exceed total seats.</p>
          )}

          <Button onClick={addTool} disabled={!canAddTool} className="w-full">
            <Plus className="size-4" />
            Add tool
          </Button>
        </CardContent>
      </Card>

      {form.tools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI stack ({form.tools.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.tools.map((tool) => {
              const savedTool = getPricingTool(tool.toolId)
              const savedPlan = getPricingPlan(tool.toolId, tool.planId)

              return (
                <div key={tool.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{savedTool?.name ?? "Unknown tool"}</p>
                      <Badge variant="outline">{savedPlan?.name ?? "Custom plan"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currency(tool.monthlySpend)}/mo - {tool.activeUsers}/{tool.seats} active seats
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTool(tool.id)} aria-label={`Remove ${savedTool?.name ?? "tool"}`}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              )
            })}

            <Button onClick={runAudit} disabled={!canRunAudit} className="w-full">
              Run audit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

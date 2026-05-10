"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuditInputTool } from "@/lib/auditEngine"
import {
  estimatePlanSpend,
  getPlanPricing,
  getToolPricing,
  TOOL_PRICING,
  ToolId,
  USE_CASE_LABELS,
  UseCase,
} from "@/lib/pricingData"

export type AuditFormValues = {
  teamSize: number
  useCase: UseCase
  tools: AuditInputTool[]
}

const STORAGE_KEY = "credex-ai-spend-audit-form"

const defaultTool: AuditInputTool = {
  id: "tool-1",
  toolId: "github-copilot",
  planId: "business",
  monthlySpend: 190,
  totalSeats: 10,
  activeUsers: 7,
}

export default function SpendForm({ onSubmit }: { onSubmit: (values: AuditFormValues) => void }) {
  const [teamSize, setTeamSize] = useState(10)
  const [useCase, setUseCase] = useState<UseCase>("coding")
  const [tools, setTools] = useState<AuditInputTool[]>([defaultTool])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as AuditFormValues
        setTeamSize(parsed.teamSize || 10)
        setUseCase(parsed.useCase || "coding")
        setTools(parsed.tools?.length ? parsed.tools : [defaultTool])
      }
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ teamSize, useCase, tools }))
  }, [hydrated, teamSize, useCase, tools])

  const canRunAudit = useMemo(
    () => teamSize > 0 && tools.length > 0 && tools.every((tool) => tool.monthlySpend >= 0 && tool.totalSeats > 0 && tool.activeUsers >= 0),
    [teamSize, tools]
  )

  function addTool() {
    const tool = TOOL_PRICING[0]
    const plan = tool.plans[1] ?? tool.plans[0]
    const totalSeats = Math.max(teamSize, 1)

    setTools((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        toolId: tool.id,
        planId: plan.id,
        monthlySpend: estimatePlanSpend(tool.id, plan.id, totalSeats),
        totalSeats,
        activeUsers: totalSeats,
      },
    ])
  }

  function removeTool(id: string) {
    setTools((current) => current.filter((tool) => tool.id !== id))
  }

  function updateTool(id: string, updates: Partial<AuditInputTool>) {
    setTools((current) =>
      current.map((tool) => {
        if (tool.id !== id) return tool

        const next = { ...tool, ...updates }

        if (updates.toolId) {
          const pricing = getToolPricing(updates.toolId)
          const plan = pricing?.plans[0]
          next.planId = plan?.id ?? next.planId
          next.monthlySpend = estimatePlanSpend(next.toolId, next.planId, next.totalSeats)
        }

        if (updates.planId || updates.totalSeats) {
          const plan = getPlanPricing(next.toolId, next.planId)
          if (plan?.billingUnit === "seat") {
            next.monthlySpend = estimatePlanSpend(next.toolId, next.planId, next.totalSeats)
          }
        }

        return next
      })
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit setup</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="team-size">Team size</Label>
            <Input
              id="team-size"
              min={1}
              type="number"
              value={teamSize}
              onChange={(event) => setTeamSize(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="use-case">Primary use case</Label>
            <select
              id="use-case"
              suppressHydrationWarning
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={useCase}
              onChange={(event) => setUseCase(event.target.value as UseCase)}
            >
              {Object.entries(USE_CASE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tools.map((tool, index) => {
          const pricing = getToolPricing(tool.toolId)
          const plan = getPlanPricing(tool.toolId, tool.planId)

          return (
            <Card key={tool.id}>
              <CardHeader className="grid-cols-[1fr_auto]">
                <CardTitle>Tool {index + 1}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeTool(tool.id)} aria-label="Remove tool">
                  <Trash2 />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${tool.id}-tool`}>Tool</Label>
                    <select
                      id={`${tool.id}-tool`}
                      suppressHydrationWarning
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={tool.toolId}
                      onChange={(event) => updateTool(tool.id, { toolId: event.target.value as ToolId })}
                    >
                      {TOOL_PRICING.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tool.id}-plan`}>Plan</Label>
                    <select
                      id={`${tool.id}-plan`}
                      suppressHydrationWarning
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={tool.planId}
                      onChange={(event) => updateTool(tool.id, { planId: event.target.value })}
                    >
                      {pricing?.plans.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} {item.monthlyPrice > 0 ? `($${item.monthlyPrice}/mo)` : "(manual spend)"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${tool.id}-spend`}>Monthly spend</Label>
                    <Input
                      id={`${tool.id}-spend`}
                      min={0}
                      type="number"
                      value={tool.monthlySpend}
                      onChange={(event) => updateTool(tool.id, { monthlySpend: Number(event.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tool.id}-seats`}>Paid seats</Label>
                    <Input
                      id={`${tool.id}-seats`}
                      min={1}
                      type="number"
                      value={tool.totalSeats}
                      onChange={(event) => updateTool(tool.id, { totalSeats: Number(event.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${tool.id}-active`}>Active users</Label>
                    <Input
                      id={`${tool.id}-active`}
                      min={0}
                      type="number"
                      value={tool.activeUsers}
                      onChange={(event) => updateTool(tool.id, { activeUsers: Number(event.target.value) })}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {plan?.notes ?? "Seat spend is estimated from plan price and seats. Adjust it if your invoice differs."}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={addTool} className="sm:flex-1">
          <Plus />
          Add tool
        </Button>
        <Button disabled={!canRunAudit} onClick={() => onSubmit({ teamSize, useCase, tools })} className="sm:flex-1">
          Run audit
        </Button>
      </div>
    </div>
  )
}

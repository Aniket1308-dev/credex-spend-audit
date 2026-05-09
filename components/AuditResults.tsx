"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AuditResult } from "@/lib/auditEngine"
import { RotateCcw, Sparkles } from "lucide-react"

function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function riskVariant(riskLevel: "low" | "medium" | "high") {
  if (riskLevel === "high") return "destructive"
  if (riskLevel === "medium") return "secondary"
  return "outline"
}

export default function AuditResults({
  result,
  onReset,
}: {
  result: AuditResult
  onReset: () => void
}) {
  const showCredex = result.totalMonthlySavings >= 500

  return (
    <div className="space-y-5">
      <Card className={showCredex ? "border-emerald-500/40 ring-emerald-500/25" : ""}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{result.headline}</CardTitle>
              <p className="text-sm text-muted-foreground">{result.upsellMessage}</p>
            </div>
            {showCredex && (
              <Badge className="bg-emerald-600 text-white">
                <Sparkles className="size-3" />
                Credex fit
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Monthly spend</p>
              <p className="text-xl font-semibold">{currency(result.totalMonthlySpend)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Possible savings</p>
              <p className="text-xl font-semibold">{currency(result.totalMonthlySavings)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Annual impact</p>
              <p className="text-xl font-semibold">{currency(result.annualSavings)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {result.tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{tool.toolName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tool.planName} - {tool.activeUsers}/{tool.seats} active seats
                  </p>
                </div>
                <Badge variant={riskVariant(tool.riskLevel)}>{tool.riskLevel} risk</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilization</span>
                  <span>{tool.utilization}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${tool.utilization}%` }}
                  />
                </div>
              </div>

              {tool.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {tool.recommendations.map((recommendation) => (
                    <div key={`${tool.id}-${recommendation.type}`} className="rounded-lg bg-muted p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{recommendation.title}</p>
                          <p className="text-sm text-muted-foreground">{recommendation.detail}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold">
                          {currency(recommendation.monthlySavings)}/mo
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  No immediate waste detected for this tool.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={onReset} className="w-full">
        <RotateCcw className="size-4" />
        Start another audit
      </Button>
    </div>
  )
}

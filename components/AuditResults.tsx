"use client"

import Link from "next/link"
import { RotateCcw } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AuditResult } from "@/lib/auditEngine"

const riskVariant = {
  low: "outline",
  medium: "secondary",
  high: "destructive",
} as const

export default function AuditResults({
  result,
  onReset,
  shareUrl,
  isSaving = false,
  saveError,
  slug,
}: {
  result: AuditResult
  onReset?: () => void
  shareUrl?: string | null
  isSaving?: boolean
  saveError?: string | null
  slug?: string | null
}) {
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleLeadSubmit() {
    if (!email) return
    setSubmitting(true)
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company, role, audit_slug: slug }),
    })
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-5 text-card-foreground ring-1 ring-foreground/5">
        <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">Potential savings</p>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight">${result.estimatedMonthlySavings}/mo</h2>
            <p className="mt-2 text-sm text-muted-foreground">${result.estimatedAnnualSavings}/year from ${result.totalMonthlySpend}/mo current spend</p>
          </div>
          <Badge variant={result.savingsTier === "high" ? "destructive" : result.savingsTier === "optimal" ? "outline" : "secondary"} className="justify-self-start sm:justify-self-end">
            {result.savingsTier} savings
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-6">{result.summary}</p>
      </section>

      {result.savingsTier === "high" && (
        <Card>
          <CardHeader>
            <CardTitle>Credex opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              This audit found more than $500/mo in likely savings. That is the threshold where discounted AI credits and procurement help can beat one-off plan cleanup.
            </p>
          </CardContent>
        </Card>
      )}

      {result.estimatedMonthlySavings < 100 && (
        <Card>
          <CardHeader>
            <CardTitle>You are spending well</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              No major waste showed up. A useful follow-up would be a notification when pricing changes or new credits apply to this stack.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Share report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isSaving && <p className="text-sm text-muted-foreground">Saving a public version of this audit...</p>}
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          {shareUrl && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-sm text-muted-foreground">{shareUrl}</p>
              <Button asChild variant="outline">
                <Link href={shareUrl}>Open</Link>
              </Button>
            </div>
          )}
          {!isSaving && !shareUrl && !saveError && <p className="text-sm text-muted-foreground">Run an audit to create a public share link.</p>}
        </CardContent>
      </Card>

      {/* Lead Capture Form */}
      <Card>
        <CardHeader>
          <CardTitle>Get this report in your inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="text-sm text-green-600 font-medium">✅ Report sent to {email}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="Work email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Your role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <Button
                onClick={handleLeadSubmit}
                disabled={submitting || !email}
              >
                {submitting ? "Sending..." : "Send Report"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {result.tools.map((tool) => (
          <Card key={tool.id}>
            <CardHeader className="grid-cols-[1fr_auto]">
              <CardTitle>{tool.toolName}</CardTitle>
              <Badge variant={riskVariant[tool.risk]}>{tool.risk} risk</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span>{tool.planName}</span>
                  <span className="text-muted-foreground">{tool.utilizationRate}% utilization</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${tool.utilizationRate}%` }} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Current" value={`$${tool.monthlySpend}/mo`} />
                <Metric label="Savings" value={`$${tool.monthlySavings}/mo`} />
                <Metric label="Annual" value={`$${tool.annualSavings}/yr`} />
              </div>

              {tool.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {tool.recommendations.map((recommendation) => (
                    <div key={`${tool.id}-${recommendation.rule}`} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{recommendation.title}</p>
                        <p className="text-sm font-medium">${recommendation.monthlySavings}/mo</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.detail}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No obvious waste found for this tool.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {onReset && (
        <Button variant="outline" onClick={onReset} className="w-full">
          <RotateCcw />
          Edit inputs
        </Button>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  )
}
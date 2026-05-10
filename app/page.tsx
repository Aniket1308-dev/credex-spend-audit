"use client"

import { useState } from "react"
import AuditResults from "@/components/AuditResults"
import SpendForm, { AuditFormValues } from "@/components/SpendForm"
import { AuditResult, runAudit } from "@/lib/auditEngine"

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null)

  function handleSubmit(values: AuditFormValues) {
    setResult(runAudit(values))
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Spend Audit</h1>
          <p className="text-muted-foreground">Find out which AI tools your team is overpaying for in 30 seconds.</p>
        </div>

        {result ? <AuditResults result={result} onReset={() => setResult(null)} /> : <SpendForm onSubmit={handleSubmit} />}
      </div>
    </main>
  )
}

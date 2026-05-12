"use client"

import { useState } from "react"
import AuditResults from "@/components/AuditResults"
import SpendForm, { AuditFormValues } from "@/components/SpendForm"
import { AuditResult, runAudit } from "@/lib/auditEngine"

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(values: AuditFormValues) {
    const auditResult = runAudit(values)
    setResult(auditResult)
    setShareUrl(null)
    setSlug(null)
    setSaveError(null)
    setIsSaving(true)

    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          input: values,
          result: auditResult,
        }),
      })

      const data = (await response.json()) as {
        audit?: {
          result: AuditResult
        }
        shareUrl?: string
        error?: string
      }

      if (!response.ok || !data.audit || !data.shareUrl) {
        throw new Error(data.error ?? "Could not create share link.")
      }

      const extractedSlug = data.shareUrl.split("/").pop() ?? null
      setSlug(extractedSlug)
      setResult(data.audit.result)
      setShareUrl(new URL(data.shareUrl, window.location.origin).toString())
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not create share link.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">AI Spend Audit</h1>
          <p className="text-muted-foreground">Find out which AI tools your team is overpaying for in 30 seconds.</p>
        </div>

        {result ? (
          <AuditResults
            result={result}
            shareUrl={shareUrl}
            slug={slug}
            isSaving={isSaving}
            saveError={saveError}
            onReset={() => {
              setResult(null)
              setShareUrl(null)
              setSlug(null)
              setSaveError(null)
            }}
          />
        ) : (
          <SpendForm onSubmit={handleSubmit} />
        )}
      </div>
    </main>
  )
}
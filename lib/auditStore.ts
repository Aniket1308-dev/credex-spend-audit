import { AuditInput, AuditResult } from "@/lib/auditEngine"

export type PublicAudit = {
  slug: string
  input: AuditInput
  result: AuditResult
  createdAt: string
}

type SupabaseAuditRow = {
  slug: string
  public_data: Omit<PublicAudit, "slug" | "createdAt">
  created_at: string
}

const memoryStore = new Map<string, PublicAudit>()

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  return {
    url: url.replace(/\/$/, ""),
    key,
  }
}

export function createAuditSlug() {
  const random = crypto.randomUUID().slice(0, 8)
  return `audit-${random}`
}

export async function saveAudit(audit: PublicAudit) {
  const config = getSupabaseConfig()
  memoryStore.set(audit.slug, audit)

  if (!config) return audit

  const response = await fetch(`${config.url}/rest/v1/audits`, {
    method: "POST",
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      slug: audit.slug,
      public_data: {
        input: audit.input,
        result: audit.result,
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Could not save audit: ${message}`)
  }

  return audit
}

export async function getAuditBySlug(slug: string) {
  const config = getSupabaseConfig()

  if (!config) {
    return memoryStore.get(slug) ?? null
  }

  const response = await fetch(`${config.url}/rest/v1/audits?slug=eq.${encodeURIComponent(slug)}&select=slug,public_data,created_at&limit=1`, {
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
    },
    next: {
      revalidate: 60,
    },
  })

  if (!response.ok) return memoryStore.get(slug) ?? null

  const rows = (await response.json()) as SupabaseAuditRow[]
  const row = rows[0]
  if (!row) return memoryStore.get(slug) ?? null

  return {
    slug: row.slug,
    input: row.public_data.input,
    result: row.public_data.result,
    createdAt: row.created_at,
  }
}

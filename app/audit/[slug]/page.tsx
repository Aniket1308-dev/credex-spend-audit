import type { Metadata } from "next"
import { notFound } from "next/navigation"
import AuditResults from "@/components/AuditResults"
import { getAuditBySlug } from "@/lib/auditStore"

type AuditPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const { slug } = await params
  const audit = await getAuditBySlug(slug)

  if (!audit) {
    return {
      title: "Audit not found | AI Spend Audit",
    }
  }

  const title = `$${audit.result.estimatedMonthlySavings}/mo AI savings found`
  const description = `This AI spend audit found $${audit.result.estimatedAnnualSavings}/year in potential savings across ${audit.result.tools.length} tool${audit.result.tools.length === 1 ? "" : "s"}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/audit/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function AuditPage({ params }: AuditPageProps) {
  const { slug } = await params
  const audit = await getAuditBySlug(slug)

  if (!audit) notFound()

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Shared audit</p>
          <h1 className="text-3xl font-bold tracking-tight">AI Spend Audit</h1>
          <p className="text-muted-foreground">A public report with private contact details removed.</p>
        </div>

        <AuditResults result={audit.result} shareUrl={`/audit/${audit.slug}`} />
      </div>
    </main>
  )
}

"use client"

import SpendForm, { AiTool } from "@/components/SpendForm"

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Spend Audit
          </h1>
          <p className="text-muted-foreground">
            Find out which AI tools your team is overpaying for — in 30 seconds.
          </p>
        </div>

        {/* Form */}
        <SpendForm onSubmit={(tools: AiTool[]) => console.log(tools)} />
      </div>
    </main>
  )
}
import { describe, it, expect } from "vitest"
import { runAudit } from "./auditEngine"
import type { AuditInput } from "./auditEngine"

const baseTool: AuditInput["tools"][0] = {
  id: "tool-1",
  toolId: "chatgpt",
  planId: "plus",
  monthlySpend: 200,
  totalSeats: 10,
  activeUsers: 7,
}

describe("auditEngine", () => {
  it("returns zero savings when no tools are provided", () => {
    const result = runAudit({ teamSize: 10, useCase: "coding", tools: [] })
    expect(result.estimatedMonthlySavings).toBe(0)
  })

  it("estimated savings never exceeds total spend", () => {
    const result = runAudit({ teamSize: 10, useCase: "coding", tools: [baseTool] })
    expect(result.estimatedMonthlySavings).toBeLessThanOrEqual(result.totalMonthlySpend)
  })

  it("annual savings equals monthly savings times 12", () => {
    const result = runAudit({ teamSize: 10, useCase: "coding", tools: [baseTool] })
    expect(result.estimatedAnnualSavings).toBe(result.estimatedMonthlySavings * 12)
  })

  it("savingsTier is one of the valid values", () => {
    const result = runAudit({ teamSize: 10, useCase: "coding", tools: [baseTool] })
    expect(["high", "medium", "low", "optimal"]).toContain(result.savingsTier)
  })

  it("returns a non-empty summary string", () => {
    const result = runAudit({ teamSize: 10, useCase: "coding", tools: [baseTool] })
    expect(typeof result.summary).toBe("string")
    expect(result.summary.length).toBeGreaterThan(0)
  })
})
# Prompts Used

A log of significant AI prompts used during this project and what they produced.

---

## 1. Debugging — Server/Client Boundary
**Tool:** Claude  
**Prompt:**
> "I'm getting this error in Next.js: 'Event handlers cannot be passed to Client Component props.' My page.tsx passes an onSubmit function to a child form component. What's wrong?"

**Output:** Claude explained the App Router server/client split and initially suggested restructuring the component tree. I identified that adding `"use client"` to `page.tsx` was the correct minimal fix.  
**Lesson:** AI explains the *why* well but doesn't always find the simplest fix.

---

## 2. Supabase Schema Design
**Tool:** Claude  
**Prompt:**
> "Design a Supabase schema for an AI spend audit tool. Users log their AI tool subscriptions and usage. I need to track: tool name, cost per month, actual usage hours, team size, and audit date."

**Output:** Produced a clean `audits` table schema with appropriate column types. Used with minor adjustments.

---

## 3. Email Template — Resend
**Tool:** Claude  
**Prompt:**
> "Write a React Email component for a spend audit summary. It should show: total monthly AI spend, top 3 tools by cost, and a recommendation to cut or keep each tool."

**Output:** A working React Email template. Integrated directly into the Resend send function.

---

## 4. Landing Copy Draft
**Tool:** Claude  
**Prompt:**
> "Write a landing page headline and subheadline for a B2B SaaS tool that helps finance teams audit AI software spend across their company. Target audience: CFOs and finance ops at 50–500 person companies."

**Output:** Multiple headline options. Selected and refined the best one.

---

## 5. Architecture Diagram (Mermaid)
**Tool:** Claude  
**Prompt:**
> "Generate a Mermaid flowchart showing the data flow for a Next.js app where: user submits a form → data saved to Supabase → Anthropic API generates audit recommendations → results displayed on dashboard → summary emailed via Resend."

**Output:** Valid Mermaid diagram used directly in ARCHITECTURE.md.

---

## 6. Test Case Generation
**Tool:** Claude  
**Prompt:**
> "Write Jest + React Testing Library tests for a form component that takes AI tool name, monthly cost, and usage hours. Test: renders correctly, validates required fields, calls onSubmit with correct data."

**Output:** Test scaffolding used as the base for the actual test file.

---

## 7. User Interview Questions
**Tool:** Claude  
**Prompt:**
> "I'm building an AI spend audit tool. Give me 6 interview questions to ask potential users (knowledge workers who use AI tools at work) to validate the problem and understand their current pain points around AI software costs."

**Output:** Interview guide used for all 3 user interviews. Adapted slightly per respondent.

---

## 8. ECONOMICS.md Draft
**Tool:** Claude  
**Prompt:**
> "Model the unit economics for a B2B SaaS AI spend audit tool. Assume: $29/mo SMB tier, $99/mo professional tier, $299/mo enterprise tier. Estimate CAC, LTV, payback period, and gross margin assumptions."

**Output:** Unit economics framework used as the base for ECONOMICS.md.
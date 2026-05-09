# DEVLOG

## Day 1 — 2026-05-06
**Hours worked:** [3]
**What I did:** Reviewed the full assignment PDF carefully. Created the Next.js 16 + TypeScript project with `create-next-app`, initialised the GitHub repo, and pushed the first commit. Added `.gitignore` and stubbed out the required markdown files at root (README, DEVLOG, ARCHITECTURE, etc.) so the structure was correct from day one.
**What I learned:** The assignment is explicit that audit math must be hardcoded. AI is only for the summary paragraph. This changed my initial plan of using the Anthropic API for everything.
**Blockers / what I'm stuck on:** Deciding on the right data model for tools: free-form name input vs. a fixed list of required tools with plan dropdowns.
**Plan for tomorrow:** Research all required tool pricing from official pages. Draft pricingData.ts and PRICING_DATA.md together so every number has a source URL from day one.

## Day 2 — 2026-05-07
**Hours worked:** [2]
**What I did:** Research and planning day — no code committed. Researched and documented pricing for all 8 required tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf. Started PRICING_DATA.md so pricing assumptions can be tied back to source URLs and verification dates. Drafted the first architecture and business notes for the product direction.
**What I learned:** Tool pricing is not always perfectly comparable. API tools are usage-based while most team products are seat-based, so the app needs to support both pricing models instead of forcing everything into one cost formula.
**Blockers / what I'm stuck on:** Windsurf vs. other coding tools needed a clear comparison angle. Chose Windsurf because it is a direct Cursor-style coding tool and easier to compare on a per-seat basis.
**Plan for tomorrow:** Install shadcn/ui, build the first SpendForm, and get the basic audit input flow working.

## Day 3 — 2026-05-08
**Hours worked:** [4]
**What I did:** Installed shadcn/ui with the Nova preset. Built the first version of SpendForm.tsx with add/remove tool rows and fields for tool name, monthly cost, seats, and active users. Added the first UI structure on the homepage and prepared the app for the deterministic audit rewrite.
**What I learned:** The first free-form version was useful for testing the interaction, but it did not match the assignment closely enough. The final app needs fixed tool and plan dropdowns so the audit logic can be consistent and testable.
**Blockers / what I'm stuck on:** The downgrade recommendation logic needed a plan ranking model, because price alone is not enough to understand whether a plan is overqualified.
**Plan for tomorrow:** Write pricingData.ts and auditEngine.ts with hardcoded rules, rewrite SpendForm with required tool selectors and localStorage, then build AuditResults.tsx.

## Day 4 — 2026-05-09
**Hours worked:** [6]
**What I did:** Built auditEngine.ts with hardcoded rules: seat count vs. team size, unused seats, plan overqualification using explicit plan ranks, high API spend review, and use-case fit with alternative tool suggestions. Built AuditResults.tsx with per-tool breakdown, utilization bars, risk badges, savings figures, and Credex upsell messaging for high-savings audits. Wired the full client-side flow: form → engine → results → reset. Fixed hydration warnings around localStorage and browser-injected form attributes.
**What I learned:** Savings from multiple recommendations on the same tool can double-count — for example, seat reduction and downgrade recommendations both claiming savings on the same spend. Capped wastedMonthlySpend at monthlySpend to prevent over-reporting.
**Blockers / what I'm stuck on:** Supabase still needs to be set up for shareable audit URLs. Results are currently client-side only, so there is no public slug or saved audit page yet.
**Plan for tomorrow:** Set up Supabase, create the audits table, generate a slug on audit run, and build the public /audit/[slug] page with OG tags.
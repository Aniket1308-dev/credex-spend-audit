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

## Day 5 — 2026-05-10
**Hours worked:** 5
**What I did:** Reworked the core audit flow to match the assignment requirements more closely. Added structured pricing data for the required AI tools, built a deterministic audit engine with hardcoded rules for unused seats, oversized plans, API spend review, cheaper alternatives, and Credex credit opportunities. Rewrote the spend form to use tool and plan dropdowns, team size, primary use case, monthly spend, paid seats, and active users. Added localStorage persistence so form state survives reloads. Wired the homepage to run the audit locally and display a results page with monthly and annual savings, per-tool recommendations, utilization bars, risk labels, a Credex callout for high-savings audits, and an honest “You are spending well” state for low-savings audits.
**What I learned:** The assignment is much more about product judgment than just implementation. The audit math needs to be deterministic and defensible, while AI should only be used for the personalized summary later. I also learned that Next.js 16 Turbopack can infer the wrong workspace root if there is another `package.json` higher up the directory tree, which caused Tailwind resolution issues in dev mode.
**Blockers / what I'm stuck on:** I hit a local dev-server issue where Turbopack tried to resolve `tailwindcss` from `C:\Users\Anike\Projects` instead of the project folder because of an unrelated parent `package.json`. I fixed local development by switching `npm run dev` to `next dev --webpack`. I also saw a hydration warning caused by browser-injected `fdprocessedid` attributes on form fields, so I suppressed hydration warnings on the affected controls.
**Plan for tomorrow:** Add Supabase storage for audits and leads, generate unique public audit slugs, create the `/audit/[slug]` share page, strip private fields from public results, and add Open Graph/Twitter metadata. After that, move LLM usage into a summary-only API route with a graceful fallback.
## Day 6 — 2026-05-11
**Hours worked:** 5
**What I did:** Added the shareable audit foundation. Built server routes to create saved audits, generate unique public slugs, and return a share URL after the deterministic audit runs. Added a Supabase REST persistence layer with a local in-memory fallback for development, plus a public `/audit/[slug]` page that renders saved results without email or company data. Added dynamic Open Graph and Twitter metadata for shared audit pages. Moved AI usage into a summary-only flow through `lib/summary.ts` and `/api/summary`, with a templated fallback if Anthropic is unavailable.
**What I learned:** The public audit page has to be treated as a privacy boundary, not just another route. Only the audit inputs and savings result should be stored in the public payload; contact details need to be handled separately when lead capture is added. I also learned that using Supabase through REST keeps the dependency surface small, which is useful under a tight deadline.
**Blockers / what I'm stuck on:** Supabase credentials and the real `audits` table still need to be created in the Supabase dashboard before this works as a deployed backend. The local fallback is useful for development, but the assignment requires a real backend for final submission.
**Plan for tomorrow:** Add lead capture with optional company, role, and team size fields; store leads separately from public audits; add transactional email through Resend; write at least five audit engine tests; and add GitHub Actions CI.

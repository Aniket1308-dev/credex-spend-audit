# Credex AI Spend Audit

> Find out which AI tools your team is overpaying for — in 30 seconds.

**Live:** https://credex-spend-audit.vercel.app

---

## What it does

You enter your AI tool subscriptions (ChatGPT, Copilot, Midjourney, etc.), how many seats you have, and how much your team actually uses them. The audit engine runs deterministic rules against your spend, flags waste, and shows estimated monthly and annual savings. A shareable public URL is generated for every audit. High-spend users see a Credex upsell. Anyone can email themselves the report.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Audit logic | Custom deterministic engine (`lib/auditEngine.ts`) |
| AI summary | Anthropic Claude API (≈100 words, fallback if unavailable) |
| Database | Supabase (PostgreSQL) — `audits` + `leads` tables |
| Email | Resend — confirmation email on lead capture |
| CI | GitHub Actions — lint + Vitest on every push |
| Deploy | Vercel |

---

## Running locally

### 1. Clone and install

```bash
git clone https://github.com/Aniket1308-dev/credex-spend-audit
cd credex-spend-audit
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your real keys:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| `RESEND_API_KEY` | https://resend.com/api-keys |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` for local |

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## Project structure
app/
page.tsx              # Home — spend form + audit results
audit/[slug]/         # Public shareable audit page
api/
audits/route.ts     # POST: run audit, save to Supabase, return shareUrl
leads/route.ts      # POST: save lead to Supabase, send Resend email
ai-summary/         # POST: generate Claude AI summary
components/
SpendForm.tsx         # Tool input form
AuditResults.tsx      # Results + share link + lead capture
lib/
auditEngine.ts        # Core deterministic audit logic (no AI)
auditEngine.test.ts   # 5 Vitest unit tests
---

## Tests

```bash
npm run test
```

5 unit tests covering the audit engine — zero waste detection, high utilization, seat count, annual savings calculation, and savings tier assignment.

---

## CI

GitHub Actions runs on every push to `main`:
- ESLint
- Vitest (all 5 tests must pass)

---

## Key design decisions

- **Audit math is fully deterministic** — no AI involved in the numbers. Claude only writes a ~100-word plain-English summary at the end.
- **No auth required** — every audit gets a public slug URL, shareable instantly.
- **Lead capture is post-result** — users see their savings first, then optionally drop their email.

---

## Screenshots

![Audit form](public/screenshots/form.png)
![Audit results](public/screenshots/results1.png)
![Audit results](public/screenshots/results2.png)

---

## Author

Aniket Vakkithody · [LinkedIn](https://linkedin.com/in/aniket-vakkithody) · [GitHub](https://github.com/Aniket1308-dev)
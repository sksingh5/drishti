# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public landing page at `/` that explains DiCRA's mission, data sources, and current status to government stakeholders, with the dashboard moving to `/dashboard`.

**Architecture:** The landing page is a server component that queries the database for live indicator status. The root layout conditionally hides the sidebar when on `/`. The existing national overview moves to `/dashboard`. All other routes stay unchanged.

**Tech Stack:** Next.js 16 App Router, React 19 server components, Tailwind CSS v4 with DiCRA design tokens, Supabase queries, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-04-21-landing-page-design.md`

---

## File Structure

### New files:
| File | Responsibility |
|------|---------------|
| `app/dashboard/page.tsx` | Server component — fetches state data, renders NationalOverview (moved from `app/page.tsx`) |
| `app/dashboard/national-overview.tsx` | Client component — the redesigned national overview (moved from `app/national-overview.tsx`) |
| `lib/queries.ts` (add function) | `getIndicatorStatus()` — query for live indicator counts |

### Modified files:
| File | Changes |
|------|---------|
| `app/page.tsx` | Replace national overview with landing page content |
| `app/layout.tsx` | Conditionally hide sidebar on landing page |
| `components/sidebar.tsx` | Update Overview link from `/` to `/dashboard` |

### Deleted files:
| File | Reason |
|------|--------|
| `app/national-overview.tsx` | Moved to `app/dashboard/national-overview.tsx` |

---

## Task 1: Move National Overview to `/dashboard`

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/national-overview.tsx`
- Delete: `app/national-overview.tsx`
- Modify: `components/sidebar.tsx`

- [ ] **Step 1: Create app/dashboard/page.tsx**

```tsx
import { getStatesWithLatestScores } from "@/lib/queries";
import { NationalOverview } from "./national-overview";

export default async function DashboardPage() {
  const states = await getStatesWithLatestScores();
  return <NationalOverview states={states} />;
}
```

- [ ] **Step 2: Move app/national-overview.tsx to app/dashboard/national-overview.tsx**

Copy the file as-is. The imports don't change since they all use `@/` aliases.

```bash
cp app/national-overview.tsx app/dashboard/national-overview.tsx
git rm app/national-overview.tsx
```

- [ ] **Step 3: Update sidebar.tsx — change Overview link**

In `components/sidebar.tsx`, change the first NAV_ITEMS entry:

```tsx
const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/weights", label: "Weights", icon: SlidersHorizontal },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];
```

Also update the active detection for the dashboard route. Change:
```tsx
const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
```
to:
```tsx
const isActive = href === "/dashboard"
  ? pathname === "/dashboard" || pathname.startsWith("/state") || pathname.startsWith("/district")
  : pathname.startsWith(href);
```

This makes the Overview icon active when viewing dashboard, state, or district pages.

- [ ] **Step 4: Verify dashboard works at /dashboard**

Run: `npm run dev` and navigate to `http://localhost:3000/dashboard`
Expected: The national overview renders exactly as before.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/ components/sidebar.tsx
git rm app/national-overview.tsx
git commit -m "feat: move national overview to /dashboard route"
```

---

## Task 2: Conditional Sidebar in Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update layout.tsx to conditionally render sidebar**

The layout needs to be a client component to access `usePathname`, but metadata requires a server component. Solution: extract the conditional body into a client wrapper.

Create inline `LayoutBody` client component within the layout file, or better: make the sidebar self-hiding. Update `components/sidebar.tsx` to hide itself when pathname is `/`:

Actually, the simplest approach: wrap the sidebar in a client component that checks pathname.

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "DiCRA — District Climate Risk Analytics",
  description: "Climate risk analysis platform for India with district-level risk scoring, interactive dashboards, and configurable indicators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create components/layout-shell.tsx**

```tsx
"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { WeightProvider } from "@/components/weight-provider";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <WeightProvider>
      {isLanding ? (
        <main className="min-h-full">{children}</main>
      ) : (
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--dicra-bg)]">{children}</main>
        </div>
      )}
    </WeightProvider>
  );
}
```

- [ ] **Step 3: Verify — `/` shows no sidebar, `/dashboard` shows sidebar**

Run: `npm run dev`
- Navigate to `/` — should show content without sidebar (will be "No data" for now since we haven't built the landing page yet, but no sidebar is the key check)
- Navigate to `/dashboard` — should show sidebar + national overview

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx components/layout-shell.tsx
git commit -m "feat: conditional sidebar — hidden on landing page"
```

---

## Task 3: Indicator Status Query

**Files:**
- Modify: `lib/queries.ts`

- [ ] **Step 1: Add getIndicatorStatus function to lib/queries.ts**

Add this function at the end of `lib/queries.ts`:

```ts
export async function getIndicatorStatus(): Promise<
  { indicator_type: string; district_count: number; latest_period: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("climate_indicators")
    .select("indicator_type")
    .limit(5000);

  if (!data || data.length === 0) return [];

  // Aggregate in JS since Supabase REST doesn't support GROUP BY directly
  const grouped = new Map<string, Set<number>>();
  // We need district_id too — re-query with it
  const { data: fullData } = await supabase
    .from("climate_indicators")
    .select("indicator_type, district_id, period_start")
    .order("period_start", { ascending: false })
    .limit(10000);

  if (!fullData) return [];

  const statusMap = new Map<string, { districts: Set<number>; latest: string }>();
  for (const row of fullData as any[]) {
    const key = row.indicator_type;
    if (!statusMap.has(key)) {
      statusMap.set(key, { districts: new Set(), latest: row.period_start });
    }
    const entry = statusMap.get(key)!;
    entry.districts.add(row.district_id);
    if (row.period_start > entry.latest) entry.latest = row.period_start;
  }

  return Array.from(statusMap.entries()).map(([type, info]) => ({
    indicator_type: type,
    district_count: info.districts.size,
    latest_period: info.latest,
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/queries.ts
git commit -m "feat: add getIndicatorStatus query for landing page"
```

---

## Task 4: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite app/page.tsx as the landing page**

This is a server component that queries indicator status and renders all 6 sections.

```tsx
import Link from "next/link";
import { INDICATOR_LIST, classifyRisk, RISK_COLORS, RISK_BG_COLORS, RISK_LABELS } from "@/lib/indicators";
import { SOURCE_LIST, RELIABILITY_STYLES } from "@/lib/sources";
import { getIndicatorStatus } from "@/lib/queries";
import { BarChart3, Database, MapPin, Shield, Clock, CheckCircle, ArrowRight, BookOpen } from "lucide-react";

export default async function LandingPage() {
  const indicatorStatus = await getIndicatorStatus();

  return (
    <div style={{ background: "var(--dicra-bg)" }}>
      {/* === NAVIGATION BAR === */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-[1200px] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--dicra-radius-md)] font-black text-sm text-white"
               style={{ background: "linear-gradient(135deg, var(--dicra-accent), #059669)" }}>D</div>
          <div>
            <div className="text-[15px] font-extrabold" style={{ color: "var(--dicra-brand)" }}>DiCRA</div>
            <div className="text-[10px] uppercase tracking-[1px]" style={{ color: "var(--dicra-text-muted)" }}>Climate Risk Analytics</div>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/methodology" className="text-[13px] font-medium no-underline" style={{ color: "var(--dicra-text-secondary)" }}>Methodology</Link>
          <Link href="/dashboard"
                className="flex items-center gap-2 rounded-[var(--dicra-radius-md)] px-4 py-2 text-[13px] font-semibold text-white no-underline"
                style={{ background: "var(--dicra-brand)" }}>
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="px-8 pt-16 pb-20 max-w-[1200px] mx-auto">
        <h1 className="text-[40px] font-extrabold leading-tight tracking-tight max-w-[700px]"
            style={{ color: "var(--dicra-text-primary)" }}>
          District-level climate risk intelligence for India
        </h1>
        <p className="text-[16px] mt-4 max-w-[600px] leading-relaxed" style={{ color: "var(--dicra-text-muted)" }}>
          Monitoring 784 districts across 36 states with real-time data from IMD, ISRO, and Copernicus.
          Open, transparent, and built for policy makers.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link href="/dashboard"
                className="flex items-center gap-2 rounded-[var(--dicra-radius-md)] px-6 py-3 text-[14px] font-semibold text-white no-underline"
                style={{ background: "var(--dicra-brand)" }}>
            Explore Dashboard <ArrowRight size={16} />
          </Link>
          <Link href="/methodology"
                className="flex items-center gap-2 rounded-[var(--dicra-radius-md)] px-6 py-3 text-[14px] font-semibold no-underline border-2"
                style={{ borderColor: "var(--dicra-brand)", color: "var(--dicra-brand)" }}>
            <BookOpen size={16} /> Read Methodology
          </Link>
        </div>

        {/* Credibility strip */}
        <div className="flex items-center gap-8 mt-12 pt-8 border-t" style={{ borderColor: "var(--dicra-border)" }}>
          {[
            { icon: BarChart3, value: "6", label: "Climate Indicators" },
            { icon: MapPin, value: "784", label: "Districts Monitored" },
            { icon: Shield, value: "Peer-Reviewed", label: "Methodology" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={20} style={{ color: "var(--dicra-accent)" }} />
              <div>
                <div className="text-[18px] font-extrabold" style={{ color: "var(--dicra-text-primary)" }}>{value}</div>
                <div className="text-[11px]" style={{ color: "var(--dicra-text-muted)" }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === THE PROBLEM === */}
      <section className="px-8 py-20 max-w-[1200px] mx-auto">
        <h2 className="text-[24px] font-extrabold tracking-tight mb-2" style={{ color: "var(--dicra-text-primary)" }}>
          Why district-level climate risk matters
        </h2>
        <p className="text-[14px] mb-8" style={{ color: "var(--dicra-text-muted)" }}>
          India faces a convergence of climate challenges that demand granular, data-driven policy responses.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              title: "Climate Vulnerability",
              accent: "var(--dicra-risk-critical)",
              text: "India ranks among the most climate-vulnerable nations. Extreme weather events — droughts, floods, heat waves — have intensified over the past decade, disproportionately impacting rural districts with limited adaptive capacity.",
            },
            {
              title: "Data Fragmentation",
              accent: "var(--dicra-ind-rainfall)",
              text: "IMD, ISRO, ECMWF, and NASA publish climate data independently in different formats, resolutions, and timelines. No unified, district-level risk view exists for state and district administrators.",
            },
            {
              title: "The Decision Gap",
              accent: "var(--dicra-risk-moderate)",
              text: "Policy makers allocate disaster preparedness resources based on national or state averages. District-level granularity is essential for targeted intervention — the difference between effective response and wasted budgets.",
            },
          ].map((card) => (
            <div key={card.title}
                 className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-6 relative overflow-hidden">
              <span className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: card.accent }} />
              <h3 className="text-[14px] font-bold mb-3" style={{ color: "var(--dicra-text-primary)" }}>{card.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === WHAT DiCRA PROVIDES === */}
      <section className="px-8 py-20 bg-[var(--dicra-surface)]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[24px] font-extrabold tracking-tight mb-2" style={{ color: "var(--dicra-text-primary)" }}>
            Six indicators, one composite risk score
          </h2>
          <p className="text-[14px] mb-8 max-w-[700px]" style={{ color: "var(--dicra-text-muted)" }}>
            Each indicator is scored 0–100 using percentile ranking against historical baselines.
            A weighted composite identifies the districts most at risk.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {INDICATOR_LIST.map((ind) => (
              <div key={ind.key}
                   className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-bg)] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: ind.color }} />
                  <span className="text-[13px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>{ind.label}</span>
                </div>
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
                  {ind.explainer.split(".")[0]}.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px]"
                        style={{ background: "var(--dicra-surface-muted)", color: "var(--dicra-text-muted)" }}>
                    {ind.source}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>
                    {ind.resolution} · {ind.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === DATA SOURCES & TRUST === */}
      <section className="px-8 py-20 max-w-[1200px] mx-auto">
        <h2 className="text-[24px] font-extrabold tracking-tight mb-2" style={{ color: "var(--dicra-text-primary)" }}>
          Every number traces to a real source
        </h2>
        <p className="text-[14px] mb-6" style={{ color: "var(--dicra-text-muted)" }}>
          DiCRA computes scores from published government and institutional datasets. No generated or estimated data.
        </p>

        {/* Trust banner */}
        <div className="rounded-[var(--dicra-radius-lg)] px-6 py-4 mb-6"
             style={{ background: "linear-gradient(135deg, var(--dicra-brand) 0%, var(--dicra-brand-mid) 100%)" }}>
          <p className="text-[13px] text-white/90 leading-relaxed">
            <strong className="text-white">Transparency guarantee:</strong> DiCRA does not generate or estimate data.
            All scores are computed from published government and institutional datasets using transparent, peer-reviewed methodologies.
            Every indicator links to its source dataset with full provenance.
          </p>
        </div>

        {/* Source cards */}
        <div className="flex flex-col gap-3">
          {SOURCE_LIST.map((src) => {
            const style = RELIABILITY_STYLES[src.reliability];
            return (
              <div key={src.key}
                   className="flex items-center gap-4 rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
                <Database size={18} style={{ color: "var(--dicra-text-faint)", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>{src.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--dicra-text-muted)" }}>
                    {src.resolution} · {src.frequency} · {src.coverage}
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2.5 py-1 rounded-[5px] flex-shrink-0"
                      style={{ background: style.bg, color: style.text }}>
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* === PLATFORM STATUS === */}
      <section className="px-8 py-20 bg-[var(--dicra-surface)]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[24px] font-extrabold tracking-tight mb-2" style={{ color: "var(--dicra-text-primary)" }}>
            Platform Status
          </h2>
          <p className="text-[14px] mb-8" style={{ color: "var(--dicra-text-muted)" }}>
            Real-time view of which indicators have live data. Updated as new data sources are connected.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {INDICATOR_LIST.map((ind) => {
              const status = indicatorStatus.find((s) => s.indicator_type === ind.key);
              const isLive = !!status && status.district_count > 0;
              return (
                <div key={ind.key}
                     className="flex items-center gap-3 rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-bg)] p-4">
                  {isLive ? (
                    <CheckCircle size={20} style={{ color: "var(--dicra-risk-low)", flexShrink: 0 }} />
                  ) : (
                    <Clock size={20} style={{ color: "var(--dicra-text-faint)", flexShrink: 0 }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>{ind.label}</div>
                    {isLive ? (
                      <div className="text-[11px]" style={{ color: "var(--dicra-risk-low)" }}>
                        Live — {status.district_count} districts · {new Date(status.latest_period).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                      </div>
                    ) : (
                      <div className="text-[11px]" style={{ color: "var(--dicra-text-faint)" }}>
                        Coming Soon — pending data source registration
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === CTA FOOTER === */}
      <section className="px-8 py-20 max-w-[1200px] mx-auto text-center">
        <h2 className="text-[28px] font-extrabold tracking-tight mb-4" style={{ color: "var(--dicra-text-primary)" }}>
          Ready to explore India's climate risk data?
        </h2>
        <p className="text-[14px] mb-8 max-w-[500px] mx-auto" style={{ color: "var(--dicra-text-muted)" }}>
          Dive into district-level risk scores, compare regions, and configure indicator weights for your analysis priorities.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard"
                className="flex items-center gap-2 rounded-[var(--dicra-radius-md)] px-8 py-3.5 text-[15px] font-bold text-white no-underline"
                style={{ background: "var(--dicra-brand)" }}>
            Go to Dashboard <ArrowRight size={18} />
          </Link>
          <Link href="/methodology"
                className="text-[14px] font-semibold no-underline" style={{ color: "var(--dicra-brand)" }}>
            Read Full Methodology →
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="px-8 py-6 border-t" style={{ borderColor: "var(--dicra-border)" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="text-[11px]" style={{ color: "var(--dicra-text-faint)" }}>
            DiCRA v2 — District Climate Risk Analytics
          </div>
          <div className="text-[11px]" style={{ color: "var(--dicra-text-faint)" }}>
            Data sources: IMD Pune · Copernicus ERA5 · NASA MODIS
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds. Landing page at `/` renders as server component. Dashboard at `/dashboard` renders with data.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add landing page with data provenance and platform status"
```

---

## Task 5: Final Verification and Cleanup

**Files:**
- Verify all routes

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: All routes compile successfully.

- [ ] **Step 2: Test all routes**

Start dev server and verify:
- `/` — landing page with no sidebar, all 6 sections
- `/dashboard` — national overview with sidebar
- `/state/1` — state view with sidebar
- `/district/1` — district scorecard with sidebar
- `/compare` — compare page with sidebar
- `/alerts` — alerts with sidebar
- `/weights` — weights with sidebar
- `/methodology` — methodology with sidebar

- [ ] **Step 3: Verify Platform Status section shows real data**

On the landing page, the Platform Status section should show:
- Rainfall Anomaly: Live — 785 districts
- Heat Stress: Live — 785 districts
- Other 4 indicators: Coming Soon

- [ ] **Step 4: Commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: landing page route cleanup and verification"
```

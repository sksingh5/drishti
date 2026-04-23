# UX Polish, Content Rewrite & Crop Impact Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address 12 improvement items: remove clutter from home page, redesign logo, restructure navigation, add About page, rewrite indicator copy for common people, fix misleading stat cards, rewrite methodology, fix missing indicator data, explain composite scores, and plan the crop impact module.

**Architecture:** Grouped into 5 phases — (A) Quick home page cleanups, (B) Navigation & new pages, (C) Content rewrites across all indicator touchpoints, (D) Bug fix for missing data, (E) Crop impact module brainstorm. Each phase is independently deployable.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Supabase, SVG for logo

---

## Phase A — Home Page Cleanups (Items 1, 5)

### Task 1: Remove Transparency Guarantee Box

**Files:**
- Modify: `app/page.tsx:243-259`

- [ ] **Step 1: Remove the transparency banner block**

Delete lines 243-259 (the `<ScrollReveal>` wrapping the transparency gradient box). The entire block:

```tsx
{/* Transparency banner */}
<ScrollReveal delay={100}>
  <div
    className="mt-14 rounded-2xl p-8 text-center text-white"
    style={{
      background:
        "linear-gradient(135deg, var(--dicra-brand) 0%, #0A2E1A 100%)",
    }}
  >
    <p className="text-[14px] leading-relaxed max-w-[600px] mx-auto opacity-90">
      <strong>Transparency guarantee:</strong> DRISHTI does not generate
      or estimate data. All scores are computed from published datasets
      using transparent, peer-reviewed methodologies with full source
      provenance.
    </p>
  </div>
</ScrollReveal>
```

- [ ] **Step 2: Verify home page renders without the box**

Run: Open `http://localhost:3000` and confirm the Data Provenance section flows cleanly without the banner.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "fix: remove transparency guarantee box from home page"
```

---

### Task 2: Remove Text Below Dashboard Button in Hero

**Files:**
- Modify: `app/page.tsx:103-108`

The hero section has a subtitle paragraph below the heading and above the button (lines 103-109). The "Actionable insights across X districts — built for bankers, state planners, and climate researchers." text sits between the heading and the button. Remove it.

- [ ] **Step 1: Remove the subtitle paragraph**

Delete the `<p>` block at lines 103-109:

```tsx
<p
  className="mt-5 text-[17px] leading-relaxed max-w-[560px]"
  style={{ color: "rgba(255,255,255,0.7)" }}
>
  Actionable insights across {districtCount ?? 784} districts — built
  for bankers, state planners, and climate researchers.
</p>
```

- [ ] **Step 2: Adjust the button margin**

Change the button's `mt-10` to `mt-8` so spacing is balanced without the paragraph above it.

- [ ] **Step 3: Verify hero section visually**

Open `http://localhost:3000`. Hero should show: Heading → Button → Credibility strip. No orphaned text.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "fix: remove subtitle text below dashboard button in hero"
```

---

## Phase B — Navigation Restructure, Logo, About Page (Items 2, 3, 4)

### Task 3: Move Methodology from Main Menu to Dashboard

**Files:**
- Modify: `components/sidebar.tsx:10-14` (remove Methodology from NAV_ITEMS)
- Modify: `app/page.tsx:51-57` (remove Methodology from landing nav)
- Modify: `app/page.tsx:50` (update landing nav links — replace Methodology with About)
- Modify: `app/dashboard/national-overview.tsx` (add Methodology link in dashboard)

- [ ] **Step 1: Remove Methodology from sidebar NAV_ITEMS**

In `components/sidebar.tsx`, change:

```typescript
const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];
```

To:

```typescript
const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
];
```

Remove the `BookOpen` import if no longer used.

- [ ] **Step 2: Replace Methodology with About in landing page sticky nav**

In `app/page.tsx`, change the Methodology link (lines 51-57) to:

```tsx
<Link
  href="/about"
  className="text-[13px] font-medium transition-opacity hover:opacity-70"
  style={{ color: "var(--dicra-text-muted)" }}
>
  About
</Link>
```

- [ ] **Step 3: Add Methodology link inside the dashboard**

The `MethodologyBanner` component already exists in `national-overview.tsx` (line 156). Keep it. Additionally, add a subtle Methodology link or tab within the dashboard sidebar or dashboard layout. The simplest approach: add a "Methodology" icon button to the sidebar below the nav items (similar to portfolio), linking to `/methodology`. Use a lower-prominence style (e.g., `text-white/25` instead of active nav).

Alternatively, add a "Methodology" tab/link in the dashboard header area near the period selector.

- [ ] **Step 4: Verify navigation flow**

- Landing page nav: should show About, Portfolio, Dashboard
- Sidebar: should show Overview, Alerts (no Methodology)
- Dashboard: should still have MethodologyBanner and a way to reach /methodology
- `/methodology` route still works if visited directly

- [ ] **Step 5: Commit**

```bash
git add components/sidebar.tsx app/page.tsx app/dashboard/national-overview.tsx
git commit -m "refactor: move methodology from main nav to dashboard, add About link"
```

---

### Task 4: Redesign Logo — Artistic SVG with Satellite/Earth/Eye Elements

**Files:**
- Create: `components/logo.tsx` (reusable SVG logo component)
- Modify: `app/page.tsx` (landing nav, footer)
- Modify: `components/sidebar.tsx` (sidebar logo)

**Note:** This task creates an SVG-based logo that artistically combines 2-3 of: satellite, earth, eye. The design should be clean enough to work at 32px (sidebar) and 40px (landing nav).

- [ ] **Step 1: Create logo component with SVG**

Create `components/logo.tsx` — a single `<Logo>` component that accepts `size` prop. Design approach: an eye shape whose iris is a stylized earth/globe, with a small satellite arc or orbit line. Keep it to 2-3 colors from the brand palette (`#34D399`, `#059669`, `#142B21`).

```tsx
interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Eye outer shape — almond/lens form */}
      {/* Earth/globe as the iris — simplified continent outlines or grid */}
      {/* Satellite orbit arc — thin curved line with small dot */}
      {/* Keep strokes clean, 2-3 brand colors */}
    </svg>
  );
}
```

The actual SVG paths need creative design work. **Use the brainstorming skill to explore 2-3 design directions before finalizing.** The implementation agent should generate and render the SVG in browser for visual approval.

- [ ] **Step 2: Replace "D" box with Logo in sidebar**

In `components/sidebar.tsx`, replace the `<Link>` at line 24-27:

```tsx
<Link href="/" className="mb-6">
  <Logo size={36} />
</Link>
```

- [ ] **Step 3: Replace "D" box with Logo in landing page nav**

In `app/page.tsx`, replace lines 39-42 with `<Logo size={32} />`.

- [ ] **Step 4: Replace "D" box with Logo in footer**

In `app/page.tsx`, replace lines 607-609 with `<Logo size={24} />`.

- [ ] **Step 5: Visual check at all three sizes**

Open landing page, dashboard, scroll to footer. Logo should be legible at 24px, 32px, and 36px.

- [ ] **Step 6: Commit**

```bash
git add components/logo.tsx components/sidebar.tsx app/page.tsx
git commit -m "feat: artistic SVG logo with satellite/earth/eye elements"
```

---

### Task 5: Create About Page

**Files:**
- Create: `app/about/page.tsx`
- Modify: `app/page.tsx` (footer — add About link)

**IMPORTANT:** Draft copy must be reviewed and approved by user before going live. Write compelling copy and mark it clearly for review.

- [ ] **Step 1: Draft the About page copy**

Write 3-4 key messages. Suggested structure:

1. **Vision** — "Every district in India deserves climate intelligence that's transparent, timely, and actionable."
2. **Problem** — "Climate risk is hyper-local but data is fragmented across agencies and formats. Farmers, bankers, and policymakers lack a unified view."
3. **Approach** — "DRISHTI synthesizes satellite imagery, ground-station data, and reanalysis products into a single, peer-reviewable risk score for every district."
4. **Who it's for** — "Built for state planners, agricultural lenders, climate researchers, and anyone who needs district-level climate intelligence."

**Write the copy in a comment block at the top of the file**, clearly marked `{/* === COPY FOR REVIEW — DO NOT DEPLOY UNTIL APPROVED === */}`. Use placeholder text in the actual render until approved.

- [ ] **Step 2: Build the About page with strong visual design**

Design approach:
- Full-width hero section with background image (reuse `cta-drought.jpg` or similar)
- 4 message cards in a 2x2 grid, each with an icon, heading, and 2-3 sentence body
- Clean typography matching the landing page aesthetic
- Subtle scroll animations via `ScrollReveal`
- Color palette: brand green accents on light surface

```tsx
// app/about/page.tsx
import Image from "next/image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Eye, Globe, BarChart3, Users } from "lucide-react";

export const metadata = { title: "About — DRISHTI" };

const MESSAGES = [
  {
    icon: Eye,
    title: "Our Vision",
    body: "[PENDING APPROVAL] ...",
  },
  {
    icon: Globe,
    title: "The Problem We Solve",
    body: "[PENDING APPROVAL] ...",
  },
  {
    icon: BarChart3,
    title: "Our Approach",
    body: "[PENDING APPROVAL] ...",
  },
  {
    icon: Users,
    title: "Who It's For",
    body: "[PENDING APPROVAL] ...",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative py-32">
        <Image src="/images/cta-drought.jpg" alt="" fill className="object-cover" style={{ filter: "brightness(0.2)" }} />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-black text-white tracking-[-1px]" style={{ fontSize: "clamp(32px, 5vw, 52px)" }}>
            About DRISHTI
          </h1>
          <p className="mt-4 text-[17px] max-w-[560px] mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
            District Risk Intelligence System for Hazard Tracking in India
          </p>
        </div>
      </section>

      {/* Key Messages */}
      <section className="py-24" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1000px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {MESSAGES.map((msg, i) => (
            <ScrollReveal key={msg.title} delay={i * 80}>
              <div className="rounded-2xl p-8 bg-[var(--dicra-surface)] border border-[var(--dicra-border)]">
                <msg.icon size={28} style={{ color: "var(--dicra-accent)" }} />
                <h2 className="mt-4 text-[20px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>
                  {msg.title}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
                  {msg.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Add About link to footer**

In `app/page.tsx` footer section, add a link to `/about` in the footer nav area.

- [ ] **Step 4: Present copy draft to user for review**

Show the user the 4 message drafts. Do NOT deploy final copy until they approve/edit.

- [ ] **Step 5: Commit (with placeholder copy)**

```bash
git add app/about/page.tsx app/page.tsx
git commit -m "feat: add About page with visual design, copy pending approval"
```

---

## Phase C — Content Rewrites (Items 6, 7, 8, 11, 12)

### Task 6: Rewrite Indicator Descriptions for Common People

**Files:**
- Modify: `lib/indicators.ts` (update `explainer` field for all 7 indicators)
- Modify: `app/page.tsx:411-462` (indicator cards on home page — update what's shown)

The `explainer` field is used in `IndicatorCard` (the "What this means" box) and referenced in `InsightCard`. Currently the explainers are technical. Rewrite them in plain language explaining what the score means and its real-world implications.

- [ ] **Step 1: Rewrite all 7 indicator explainers**

In `lib/indicators.ts`, update each `explainer` to be understandable by a non-technical person. Example rewrites:

```typescript
// rainfall_anomaly
explainer: "Tracks whether your district is getting unusually high or low rainfall compared to what's normal. A high score means rainfall is far from normal — either too much (flood risk) or too little (drought risk). This directly affects crop health, water availability, and farming decisions."

// heat_stress  
explainer: "Measures how extreme daily temperatures are in your district. A high score means dangerously hot conditions that can harm crops, reduce worker productivity, and increase health risks — especially for outdoor laborers and the elderly."

// drought_index
explainer: "Indicates how dry your district has been over the past 3 months compared to the rest of India. A high score signals prolonged rainfall deficit — meaning wells may run low, crops face water stress, and irrigation demand increases."

// vegetation_health
explainer: "Shows how green and healthy the vegetation in your district is, measured by satellites. A high score means vegetation is stressed or dying — an early warning sign of crop failure, overgrazing, or the effects of drought and heat."

// flood_risk
explainer: "Estimates your district's exposure to flooding based on recent heavy rainfall and soil saturation. A high score means the ground is already wet and more rain could cause waterlogging, crop damage, or displacement."

// soil_moisture
explainer: "Measures how much water is in the topsoil across your district. A high score means the soil is unusually dry — bad news for crops that depend on soil moisture, and an early indicator of drought conditions."

// vulnerability
explainer: "A combined measure of how exposed your district is to multiple climate stresses at once. A high score means both rainfall patterns and vegetation health are abnormal — districts with high vulnerability need the most urgent attention."
```

- [ ] **Step 2: Update home page indicator cards to show the full explainer**

In `app/page.tsx` (lines 433-438), the card currently shows only the first sentence of the explainer:

```tsx
{ind.explainer.split(". ")[0]}.
```

Change to show the full explainer (or first 2 sentences if too long):

```tsx
{ind.explainer}
```

The card may need a slight layout adjustment (increase padding or allow more height).

- [ ] **Step 3: Verify cards on home page and district pages**

Check that:
- Home page indicator cards show the new plain-language text
- District page `InsightCard` still works (it doesn't use `explainer` directly, so no change needed)
- National overview `IndicatorCard` shows the new explainer in the "What this means" box

- [ ] **Step 4: Commit**

```bash
git add lib/indicators.ts app/page.tsx
git commit -m "content: rewrite indicator descriptions for common people"
```

---

### Task 7: Fix Low Risk States Card & Add Descriptions to All Stat Cards

**Files:**
- Modify: `app/dashboard/national-overview.tsx:108-115` (change Low Risk icon/color treatment)
- Modify: `components/stat-card.tsx` (add optional `description` prop)

- [ ] **Step 1: Add `description` prop to StatCard**

In `components/stat-card.tsx`, add a `description?: string` prop:

```typescript
interface StatCardProps {
  label: string;
  value: number;
  change?: number;
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  total?: number;
  description?: string;  // NEW
}
```

Render it below the label:

```tsx
<div className="text-[11px] font-medium mt-1" style={{ color: "var(--dicra-text-muted)" }}>{label}</div>
{description && (
  <div className="text-[10px] mt-1 leading-relaxed" style={{ color: "var(--dicra-text-faint)" }}>
    {description}
  </div>
)}
```

- [ ] **Step 2: Change Low Risk States card icon and visual**

In `national-overview.tsx`, change the Low Risk card (lines 108-115):

- Replace `Check` icon with `Shield` (or `ShieldAlert` if zero, to flag it as concerning)
- When `riskCounts.low === 0`, use a warning-style treatment — amber/yellow accent instead of green, with an `AlertTriangle` icon
- Add conditional logic:

```tsx
<StatCard
  label="Low Risk States"
  value={riskCounts.low}
  accentColor={riskCounts.low === 0 ? "var(--dicra-risk-moderate)" : "var(--dicra-risk-low)"}
  iconBg={riskCounts.low === 0 ? "var(--dicra-risk-moderate-bg)" : "var(--dicra-risk-low-bg)"}
  icon={riskCounts.low === 0
    ? <AlertTriangle size={16} style={{ color: "var(--dicra-risk-moderate)" }} />
    : <Shield size={16} style={{ color: "var(--dicra-risk-low)" }} />
  }
  total={totalClassified}
  description={riskCounts.low === 0
    ? "No state is in the safe zone — all states show elevated climate risk"
    : "States with minimal climate risk across all indicators"
  }
/>
```

- [ ] **Step 3: Add descriptions to all 4 stat cards**

```
Critical: "States facing severe climate conditions requiring immediate action"
High: "States with significant risk that needs active monitoring"
Moderate: "States with some elevated indicators — watch for escalation"
Low: (as above, conditional)
```

- [ ] **Step 4: Verify dashboard stat cards**

Open `/dashboard`. Check:
- When low risk = 0: card shows amber/warning icon, not green check
- All 4 cards have descriptive text below the label
- Progress bars still work

- [ ] **Step 5: Commit**

```bash
git add components/stat-card.tsx app/dashboard/national-overview.tsx
git commit -m "fix: low risk card shows warning when zero, add descriptions to all stat cards"
```

---

### Task 8: Rewrite Methodology Page

**Files:**
- Modify: `app/methodology/page.tsx` (full content rewrite)

The methodology page needs to reflect all pipeline changes: 5-year baseline, SPI-3 upgrade, vulnerability scoring, current data sources, and limitations.

- [ ] **Step 1: Audit current methodology against actual pipeline**

Read `lib/indicators.ts`, `lib/scoring-client.ts`, `lib/weights.ts`, `lib/insights.ts`, and `lib/action-rules.ts` to compile the actual current methodology.

- [ ] **Step 2: Rewrite methodology content**

Update all sections of `app/methodology/page.tsx`:

1. **Scoring System** — describe 0-100 percentile scoring, weighted composite, how risk categories map
2. **Indicator Definitions** — use the new plain-language explainers from Task 6, plus technical methodology from `indicators.ts`
3. **Data Sources** — ensure source table matches current sources in `lib/sources.ts`
4. **Composite Score Weights** — document default weights from `lib/weights.ts` (rainfall 0.18, drought 0.18, vegetation 0.13, heat 0.13, flood 0.13, soil 0.13, vulnerability 0.12)
5. **Limitations** — update based on current known limitations

- [ ] **Step 3: Verify page renders and links work**

Open `/methodology`. All sections should render. The MethodologyBanner on the dashboard should link here correctly.

- [ ] **Step 4: Commit**

```bash
git add app/methodology/page.tsx
git commit -m "content: rewrite methodology page to reflect current pipeline"
```

---

### Task 9: Add Plain-Language Composite Score Explanation to District Page

**Files:**
- Modify: `app/district/[districtId]/district-scorecard.tsx:65-83`

- [ ] **Step 1: Add explanation text below the composite score**

After the risk badge (line 82), add a plain-language explanation:

```tsx
<p className="mt-3 text-[12px] leading-relaxed max-w-[360px]"
   style={{ color: "var(--dicra-text-secondary)" }}>
  {compositeScore !== null && risk === "critical"
    ? "This district faces severe climate stress across multiple indicators. Immediate monitoring and preparedness measures are recommended."
    : compositeScore !== null && risk === "high"
    ? "This district shows significant climate risk. Key indicators are elevated and should be actively monitored."
    : compositeScore !== null && risk === "moderate"
    ? "Some climate indicators are elevated in this district. Conditions warrant attention but are not yet critical."
    : compositeScore !== null && risk === "low"
    ? "This district currently shows minimal climate risk. Conditions are within normal ranges across most indicators."
    : null}
</p>
```

- [ ] **Step 2: Verify on a district page**

Open any district (e.g., `/district/1`). Below the large score number and risk badge, there should now be a sentence explaining what the score means.

- [ ] **Step 3: Commit**

```bash
git add app/district/[districtId]/district-scorecard.tsx
git commit -m "content: add plain-language composite score explanation on district page"
```

---

### Task 10: Review Period Card on District Page

**Files:**
- Modify: `app/district/[districtId]/district-scorecard.tsx:109-127`

The "Period" card in the metadata grid shows the date range of the data. This needs discussion with the user.

- [ ] **Step 1: Add contextual explanation to the Period card**

Currently the metadata grid shows just "Period" + date. Add a subtitle explaining what this means:

```tsx
{[
  {
    label: "Area",
    value: district.area_sq_km ? `${district.area_sq_km.toLocaleString()} km²` : "—",
    hint: "Total geographic area of this district",
  },
  {
    label: "Analysis Period",  // renamed from "Period"
    value: periodLabel,
    hint: "Time window for the climate data shown on this page",
  },
].map((item) => (
  <div key={item.label}
       className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4 flex flex-col justify-center"
       style={{ background: "var(--dicra-surface)" }}>
    <div className="text-[10px] font-semibold uppercase tracking-[0.8px] mb-1"
         style={{ color: "var(--dicra-text-muted)" }}>
      {item.label}
    </div>
    <div className="text-[18px] font-bold tracking-[-0.3px]"
         style={{ color: "var(--dicra-text-primary)" }}>
      {item.value}
    </div>
    <div className="text-[10px] mt-1" style={{ color: "var(--dicra-text-faint)" }}>
      {item.hint}
    </div>
  </div>
))}
```

**FLAG FOR DISCUSSION:** Should the Period card show something more useful — like "data freshness" (how recent the data is), or a comparison to previous period? Present options to user:
1. Keep as-is with added explanation (simplest)
2. Replace with "Data Freshness" showing how recent each data source is
3. Add "vs. Previous Period" showing if risk is trending up/down

- [ ] **Step 2: Commit with option 1 as default**

```bash
git add app/district/[districtId]/district-scorecard.tsx
git commit -m "content: rename Period to Analysis Period, add context hints to metadata cards"
```

---

## Phase D — Bug Fix (Item 10)

### Task 11: Fix Missing Vegetation Health and Vulnerability Index Scores

**Files:**
- Modify: `lib/queries.ts:95-99` (increase limit or fix query)
- Potentially modify: data pipeline scripts

**Root Cause Analysis:**

The `getDistrictDetail` function at line 98 uses `.limit(6)`:

```typescript
const { data: scores } = await supabase.from("climate_indicators")
  .select("indicator_type, value, score, period_start, period_end, source")
  .eq("district_id", districtId)
  .order("period_start", { ascending: false })
  .limit(6);
```

With 7 indicators per period, `.limit(6)` will ALWAYS miss at least 1 indicator from the latest period. If there are multiple periods, even more are lost. This is almost certainly the bug.

Additionally, the district scorecard (line 98 of `district-scorecard.tsx`) processes `latest_scores` to extract `indicatorScores` — if an indicator isn't in the results, it shows "—".

- [ ] **Step 1: Investigate the data**

Run a Supabase query to check:
1. How many rows exist per district per period?
2. Are vegetation_health and vulnerability rows actually in the database?
3. What does the limit(6) miss?

```sql
SELECT indicator_type, count(*) 
FROM climate_indicators 
WHERE district_id = 1 
GROUP BY indicator_type;
```

- [ ] **Step 2: Fix the query limit**

In `lib/queries.ts`, change `.limit(6)` to a proper limit that covers all indicators across enough periods for the trend chart. The district scorecard needs the latest period (7 indicators) + historical data for trends.

Change to:

```typescript
const { data: scores } = await supabase.from("climate_indicators")
  .select("indicator_type, value, score, period_start, period_end, source")
  .eq("district_id", districtId)
  .order("period_start", { ascending: false })
  .limit(70);  // 7 indicators × up to 10 periods
```

This ensures all 7 indicators for the latest period are fetched, plus historical data.

- [ ] **Step 3: Verify data also exists in the pipeline**

If the data isn't in the database at all (pipeline didn't ingest vegetation_health or vulnerability for some districts), that's a separate pipeline fix. Check the data ingestion scripts.

- [ ] **Step 4: Verify on district pages that previously showed "—"**

Open 3-4 district pages that were showing missing vegetation health / vulnerability scores. They should now show scores.

- [ ] **Step 5: Commit**

```bash
git add lib/queries.ts
git commit -m "fix: increase district query limit to fetch all 7 indicators"
```

---

## Phase E — Crop Impact Module (Item 9) — Brainstorm Required

### Task 12: Plan the District Crop Impact Analysis Module

**This task requires a brainstorm session before implementation.** Do NOT start coding.

**Key questions to resolve:**

1. **Data source for major crops per district:**
   - Ministry of Agriculture crop statistics?
   - ICRISAT district-level crop database?
   - Manual CSV upload with district → crop mapping?
   - How many crops per district? (top 3? top 5?)

2. **Climate-crop impact mapping:**
   - How do specific indicators affect specific crops? (e.g., rice needs water, wheat needs moderate temp)
   - Where does this knowledge come from? Academic literature? ICAR advisories?
   - Is this static rules or dynamic thresholds?

3. **Display design:**
   - Card per crop showing: crop name, area under cultivation, current risk factors, projected impact
   - Or a summary section showing all major crops with traffic-light status?

4. **Scope:**
   - District-level only (confirmed)
   - Current period only, or trend?
   - How specific should impact statements be?

- [ ] **Step 1: Present brainstorm agenda to user**

Share the above questions and propose 2-3 architectural approaches for discussion.

- [ ] **Step 2: After discussion, create a separate implementation plan**

Based on brainstorm outcomes, write a dedicated plan for this module.

---

## Execution Order

**Recommended sequence:**

1. **Phase D (Task 11)** — Fix the bug first, it's blocking real data display
2. **Phase A (Tasks 1-2)** — Quick wins, 10 minutes total
3. **Phase C Task 6** — Content rewrite for indicators (needed before Phase B and other Phase C tasks)
4. **Phase B (Tasks 3-5)** — Navigation + About page + Logo
5. **Phase C (Tasks 7-10)** — Remaining content work
6. **Phase E (Task 12)** — Brainstorm session for crop module

**Total estimated tasks:** 12 tasks, ~35 discrete steps

**Dependencies:**
- Task 6 (indicator rewrites) should be done before Task 8 (methodology rewrite) since the methodology page references indicator descriptions
- Task 11 (bug fix) is independent and should be first
- Task 12 (crop module) is independent and deferred to brainstorm

# DiCRA Landing Page — Design Spec

**Date:** 2026-04-21
**Status:** Draft
**Scope:** Public-facing landing page for government/policy stakeholders

## 1. Goal

A landing page at `/` that explains DiCRA's mission, data sources, methodology, and current status to government/policy stakeholders. The dashboard moves from `/` to `/dashboard`. The page must build trust by showing honest data provenance — every number traces to a named institutional source.

## 2. Route Changes

- `/` — new landing page (server component, public)
- `/dashboard` — current national overview (move existing `page.tsx` + `national-overview.tsx`)
- All other routes unchanged (`/state/[id]`, `/district/[id]`, `/compare`, `/alerts`, `/weights`, `/methodology`)
- Sidebar nav "Overview" link changes from `/` to `/dashboard`

## 3. Page Sections

### 3.1 Hero

Full-width, parchment background (`var(--dicra-bg)`).

**Headline:** "District-level climate risk intelligence for India"
- Font: DM Sans 800, 36-40px, `var(--dicra-text-primary)`, tight tracking

**Subtitle:** "Monitoring 784 districts across 36 states with real-time data from IMD, ISRO, and Copernicus"
- Font: DM Sans 400, 16px, `var(--dicra-text-muted)`

**CTAs (side by side):**
- Primary: "Explore Dashboard →" — `var(--dicra-brand)` background, white text, links to `/dashboard`
- Secondary: "Read Methodology" — outline style, `var(--dicra-brand)` border/text, links to `/methodology`

**Credibility strip** below CTAs — 3 items in a horizontal row:
- "6 Climate Indicators" 
- "784 Districts Monitored"
- "Peer-Reviewed Methods"

Each item: icon + number + label, separated by subtle dividers. Use `var(--dicra-text-secondary)` for numbers, `var(--dicra-text-muted)` for labels.

### 3.2 The Problem

**Section title:** "Why district-level climate risk matters"

3 cards in a grid:

**Card 1: Climate Vulnerability**
"India ranks among the most climate-vulnerable nations. Extreme weather events — droughts, floods, heat waves — have intensified over the past decade, disproportionately impacting rural districts with limited adaptive capacity."

**Card 2: Data Fragmentation**
"IMD, ISRO, ECMWF, and NASA publish climate data independently in different formats, resolutions, and timelines. No unified, district-level risk view exists for state and district administrators."

**Card 3: The Decision Gap**
"Policy makers allocate disaster preparedness resources based on national or state averages. District-level granularity is essential for targeted intervention — the difference between effective response and wasted budgets."

Cards use `var(--dicra-surface)` background, `var(--dicra-border)` border, `var(--dicra-radius-lg)` radius. Each card has a colored top accent (use indicator colors for visual variety).

### 3.3 What DiCRA Provides

**Section title:** "Six indicators, one composite risk score"

**Section subtitle:** "Each indicator is scored 0-100 using percentile ranking against historical baselines. A weighted composite score identifies the districts most at risk."

6 compact indicator cards in a 3×2 grid. Each card shows:
- Colored dot (indicator color from `INDICATORS[key].color`)
- Indicator label
- One-line description (first sentence of `INDICATORS[key].explainer`)
- Source badge: `INDICATORS[key].source` with reliability tag

Pull all content from `lib/indicators.ts` — no hardcoded text.

### 3.4 Data Sources & Trust

**Section title:** "Every number traces to a real source"

**Callout banner:** "DiCRA does not generate or estimate data. All scores are computed from published government and institutional datasets using transparent, peer-reviewed methodologies."
- Style: `var(--dicra-brand)` background, white text (same as methodology banner pattern)

**Source table/cards** — one row per source, built from `SOURCE_LIST`:
- Institution logo/name
- Dataset name
- Resolution
- Temporal coverage
- Update frequency
- Reliability badge (HIGH / MODERATE / DERIVED)

Use `RELIABILITY_STYLES` from `lib/sources.ts`.

### 3.5 Platform Status

**Section title:** "Platform Status — What's Live"

This section queries the actual database at render time (server component) to show honest status.

For each of the 6 indicators, show:
- Indicator name
- Status: "Live — X districts, Month Year" or "Coming Soon — pending [reason]"
- Green check icon for live, gray clock icon for pending

**Current expected state (as of April 2026):**
- Rainfall Anomaly: Live (785 districts, June 2024, source: IMD Pune)
- Heat Stress: Live (785 districts, June 2024, source: IMD Pune)
- Drought Index: Coming Soon (requires multi-month rainfall history)
- Vegetation Health: Coming Soon (pending GEE account registration)
- Soil Moisture: Coming Soon (pending CDS account registration)
- Flood Risk: Coming Soon (depends on soil moisture + rainfall)

This is computed dynamically from `SELECT DISTINCT indicator_type, count(*), max(period_start) FROM climate_indicators GROUP BY indicator_type`.

### 3.6 CTA Footer

**Headline:** "Ready to explore India's climate risk data?"

Large "Go to Dashboard →" button (same style as hero primary CTA).
Secondary link: "Read Full Methodology"

Background: subtle gradient or slightly darker parchment to distinguish from the rest of the page.

## 4. Layout & Styling

- **No sidebar** on the landing page — full-width layout
- Top: minimal nav bar with "DiCRA" logo on left, "Dashboard" and "Methodology" links on right
- Each section uses max-width container (1200px) centered
- Section spacing: 80-100px vertical padding between sections
- Alternating subtle background tones for visual rhythm (parchment, white, parchment)
- All text and colors from `var(--dicra-*)` tokens

## 5. Files to Create/Modify

### New files:
- `app/landing/page.tsx` — landing page content (server component)
- `app/landing/landing-page.tsx` — landing page client component

### Modified files:
- `app/page.tsx` — change to render landing page (import landing component)
- `app/layout.tsx` — conditionally show sidebar (hide on `/`)
- `app/dashboard/page.tsx` — new route, move national overview here
- `app/dashboard/national-overview.tsx` — move from `app/national-overview.tsx`
- `components/sidebar.tsx` — update Overview link from `/` to `/dashboard`

### Route structure:
```
app/
  page.tsx                    — landing page (no sidebar)
  layout.tsx                  — conditional sidebar (hide when pathname === "/")
  dashboard/
    page.tsx                  — national overview (was /)
    national-overview.tsx     — moved from app/
  state/[stateId]/            — unchanged
  district/[districtId]/      — unchanged
  compare/                    — unchanged
  alerts/                     — unchanged
  weights/                    — unchanged
  methodology/                — unchanged
```

The simpler approach: `layout.tsx` conditionally renders the sidebar based on pathname. The landing page at `/` gets full-width layout. All `/dashboard`, `/state/*`, `/district/*`, etc. get the sidebar.

## 6. Data Requirements

The landing page is a server component. It needs one database query for the Platform Status section:

```sql
SELECT indicator_type::text, count(*) as district_count, max(period_start) as latest_period
FROM climate_indicators
GROUP BY indicator_type
```

Add a query function in `lib/queries.ts`:
```ts
export async function getIndicatorStatus() {
  const supabase = await createClient();
  const { data } = await supabase.rpc('get_indicator_status');
  return data || [];
}
```

Or use a direct query with the Supabase client.

## 7. Out of Scope

- Authentication/login
- Contact form
- Blog/news section
- Animations/transitions (keep it fast and professional)
- Mobile responsive (defer — focus on desktop for presentation)

# Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all critical and major bugs found in the platform audit — type conflicts, broken links, missing data handling, hardcoded values.

**Architecture:** Consolidate the dual type system, fix broken navigation, add proper null/error handling, make counts dynamic.

**Tech Stack:** Next.js 16, TypeScript, Supabase queries.

---

## Task 1: Consolidate Type System — Remove Duplicates from lib/types.ts

**Files:**
- Modify: `lib/types.ts`
- Modify: `components/map/choropleth-map.tsx`
- Modify: `app/alerts/alerts-dashboard.tsx`
- Modify: `app/weights/page.tsx`
- Modify: `components/charts/radar-chart.tsx`
- Modify: `components/charts/trend-chart.tsx`

- [ ] **Step 1: Clean lib/types.ts**

Remove from `lib/types.ts`: `IndicatorType`, `INDICATOR_LABELS`, `INDICATOR_COLORS`, `RiskCategory`, `RISK_COLORS`, `classifyRisk`, `DEFAULT_WEIGHTS`.

Keep: `StateWithScore`, `DistrictWithScore`, `IndicatorRecord`, `AlertEvent`, `WeightProfile`, `DataSourceStatus`.

Update `StateWithScore` and `DistrictWithScore` to import `IndicatorType` from `@/lib/indicators`:

```ts
import type { IndicatorType } from "./indicators";
```

- [ ] **Step 2: Fix all broken imports**

Search all files that import from `@/lib/types` and fix:
- `choropleth-map.tsx` — import `classifyRisk`, `RISK_COLORS` from `@/lib/indicators` instead. Note: `RISK_COLORS` in indicators.ts uses CSS variables, but choropleth-map needs raw hex values for MapLibre. Create a `RISK_HEX_COLORS` export in indicators.ts:
  ```ts
  export const RISK_HEX_COLORS: Record<RiskLevel, string> = {
    critical: "#DC2626",
    high: "#EA580C",
    moderate: "#D97706",
    low: "#16A34A",
  };
  ```
- `alerts-dashboard.tsx` — replace `INDICATOR_LABELS[x]` with `INDICATORS[x]?.label`
- `weights/page.tsx` — replace `INDICATOR_LABELS` with `INDICATORS`
- `radar-chart.tsx` — replace `INDICATOR_LABELS` with `INDICATORS[x]?.label`
- `trend-chart.tsx` — replace `INDICATOR_LABELS` and `INDICATOR_COLORS` with `INDICATORS`

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: consolidate type system — remove duplicates from lib/types.ts"
```

---

## Task 2: Fix Broken Links and Missing Fields

**Files:**
- Modify: `components/state-ranking.tsx`
- Modify: `app/district/[districtId]/district-scorecard.tsx`

- [ ] **Step 1: Fix "/rankings" broken link in state-ranking.tsx**

Find the "All →" link and change it to link to `/dashboard` (or remove it entirely since there's no rankings page). Replace:
```tsx
<Link href="/rankings" ...>All →</Link>
```
with just a label (no link):
```tsx
<span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-muted)" }}>Top {limit}</span>
```

- [ ] **Step 2: Fix district rank field in district-scorecard.tsx**

The rank field doesn't exist in the query. Either:
a) Remove the "Rank" metadata card, OR
b) Compute rank client-side from available data

Choose (a) — remove the Rank card. Replace the 2×2 metadata grid with 3 items: LGD Code, Area, Period. Use a 3-column grid instead of 2×2.

- [ ] **Step 3: Commit**

```bash
git add components/state-ranking.tsx app/district/
git commit -m "fix: remove broken /rankings link and non-existent rank field"
```

---

## Task 3: Dynamic Counts and Hardcoded Values

**Files:**
- Modify: `app/dashboard/national-overview.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Fix national overview subtitle**

In `app/dashboard/national-overview.tsx`, change the hardcoded subtitle. Compute district count by summing stat card values, and state count from `states.length`:

Replace hardcoded text with:
```tsx
<div className="text-[13px] mt-0.5" style={{ color: "var(--dicra-text-muted)" }}>
  {totalDistricts} districts across {states.length} states and union territories
</div>
```
Where `totalDistricts` is the sum of all risk category counts.

- [ ] **Step 2: Fix landing page hardcoded values**

In `app/page.tsx`, replace hardcoded "784" and "6" with dynamic values:
- "6" → `{INDICATOR_LIST.length}`  
- "784" → query district count from DB, or use a constant from a config

For the hero subtitle, query the actual count:
```tsx
const supabase = await createClient();
const { count: districtCount } = await supabase.from("districts").select("id", { count: "exact", head: true });
const { count: stateCount } = await supabase.from("states").select("id", { count: "exact", head: true });
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/national-overview.tsx app/page.tsx
git commit -m "fix: replace hardcoded counts with dynamic values"
```

---

## Task 4: Error Handling and Null Safety

**Files:**
- Modify: `app/compare/page.tsx`
- Modify: `components/indicator-card.tsx`
- Modify: `app/dashboard/national-overview.tsx`

- [ ] **Step 1: Add error handling to Compare page**

Add `.catch()` to all fetch calls. Add a simple error state:

```tsx
const [error, setError] = useState<string | null>(null);
// On each fetch:
.catch(() => setError("Failed to load data"));
// In render:
{error && <div className="text-[13px] p-4" style={{ color: "var(--dicra-risk-critical)" }}>{error}</div>}
```

- [ ] **Step 2: Fix null score visual in indicator-card.tsx**

When score is null, show a distinct "No data" state instead of 0% progress bar:

```tsx
{score !== null ? (
  <>
    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--dicra-border-subtle)" }}>
      <div className="h-full rounded-full" style={{ width: `${score}%`, background: meta.color }} />
    </div>
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: "var(--dicra-accent)" }} />
      <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>{meta.source} · {meta.frequency}</span>
    </div>
  </>
) : (
  <div className="mt-2 text-[10px] italic" style={{ color: "var(--dicra-text-faint)" }}>
    Data pending — source not yet connected
  </div>
)}
```

- [ ] **Step 3: Show all 6 indicators on national overview**

In `app/dashboard/national-overview.tsx`, change the indicator row from showing only 3 to showing all 6. Use `ALL_INDICATOR_KEYS` from `lib/indicators.ts`:

```tsx
<div className="grid grid-cols-3 gap-3 mt-4">
  {ALL_INDICATOR_KEYS.map((key) => (
    <IndicatorCard key={key} indicatorType={key} score={avgIndicator(key)} showExplainer={false} />
  ))}
</div>
```

This way indicators with data show scores, and those without show "Data pending".

- [ ] **Step 4: Verify build**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add app/compare/ components/indicator-card.tsx app/dashboard/national-overview.tsx
git commit -m "fix: add error handling, null safety, show all 6 indicators"
```

---

## Task 5: Fix Source Footer Data Mismatch

**Files:**
- Modify via Supabase MCP: `data_sources` table

- [ ] **Step 1: Add missing source entries to database**

The `data_sources` table is missing entries for `computed_spi` and `computed_flood`. Add them via Supabase MCP:

```sql
INSERT INTO data_sources (source_name, description, status, fetch_frequency)
VALUES 
  ('computed_spi', 'Standardized Precipitation Index computed from rainfall history', 'pending', 'monthly'),
  ('computed_flood', 'Composite flood risk score from rainfall + soil moisture', 'pending', 'monthly')
ON CONFLICT DO NOTHING;
```

Also update `imd_rainfall` and `imd_temperature` status to reflect the real pipeline run.

- [ ] **Step 2: Verify source footer displays correctly**

Check `/api/data-freshness` returns all 7 sources with correct status.

---

## Task 6: Final Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Verify all pages load without errors**

Check: `/`, `/dashboard`, `/state/1`, `/district/1`, `/compare`, `/alerts`, `/weights`, `/methodology`

- [ ] **Step 3: Commit any remaining fixes**

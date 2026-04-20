# Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js dashboard with MapLibre choropleth maps, Recharts visualizations, and interactive weight configuration — providing the National → State → District drill-down experience for climate risk analysis.

**Architecture:** Next.js App Router with server components for data fetching, client components for maps/charts/interactivity. Supabase server client reads from PostGIS. MapLibre GL JS renders choropleth maps from pre-exported GeoJSON. Recharts handles all charting. Weight configuration stored in localStorage, applied client-side to compute composite scores from individual indicator scores.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, MapLibre GL JS, Recharts, Tanstack Table, Supabase SSR client

**Spec:** `docs/superpowers/specs/2026-04-18-climate-risk-platform-design.md` (Section 5)

**Plan series:**
1. Foundation (complete) — project setup, database, geospatial boundaries
2. Data Pipeline (complete) — fetchers, processors, scorers
3. **Dashboard** (this plan) — Next.js pages, maps, charts, weight configuration

---

## File Structure

```
app/
├── layout.tsx                    # MODIFY — add nav, metadata, weight provider
├─�� page.tsx                      # MODIFY — national overview (home page)
├── state/
│   └── [stateId]/
│       └── page.tsx              # State view with district choropleth
├── district/
│   └── [districtId]/
│       └── page.tsx              # District scorecard
├── compare/
│   └── page.tsx                  # Comparison tool
├── alerts/
│   └── page.tsx                  # Alerts dashboard
├── weights/
│   └── page.tsx                  # Weight configuration
├── api/
│   ├── states/
│   │   └── route.ts              # API: list states with risk scores
│   ��── states/[stateId]/
│   │   └── districts/
│   │       └── route.ts          # API: districts for a state
│   ���── districts/[districtId]/
│   │   └── route.ts              # API: district scorecard data
│   ├─��� districts/[districtId]/
│   │   └── history/
│   │       └── route.ts          # API: historical indicator data
│   ├── alerts/
│   │   └─��� route.ts              # API: active alerts
│   ├── data-freshness/
│   │   └── route.ts              # API: data source freshness
│   └── weight-presets/
│       └── route.ts              # API: weight presets from DB
├── globals.css                   # MODIFY — add map styles
components/
├── nav.tsx                       # Top navigation bar
├── data-freshness.tsx            # Data freshness badge
├── map/
│   ├── choropleth-map.tsx        # MapLibre choropleth (client component)
│   └── map-legend.tsx            # Color legend for risk scores
├── charts/
│   ��── indicator-gauge.tsx       # Single indicator score gauge
│   ├── trend-chart.tsx           # Historical trend line chart
���   └── radar-chart.tsx           # Spider/radar comparison chart
├── risk-badge.tsx                # Risk category badge (low/moderate/high/critical)
├── state-ranking.tsx             # Ranked list of states/districts
├── weight-sliders.tsx            # Weight configuration sliders
└── weight-provider.tsx           # Context provider for weights
lib/
├── supabase/
│   ├── client.ts                 # EXISTING
│   └── server.ts                 # EXISTING
├── queries.ts                    # Database query functions
├── scoring-client.ts             # Client-side composite score computation
├── weights.ts                    # Weight types, localStorage persistence
└── types.ts                      # Shared TypeScript types
```

---

## Task 1: Install Frontend Dependencies + TypeScript Types

**Files:**
- Modify: `package.json` (via npm install)
- Create: `lib/types.ts`

- [ ] **Step 1: Install MapLibre, Recharts, Tanstack Table**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
npm install maplibre-gl recharts @tanstack/react-table
```

- [ ] **Step 2: Create shared TypeScript types**

Create `lib/types.ts`:

```typescript
export type IndicatorType =
  | "rainfall_anomaly"
  | "drought_index"
  | "vegetation_health"
  | "heat_stress"
  | "flood_risk"
  | "soil_moisture";

export const INDICATOR_LABELS: Record<IndicatorType, string> = {
  rainfall_anomaly: "Rainfall Anomaly",
  drought_index: "Drought Index",
  vegetation_health: "Vegetation Health",
  heat_stress: "Heat Stress",
  flood_risk: "Flood Risk",
  soil_moisture: "Soil Moisture",
};

export const INDICATOR_COLORS: Record<IndicatorType, string> = {
  rainfall_anomaly: "#3b82f6",
  drought_index: "#f59e0b",
  vegetation_health: "#22c55e",
  heat_stress: "#ef4444",
  flood_risk: "#6366f1",
  soil_moisture: "#06b6d4",
};

export type RiskCategory = "low" | "moderate" | "high" | "critical";

export const RISK_COLORS: Record<RiskCategory, string> = {
  low: "#22c55e",
  moderate: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export function classifyRisk(score: number): RiskCategory {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "critical";
}

export interface StateWithScore {
  id: number;
  lgd_code: number;
  name: string;
  area_sq_km: number | null;
  composite_score: number | null;
  indicator_scores: Partial<Record<IndicatorType, number>>;
}

export interface DistrictWithScore {
  id: number;
  lgd_code: number;
  name: string;
  state_id: number;
  state_name: string;
  area_sq_km: number | null;
  composite_score: number | null;
  indicator_scores: Partial<Record<IndicatorType, number>>;
}

export interface IndicatorRecord {
  district_id: number;
  indicator_type: IndicatorType;
  value: number;
  score: number;
  period_start: string;
  period_end: string;
  source: string;
}

export interface AlertEvent {
  id: number;
  district_id: number;
  district_name: string;
  state_name: string;
  indicator_type: IndicatorType;
  threshold_value: number;
  severity: "warning" | "critical";
  current_value: number;
  triggered_at: string;
  acknowledged: boolean;
}

export interface WeightProfile {
  name: string;
  weights: Record<IndicatorType, number>;
}

export interface DataSourceStatus {
  source_name: string;
  description: string;
  last_fetched: string | null;
  status: "ok" | "error" | "stale" | "pending";
  fetch_frequency: string;
}

export const DEFAULT_WEIGHTS: Record<IndicatorType, number> = {
  rainfall_anomaly: 0.2,
  drought_index: 0.2,
  vegetation_health: 0.15,
  heat_stress: 0.15,
  flood_risk: 0.15,
  soil_moisture: 0.15,
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts package.json package-lock.json
git commit -m "feat: install MapLibre, Recharts, Tanstack Table and add shared types"
```

---

## Task 2: Weight System (Context Provider + localStorage)

**Files:**
- Create: `lib/weights.ts`
- Create: `lib/scoring-client.ts`
- Create: `components/weight-provider.tsx`

- [ ] **Step 1: Create weight persistence helpers**

Create `lib/weights.ts`:

```typescript
import { IndicatorType, WeightProfile, DEFAULT_WEIGHTS } from "./types";

const STORAGE_KEY = "dicrav2_weights";

export function loadWeights(): Record<IndicatorType, number> {
  if (typeof window === "undefined") return { ...DEFAULT_WEIGHTS };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...DEFAULT_WEIGHTS };
}

export function saveWeights(weights: Record<IndicatorType, number>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
}

export function rebalanceWeights(
  weights: Record<IndicatorType, number>,
  changedKey: IndicatorType,
  newValue: number
): Record<IndicatorType, number> {
  const result = { ...weights };
  result[changedKey] = newValue;

  const otherKeys = (Object.keys(result) as IndicatorType[]).filter(
    (k) => k !== changedKey
  );
  const remaining = 1 - newValue;
  const otherSum = otherKeys.reduce((sum, k) => sum + weights[k], 0);

  if (otherSum === 0) {
    const equal = remaining / otherKeys.length;
    otherKeys.forEach((k) => (result[k] = equal));
  } else {
    otherKeys.forEach((k) => {
      result[k] = (weights[k] / otherSum) * remaining;
    });
  }

  return result;
}
```

- [ ] **Step 2: Create client-side scoring**

Create `lib/scoring-client.ts`:

```typescript
import { IndicatorType } from "./types";

export function computeCompositeScore(
  indicatorScores: Partial<Record<IndicatorType, number>>,
  weights: Record<IndicatorType, number>
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [indicator, score] of Object.entries(indicatorScores)) {
    const weight = weights[indicator as IndicatorType];
    if (weight !== undefined && score !== undefined && score !== null) {
      weightedSum += weight * score;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}
```

- [ ] **Step 3: Create weight context provider**

Create `components/weight-provider.tsx`:

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndicatorType, DEFAULT_WEIGHTS } from "@/lib/types";
import { loadWeights, saveWeights, rebalanceWeights } from "@/lib/weights";

interface WeightContextValue {
  weights: Record<IndicatorType, number>;
  setWeight: (key: IndicatorType, value: number) => void;
  resetToDefaults: () => void;
  applyPreset: (weights: Record<IndicatorType, number>) => void;
}

const WeightContext = createContext<WeightContextValue | null>(null);

export function WeightProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<Record<IndicatorType, number>>(DEFAULT_WEIGHTS);

  useEffect(() => {
    setWeights(loadWeights());
  }, []);

  const setWeight = (key: IndicatorType, value: number) => {
    const newWeights = rebalanceWeights(weights, key, value);
    setWeights(newWeights);
    saveWeights(newWeights);
  };

  const resetToDefaults = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    saveWeights({ ...DEFAULT_WEIGHTS });
  };

  const applyPreset = (preset: Record<IndicatorType, number>) => {
    setWeights(preset);
    saveWeights(preset);
  };

  return (
    <WeightContext.Provider value={{ weights, setWeight, resetToDefaults, applyPreset }}>
      {children}
    </WeightContext.Provider>
  );
}

export function useWeights() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeights must be used within WeightProvider");
  return ctx;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/weights.ts lib/scoring-client.ts components/weight-provider.tsx
git commit -m "feat: add weight system with localStorage persistence and context provider"
```

---

## Task 3: Database Queries + API Routes

**Files:**
- Create: `lib/queries.ts`
- Create: `app/api/states/route.ts`
- Create: `app/api/states/[stateId]/districts/route.ts`
- Create: `app/api/districts/[districtId]/route.ts`
- Create: `app/api/districts/[districtId]/history/route.ts`
- Create: `app/api/alerts/route.ts`
- Create: `app/api/data-freshness/route.ts`
- Create: `app/api/weight-presets/route.ts`

- [ ] **Step 1: Create database query functions**

Create `lib/queries.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getStatesWithLatestScores() {
  const supabase = await createClient();

  const { data: states } = await supabase
    .from("states")
    .select("id, lgd_code, name, area_sq_km")
    .order("name");

  if (!states) return [];

  const { data: scores } = await supabase.rpc("get_latest_state_scores");

  const scoreMap = new Map<number, Record<string, number>>();
  if (scores) {
    for (const row of scores) {
      if (!scoreMap.has(row.state_id)) scoreMap.set(row.state_id, {});
      scoreMap.get(row.state_id)![row.indicator_type] = row.avg_score;
    }
  }

  return states.map((s: any) => ({
    ...s,
    indicator_scores: scoreMap.get(s.id) || {},
  }));
}

export async function getDistrictsForState(stateId: number) {
  const supabase = await createClient();

  const { data: districts } = await supabase
    .from("districts")
    .select("id, lgd_code, name, area_sq_km, state_id")
    .eq("state_id", stateId)
    .order("name");

  if (!districts) return [];

  const districtIds = districts.map((d: any) => d.id);

  const { data: scores } = await supabase
    .from("climate_indicators")
    .select("district_id, indicator_type, score")
    .in("district_id", districtIds)
    .order("period_start", { ascending: false })
    .limit(districtIds.length * 6);

  const scoreMap = new Map<number, Record<string, number>>();
  if (scores) {
    for (const row of scores) {
      if (!scoreMap.has(row.district_id)) scoreMap.set(row.district_id, {});
      const existing = scoreMap.get(row.district_id)!;
      if (!existing[row.indicator_type]) {
        existing[row.indicator_type] = row.score;
      }
    }
  }

  return districts.map((d: any) => ({
    ...d,
    indicator_scores: scoreMap.get(d.id) || {},
  }));
}

export async function getDistrictDetail(districtId: number) {
  const supabase = await createClient();

  const { data: district } = await supabase
    .from("districts")
    .select("id, lgd_code, name, area_sq_km, state_id, states(name)")
    .eq("id", districtId)
    .single();

  const { data: scores } = await supabase
    .from("climate_indicators")
    .select("indicator_type, value, score, period_start, period_end, source")
    .eq("district_id", districtId)
    .order("period_start", { ascending: false })
    .limit(6);

  return { district, latest_scores: scores || [] };
}

export async function getDistrictHistory(districtId: number) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("climate_indicators")
    .select("indicator_type, value, score, period_start")
    .eq("district_id", districtId)
    .order("period_start", { ascending: true });

  return data || [];
}

export async function getAlerts() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("alert_events")
    .select(`
      id, district_id, current_value, triggered_at, acknowledged,
      districts(name, state_id, states(name)),
      alert_thresholds(indicator_type, threshold_value, severity)
    `)
    .eq("acknowledged", false)
    .order("triggered_at", { ascending: false })
    .limit(200);

  return data || [];
}

export async function getDataFreshness() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("data_sources")
    .select("source_name, description, last_fetched, status, fetch_frequency")
    .order("source_name");

  return data || [];
}

export async function getWeightPresets() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("risk_score_defaults")
    .select("name, description, weights")
    .order("name");

  return data || [];
}
```

- [ ] **Step 2: Create API routes**

Create `app/api/states/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getStatesWithLatestScores } from "@/lib/queries";

export async function GET() {
  const states = await getStatesWithLatestScores();
  return NextResponse.json(states);
}
```

Create `app/api/states/[stateId]/districts/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDistrictsForState } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ stateId: string }> }
) {
  const { stateId } = await params;
  const districts = await getDistrictsForState(parseInt(stateId));
  return NextResponse.json(districts);
}
```

Create `app/api/districts/[districtId]/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDistrictDetail } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  const { districtId } = await params;
  const detail = await getDistrictDetail(parseInt(districtId));
  return NextResponse.json(detail);
}
```

Create `app/api/districts/[districtId]/history/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDistrictHistory } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ districtId: string }> }
) {
  const { districtId } = await params;
  const history = await getDistrictHistory(parseInt(districtId));
  return NextResponse.json(history);
}
```

Create `app/api/alerts/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/queries";

export async function GET() {
  const alerts = await getAlerts();
  return NextResponse.json(alerts);
}
```

Create `app/api/data-freshness/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDataFreshness } from "@/lib/queries";

export async function GET() {
  const freshness = await getDataFreshness();
  return NextResponse.json(freshness);
}
```

Create `app/api/weight-presets/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getWeightPresets } from "@/lib/queries";

export async function GET() {
  const presets = await getWeightPresets();
  return NextResponse.json(presets);
}
```

- [ ] **Step 3: Create the RPC function for state-level score aggregation**

This needs to be run on Supabase (via MCP or SQL editor):

```sql
CREATE OR REPLACE FUNCTION get_latest_state_scores()
RETURNS TABLE(state_id BIGINT, indicator_type TEXT, avg_score NUMERIC) AS $$
  SELECT d.state_id, ci.indicator_type::TEXT, ROUND(AVG(ci.score), 0) as avg_score
  FROM climate_indicators ci
  JOIN districts d ON ci.district_id = d.id
  WHERE ci.period_start = (
    SELECT MAX(period_start) FROM climate_indicators
  )
  GROUP BY d.state_id, ci.indicator_type
$$ LANGUAGE sql STABLE;
```

- [ ] **Step 4: Commit**

```bash
git add lib/queries.ts app/api/
git commit -m "feat: add database queries and API routes for all dashboard pages"
```

---

## Task 4: Navigation + Layout

**Files:**
- Create: `components/nav.tsx`
- Create: `components/data-freshness.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create navigation component**

Create `components/nav.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/alerts", label: "Alerts" },
  { href: "/weights", label: "Weights" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4">
        <Link href="/" className="mr-8 text-lg font-semibold tracking-tight">
          Climate Risk India
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create data freshness badge**

Create `components/data-freshness.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { DataSourceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DataFreshness() {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);

  useEffect(() => {
    fetch("/api/data-freshness")
      .then((r) => r.json())
      .then(setSources)
      .catch(() => {});
  }, []);

  if (sources.length === 0) return null;

  const worstStatus = sources.some((s) => s.status === "error")
    ? "error"
    : sources.some((s) => s.status === "stale")
      ? "stale"
      : sources.some((s) => s.status === "pending")
        ? "pending"
        : "ok";

  const statusColor = {
    ok: "bg-green-500",
    stale: "bg-yellow-500",
    error: "bg-red-500",
    pending: "bg-neutral-400",
  }[worstStatus];

  const latestFetch = sources
    .filter((s) => s.last_fetched)
    .sort((a, b) => (b.last_fetched! > a.last_fetched! ? 1 : -1))[0];

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span className={cn("h-2 w-2 rounded-full", statusColor)} />
      <span>
        {latestFetch?.last_fetched
          ? `Updated ${new Date(latestFetch.last_fetched).toLocaleDateString()}`
          : "No data yet"}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Update root layout**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { DataFreshness } from "@/components/data-freshness";
import { WeightProvider } from "@/components/weight-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Climate Risk India — District-Level Risk Analysis",
  description:
    "Climate risk analysis platform for India with district-level risk scoring, interactive dashboards, and configurable indicators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="flex min-h-full flex-col bg-neutral-50">
        <WeightProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-white px-4 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <span className="text-xs text-neutral-400">
                Climate Risk India v0.1
              </span>
              <DataFreshness />
            </div>
          </footer>
        </WeightProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Add map CSS to globals**

Append to `app/globals.css` (after existing content):

```css
/* MapLibre GL JS */
.maplibregl-map {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 5: Commit**

```bash
git add components/nav.tsx components/data-freshness.tsx app/layout.tsx app/globals.css
git commit -m "feat: add navigation, layout, data freshness badge"
```

---

## Task 5: Shared UI Components (Risk Badge, Indicator Gauge, Map Legend)

**Files:**
- Create: `components/risk-badge.tsx`
- Create: `components/charts/indicator-gauge.tsx`
- Create: `components/map/map-legend.tsx`

- [ ] **Step 1: Create risk badge**

Create `components/risk-badge.tsx`:

```typescript
import { classifyRisk, RISK_COLORS, RiskCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({ score }: { score: number | null }) {
  if (score === null) return <Badge variant="outline">No data</Badge>;

  const category = classifyRisk(score);
  const color = RISK_COLORS[category];

  return (
    <Badge
      style={{ backgroundColor: color, color: category === "low" ? "#000" : "#fff" }}
    >
      {score} — {category}
    </Badge>
  );
}
```

- [ ] **Step 2: Create indicator gauge card**

Create `components/charts/indicator-gauge.tsx`:

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorType, INDICATOR_LABELS, INDICATOR_COLORS, classifyRisk, RISK_COLORS } from "@/lib/types";

interface IndicatorGaugeProps {
  type: IndicatorType;
  score: number | null;
  value?: number | null;
}

export function IndicatorGauge({ type, score, value }: IndicatorGaugeProps) {
  const label = INDICATOR_LABELS[type];
  const color = INDICATOR_COLORS[type];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score !== null && score !== undefined ? (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold" style={{ color }}>
              {score}
            </span>
            <span className="mb-1 text-sm text-neutral-500">/100</span>
            <span
              className="mb-1 ml-auto rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: RISK_COLORS[classifyRisk(score)] }}
            >
              {classifyRisk(score)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-neutral-400">No data</span>
        )}
        {value !== null && value !== undefined && (
          <p className="mt-1 text-xs text-neutral-400">
            Raw value: {typeof value === "number" ? value.toFixed(2) : value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create map legend**

Create `components/map/map-legend.tsx`:

```typescript
import { RISK_COLORS } from "@/lib/types";

export function MapLegend() {
  const items = [
    { label: "Low (0-25)", color: RISK_COLORS.low },
    { label: "Moderate (26-50)", color: RISK_COLORS.moderate },
    { label: "High (51-75)", color: RISK_COLORS.high },
    { label: "Critical (76-100)", color: RISK_COLORS.critical },
  ];

  return (
    <div className="flex items-center gap-4 rounded-md bg-white/90 px-3 py-2 text-xs shadow-sm">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-neutral-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/risk-badge.tsx components/charts/indicator-gauge.tsx components/map/map-legend.tsx
git commit -m "feat: add risk badge, indicator gauge, and map legend components"
```

---

## Task 6: Choropleth Map Component (MapLibre)

**Files:**
- Create: `components/map/choropleth-map.tsx`

- [ ] **Step 1: Create the choropleth map component**

Create `components/map/choropleth-map.tsx`:

```typescript
"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { classifyRisk, RISK_COLORS } from "@/lib/types";

interface Feature {
  id: number;
  lgd_code: number;
  name: string;
  score: number | null;
}

interface ChoroplethMapProps {
  geojsonUrl: string;
  features: Feature[];
  onFeatureClick?: (feature: Feature) => void;
  center?: [number, number];
  zoom?: number;
  fitBounds?: [[number, number], [number, number]];
}

function scoreToColor(score: number | null): string {
  if (score === null) return "#e5e5e5";
  return RISK_COLORS[classifyRisk(score)];
}

export function ChoroplethMap({
  geojsonUrl,
  features,
  onFeatureClick,
  center = [82, 22],
  zoom = 4,
  fitBounds,
}: ChoroplethMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  const scoreMap = new Map<number, number | null>();
  features.forEach((f) => scoreMap.set(f.lgd_code, f.score));

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: { "raster-opacity": 0.3 },
          },
        ],
      },
      center,
      zoom,
    });

    map.current.on("load", () => {
      setLoaded(true);
      if (fitBounds && map.current) {
        map.current.fitBounds(fitBounds, { padding: 40 });
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !map.current) return;

    const m = map.current;

    // Remove existing layers if re-rendering
    if (m.getLayer("regions-fill")) m.removeLayer("regions-fill");
    if (m.getLayer("regions-outline")) m.removeLayer("regions-outline");
    if (m.getSource("regions")) m.removeSource("regions");

    fetch(geojsonUrl)
      .then((r) => r.json())
      .then((geojson) => {
        // Inject color based on score
        for (const feature of geojson.features) {
          const lgd = feature.properties.lgd_code;
          const score = scoreMap.get(lgd) ?? null;
          feature.properties.score = score;
          feature.properties.fill_color = scoreToColor(score);
        }

        m.addSource("regions", { type: "geojson", data: geojson });

        m.addLayer({
          id: "regions-fill",
          type: "fill",
          source: "regions",
          paint: {
            "fill-color": ["get", "fill_color"],
            "fill-opacity": 0.7,
          },
        });

        m.addLayer({
          id: "regions-outline",
          type: "line",
          source: "regions",
          paint: {
            "line-color": "#666",
            "line-width": 0.5,
          },
        });

        // Tooltip
        const popup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
        });

        m.on("mousemove", "regions-fill", (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties!;
          const name = props.name || "Unknown";
          const score = props.score;
          const scoreText = score !== null && score !== "null" ? `Score: ${score}` : "No data";

          popup
            .setLngLat(e.lngLat)
            .setHTML(`<strong>${name}</strong><br/>${scoreText}`)
            .addTo(m);

          m.getCanvas().style.cursor = "pointer";
        });

        m.on("mouseleave", "regions-fill", () => {
          popup.remove();
          m.getCanvas().style.cursor = "";
        });

        m.on("click", "regions-fill", (e) => {
          if (!e.features?.[0] || !onFeatureClick) return;
          const props = e.features[0].properties!;
          const feature = features.find((f) => f.lgd_code === props.lgd_code);
          if (feature) onFeatureClick(feature);
        });
      });
  }, [loaded, features, geojsonUrl]);

  return (
    <div ref={mapContainer} className="h-full w-full rounded-lg" />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/map/choropleth-map.tsx
git commit -m "feat: add MapLibre choropleth map component with risk coloring and tooltips"
```

---

## Task 7: National Overview Page (Home)

**Files:**
- Modify: `app/page.tsx`
- Create: `components/state-ranking.tsx`

- [ ] **Step 1: Create state ranking sidebar**

Create `components/state-ranking.tsx`:

```typescript
"use client";

import Link from "next/link";
import { StateWithScore } from "@/lib/types";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";

interface StateRankingProps {
  states: StateWithScore[];
  limit?: number;
}

export function StateRanking({ states, limit = 10 }: StateRankingProps) {
  const { weights } = useWeights();

  const ranked = states
    .map((s) => ({
      ...s,
      composite_score: computeCompositeScore(s.indicator_scores, weights),
    }))
    .filter((s) => s.composite_score !== null)
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, limit);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-neutral-700">
        Highest Risk States
      </h3>
      {ranked.length === 0 ? (
        <p className="text-sm text-neutral-400">No data available</p>
      ) : (
        <ol className="space-y-1.5">
          {ranked.map((s, i) => (
            <li key={s.id}>
              <Link
                href={`/state/${s.id}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100"
              >
                <span>
                  <span className="mr-2 text-neutral-400">{i + 1}.</span>
                  {s.name}
                </span>
                <RiskBadge score={s.composite_score} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace home page with national overview**

Replace `app/page.tsx`:

```typescript
import { getStatesWithLatestScores } from "@/lib/queries";
import { NationalOverview } from "./national-overview";

export default async function HomePage() {
  const states = await getStatesWithLatestScores();
  return <NationalOverview states={states} />;
}
```

Create `app/national-overview.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { StateWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { StateRanking } from "@/components/state-ranking";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";

interface Props {
  states: StateWithScore[];
}

export function NationalOverview({ states }: Props) {
  const router = useRouter();
  const { weights } = useWeights();

  const statesWithComposite = states.map((s) => ({
    ...s,
    score: computeCompositeScore(s.indicator_scores, weights),
  }));

  const mapFeatures = statesWithComposite.map((s) => ({
    id: s.id,
    lgd_code: s.lgd_code,
    name: s.name,
    score: s.score,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-neutral-900">
        Climate Risk — National Overview
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="relative h-[600px] overflow-hidden rounded-lg border bg-white">
            <ChoroplethMap
              geojsonUrl="/geo/states.json"
              features={mapFeatures}
              onFeatureClick={(f) => router.push(`/state/${f.id}`)}
              fitBounds={[
                [68, 6],
                [98, 37],
              ]}
            />
            <div className="absolute bottom-4 left-4">
              <MapLegend />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <StateRanking states={states} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/national-overview.tsx components/state-ranking.tsx
git commit -m "feat: add national overview page with choropleth map and state ranking"
```

---

## Task 8: State View Page

**Files:**
- Create: `app/state/[stateId]/page.tsx`
- Create: `app/state/[stateId]/state-view.tsx`

- [ ] **Step 1: Create state page (server component)**

Create `app/state/[stateId]/page.tsx`:

```typescript
import { getDistrictsForState } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { StateView } from "./state-view";

export default async function StatePage({
  params,
}: {
  params: Promise<{ stateId: string }>;
}) {
  const { stateId } = await params;
  const id = parseInt(stateId);

  const supabase = await createClient();
  const { data: state } = await supabase
    .from("states")
    .select("id, lgd_code, name")
    .eq("id", id)
    .single();

  const districts = await getDistrictsForState(id);

  if (!state) return <div className="p-8">State not found</div>;

  return <StateView state={state} districts={districts} />;
}
```

- [ ] **Step 2: Create state view (client component)**

Create `app/state/[stateId]/state-view.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DistrictWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Props {
  state: { id: number; lgd_code: number; name: string };
  districts: DistrictWithScore[];
}

export function StateView({ state, districts }: Props) {
  const router = useRouter();
  const { weights } = useWeights();

  const districtsWithComposite = districts
    .map((d) => ({
      ...d,
      composite_score: computeCompositeScore(d.indicator_scores, weights),
    }))
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0));

  const mapFeatures = districtsWithComposite.map((d) => ({
    id: d.id,
    lgd_code: d.lgd_code,
    name: d.name,
    score: d.composite_score,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">India</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{state.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mb-4 text-2xl font-bold text-neutral-900">{state.name}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative h-[500px] overflow-hidden rounded-lg border bg-white">
            <ChoroplethMap
              geojsonUrl="/geo/districts.json"
              features={mapFeatures}
              onFeatureClick={(f) => router.push(`/district/${f.id}`)}
            />
            <div className="absolute bottom-4 left-4">
              <MapLegend />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">
            District Rankings ({districts.length})
          </h3>
          <div className="max-h-[450px] space-y-1 overflow-y-auto">
            {districtsWithComposite.map((d, i) => (
              <Link
                key={d.id}
                href={`/district/${d.id}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100"
              >
                <span>
                  <span className="mr-2 text-neutral-400">{i + 1}.</span>
                  {d.name}
                </span>
                <RiskBadge score={d.composite_score} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/state/
git commit -m "feat: add state view page with district choropleth and ranking"
```

---

## Task 9: District Scorecard Page

**Files:**
- Create: `app/district/[districtId]/page.tsx`
- Create: `app/district/[districtId]/district-scorecard.tsx`
- Create: `components/charts/trend-chart.tsx`

- [ ] **Step 1: Create trend chart component**

Create `components/charts/trend-chart.tsx`:

```typescript
"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IndicatorType, INDICATOR_LABELS, INDICATOR_COLORS } from "@/lib/types";

interface TrendChartProps {
  data: { period_start: string; indicator_type: string; score: number }[];
  indicators?: IndicatorType[];
}

export function TrendChart({ data, indicators }: TrendChartProps) {
  const types = indicators || ([...new Set(data.map((d) => d.indicator_type))] as IndicatorType[]);

  // Pivot: group by period_start, one column per indicator
  const pivoted = new Map<string, Record<string, number>>();
  for (const row of data) {
    if (!pivoted.has(row.period_start)) pivoted.set(row.period_start, {});
    pivoted.get(row.period_start)![row.indicator_type] = row.score;
  }

  const chartData = [...pivoted.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, scores]) => ({
      period: period.slice(0, 7),
      ...scores,
    }));

  if (chartData.length === 0) {
    return <p className="text-sm text-neutral-400">No historical data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip />
        {types.map((type) => (
          <Line
            key={type}
            type="monotone"
            dataKey={type}
            name={INDICATOR_LABELS[type]}
            stroke={INDICATOR_COLORS[type]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create district scorecard page**

Create `app/district/[districtId]/page.tsx`:

```typescript
import { getDistrictDetail, getDistrictHistory } from "@/lib/queries";
import { DistrictScorecard } from "./district-scorecard";

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ districtId: string }>;
}) {
  const { districtId } = await params;
  const id = parseInt(districtId);

  const detail = await getDistrictDetail(id);
  const history = await getDistrictHistory(id);

  if (!detail.district) return <div className="p-8">District not found</div>;

  return <DistrictScorecard detail={detail} history={history} />;
}
```

Create `app/district/[districtId]/district-scorecard.tsx`:

```typescript
"use client";

import Link from "next/link";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";
import { IndicatorGauge } from "@/components/charts/indicator-gauge";
import { TrendChart } from "@/components/charts/trend-chart";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Props {
  detail: {
    district: any;
    latest_scores: any[];
  };
  history: any[];
}

const ALL_INDICATORS: IndicatorType[] = [
  "rainfall_anomaly", "drought_index", "vegetation_health",
  "heat_stress", "flood_risk", "soil_moisture",
];

export function DistrictScorecard({ detail, history }: Props) {
  const { weights } = useWeights();
  const { district, latest_scores } = detail;

  const indicatorScores: Partial<Record<IndicatorType, number>> = {};
  const indicatorValues: Partial<Record<IndicatorType, number>> = {};
  for (const s of latest_scores) {
    indicatorScores[s.indicator_type as IndicatorType] = s.score;
    indicatorValues[s.indicator_type as IndicatorType] = s.value;
  }

  const compositeScore = computeCompositeScore(indicatorScores, weights);
  const stateName = district.states?.name || "Unknown State";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">India</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/state/${district.state_id}`}>
              {stateName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{district.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{district.name}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">Composite Risk:</span>
          <RiskBadge score={compositeScore} />
        </div>
      </div>

      {/* Indicator Gauges */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {ALL_INDICATORS.map((type) => (
          <IndicatorGauge
            key={type}
            type={type}
            score={indicatorScores[type] ?? null}
            value={indicatorValues[type] ?? null}
          />
        ))}
      </div>

      {/* Historical Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart data={history} />
        </CardContent>
      </Card>

      {/* Context */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>District Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-neutral-500">State:</span> {stateName}
          </div>
          <div>
            <span className="text-neutral-500">LGD Code:</span> {district.lgd_code}
          </div>
          {district.area_sq_km && (
            <div>
              <span className="text-neutral-500">Area:</span>{" "}
              {district.area_sq_km.toLocaleString()} sq km
            </div>
          )}
          <div>
            <Link
              href={`/compare?district1=${district.id}`}
              className="text-blue-600 hover:underline"
            >
              Compare with another district
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/district/ components/charts/trend-chart.tsx
git commit -m "feat: add district scorecard with indicator gauges and trend charts"
```

---

## Task 10: Comparison Tool Page

**Files:**
- Create: `app/compare/page.tsx`
- Create: `components/charts/radar-chart.tsx`

- [ ] **Step 1: Create radar chart component**

Create `components/charts/radar-chart.tsx`:

```typescript
"use client";

import {
  Radar, RadarChart as RechartsRadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from "recharts";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";

interface RadarChartProps {
  district1: { name: string; scores: Partial<Record<IndicatorType, number>> };
  district2: { name: string; scores: Partial<Record<IndicatorType, number>> };
}

const ALL_INDICATORS: IndicatorType[] = [
  "rainfall_anomaly", "drought_index", "vegetation_health",
  "heat_stress", "flood_risk", "soil_moisture",
];

export function ComparisonRadarChart({ district1, district2 }: RadarChartProps) {
  const data = ALL_INDICATORS.map((type) => ({
    indicator: INDICATOR_LABELS[type],
    [district1.name]: district1.scores[type] ?? 0,
    [district2.name]: district2.scores[type] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar
          name={district1.name}
          dataKey={district1.name}
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
        />
        <Radar
          name={district2.name}
          dataKey={district2.name}
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.2}
        />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create comparison page**

Create `app/compare/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorGauge } from "@/components/charts/indicator-gauge";
import { ComparisonRadarChart } from "@/components/charts/radar-chart";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { IndicatorType, DistrictWithScore } from "@/lib/types";

const ALL_INDICATORS: IndicatorType[] = [
  "rainfall_anomaly", "drought_index", "vegetation_health",
  "heat_stress", "flood_risk", "soil_moisture",
];

export default function ComparePage() {
  const { weights } = useWeights();
  const [states, setStates] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [districts, setDistricts] = useState<DistrictWithScore[]>([]);
  const [district1Id, setDistrict1Id] = useState<string>("");
  const [district2Id, setDistrict2Id] = useState<string>("");

  useEffect(() => {
    fetch("/api/states").then((r) => r.json()).then(setStates);
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    fetch(`/api/states/${selectedState}/districts`)
      .then((r) => r.json())
      .then(setDistricts);
  }, [selectedState]);

  const d1 = districts.find((d) => String(d.id) === district1Id);
  const d2 = districts.find((d) => String(d.id) === district2Id);

  const d1Score = d1 ? computeCompositeScore(d1.indicator_scores, weights) : null;
  const d2Score = d2 ? computeCompositeScore(d2.indicator_scores, weights) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Compare Districts</h1>

      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {states.map((s: any) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={district1Id} onValueChange={setDistrict1Id}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="District 1" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={district2Id} onValueChange={setDistrict2Id}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="District 2" />
          </SelectTrigger>
          <SelectContent>
            {districts.filter((d) => String(d.id) !== district1Id).map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {d1 && d2 && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{d1.name}</CardTitle>
                  <RiskBadge score={d1Score} />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {ALL_INDICATORS.map((type) => (
                  <IndicatorGauge key={type} type={type} score={d1.indicator_scores[type] ?? null} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{d2.name}</CardTitle>
                  <RiskBadge score={d2Score} />
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {ALL_INDICATORS.map((type) => (
                  <IndicatorGauge key={type} type={type} score={d2.indicator_scores[type] ?? null} />
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Radar Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparisonRadarChart
                district1={{ name: d1.name, scores: d1.indicator_scores }}
                district2={{ name: d2.name, scores: d2.indicator_scores }}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/compare/ components/charts/radar-chart.tsx
git commit -m "feat: add comparison tool with radar chart and side-by-side indicators"
```

---

## Task 11: Alerts Dashboard Page

**Files:**
- Create: `app/alerts/page.tsx`

- [ ] **Step 1: Create alerts page**

Create `app/alerts/page.tsx`:

```typescript
import { getAlerts } from "@/lib/queries";
import { AlertsDashboard } from "./alerts-dashboard";

export default async function AlertsPage() {
  const alerts = await getAlerts();
  return <AlertsDashboard alerts={alerts} />;
}
```

Create `app/alerts/alerts-dashboard.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INDICATOR_LABELS, IndicatorType } from "@/lib/types";

interface Props {
  alerts: any[];
}

export function AlertsDashboard({ alerts: rawAlerts }: Props) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const alerts = rawAlerts.map((a: any) => ({
    id: a.id,
    district_name: a.districts?.name || "Unknown",
    state_name: a.districts?.states?.name || "Unknown",
    indicator_type: a.alert_thresholds?.indicator_type as IndicatorType,
    threshold_value: a.alert_thresholds?.threshold_value,
    severity: a.alert_thresholds?.severity as "warning" | "critical",
    current_value: a.current_value,
    triggered_at: a.triggered_at,
  }));

  const filtered = severityFilter === "all"
    ? alerts
    : alerts.filter((a: any) => a.severity === severityFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Active Alerts</h1>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-neutral-400">No active alerts</p>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert: any) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.district_name}</TableCell>
                  <TableCell>{alert.state_name}</TableCell>
                  <TableCell>{INDICATOR_LABELS[alert.indicator_type] || alert.indicator_type}</TableCell>
                  <TableCell>{alert.current_value}</TableCell>
                  <TableCell>{alert.threshold_value}</TableCell>
                  <TableCell>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "outline"}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {new Date(alert.triggered_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/alerts/
git commit -m "feat: add alerts dashboard with severity filtering"
```

---

## Task 12: Weight Configuration Page

**Files:**
- Create: `app/weights/page.tsx`
- Create: `components/weight-sliders.tsx`

- [ ] **Step 1: Create weight sliders component**

Create `components/weight-sliders.tsx`:

```typescript
"use client";

import { Slider } from "@/components/ui/slider";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";
import { useWeights } from "@/components/weight-provider";

const ALL_INDICATORS: IndicatorType[] = [
  "rainfall_anomaly", "drought_index", "vegetation_health",
  "heat_stress", "flood_risk", "soil_moisture",
];

export function WeightSliders() {
  const { weights, setWeight } = useWeights();

  return (
    <div className="space-y-6">
      {ALL_INDICATORS.map((type) => {
        const pct = Math.round(weights[type] * 100);
        return (
          <div key={type}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">
                {INDICATOR_LABELS[type]}
              </label>
              <span className="text-sm font-bold text-neutral-900">{pct}%</span>
            </div>
            <Slider
              value={[pct]}
              min={0}
              max={60}
              step={1}
              onValueChange={([v]) => setWeight(type, v / 100)}
            />
          </div>
        );
      })}
      <p className="text-xs text-neutral-400">
        Total: {Math.round(Object.values(weights).reduce((s, w) => s + w, 0) * 100)}%
        — adjusting one slider auto-rebalances the others.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create weight configuration page**

Create `app/weights/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightSliders } from "@/components/weight-sliders";
import { useWeights } from "@/components/weight-provider";
import { WeightProfile } from "@/lib/types";

export default function WeightsPage() {
  const { resetToDefaults, applyPreset } = useWeights();
  const [presets, setPresets] = useState<WeightProfile[]>([]);

  useEffect(() => {
    fetch("/api/weight-presets")
      .then((r) => r.json())
      .then(setPresets);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">
        Weight Configuration
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Indicator Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightSliders />
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Presets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="w-full justify-start"
                onClick={() => applyPreset(preset.weights)}
              >
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/weights/ components/weight-sliders.tsx
git commit -m "feat: add weight configuration page with sliders and presets"
```

---

## Task 13: Build Verification and Final Polish

- [ ] **Step 1: Create the RPC function on Supabase**

Run via Supabase MCP or SQL editor:

```sql
CREATE OR REPLACE FUNCTION get_latest_state_scores()
RETURNS TABLE(state_id BIGINT, indicator_type TEXT, avg_score NUMERIC) AS $$
  SELECT d.state_id, ci.indicator_type::TEXT, ROUND(AVG(ci.score), 0) as avg_score
  FROM climate_indicators ci
  JOIN districts d ON ci.district_id = d.id
  WHERE ci.period_start = (
    SELECT MAX(period_start) FROM climate_indicators
  )
  GROUP BY d.state_id, ci.indicator_type
$$ LANGUAGE sql STABLE;
```

- [ ] **Step 2: Verify Next.js build succeeds**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2 && npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Start dev server and verify pages load**

```bash
npm run dev
```

Visit:
- `http://localhost:3000` — National overview with map
- `http://localhost:3000/compare` — Comparison tool
- `http://localhost:3000/alerts` — Alerts dashboard
- `http://localhost:3000/weights` — Weight configuration

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: dashboard plan complete — all 6 pages, maps, charts, weight config"
```

---

## Summary

After completing this plan, you have:
- **National Overview** — India choropleth map (states), risk ranking sidebar
- **State View** — District choropleth within a state, district ranking
- **District Scorecard** — 6 indicator gauges, historical trend chart, district info
- **Comparison Tool** — Side-by-side districts with radar chart overlay
- **Alerts Dashboard** — Filterable alert table with severity badges
- **Weight Configuration** — Interactive sliders with auto-rebalancing and presets
- **Shared components** — MapLibre choropleth, risk badges, trend/radar charts, gauge cards
- **API routes** — 7 endpoints serving data from Supabase
- **Weight system** — React context + localStorage persistence + client-side composite scoring
- **Data freshness** — Footer indicator showing pipeline health

**The complete platform is functional end-to-end after this plan.**

# Hybrid Real-Time Pipeline & Plot-Level Queries — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Option C (Hybrid) — automated monthly pipeline via GitHub Actions + on-demand plot-level point queries via GEE, with a click-on-map UI to query any location in India.

**Architecture:** District-level scores stay in Supabase (fast dashboard). A new `/api/point-query` Next.js route calls GEE server-side to fetch pixel values at any lat/lon for all indicators. The frontend adds a "point query" mode to the map where clicking drops a pin and shows a results card. GitHub Actions cron runs the district pipeline monthly. GEE service account credentials stored as env vars.

**Tech Stack:** Next.js 16 API Routes, Google Earth Engine JS API (`@google/earthengine`), GitHub Actions, MapLibre GL, Supabase (existing)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/gee-point-query.ts` | Server-side GEE initialization + point query logic |
| `app/api/point-query/route.ts` | API endpoint: takes lat/lon → returns all indicator values |
| `components/map/point-query-card.tsx` | UI card showing results of a point query |
| `components/map/choropleth-map.tsx` | Modified: add click-to-query mode with pin |
| `.github/workflows/monthly-pipeline.yml` | GitHub Actions cron for monthly pipeline |
| `pipeline/src/gee_service_auth.py` | GEE auth via service account (for CI) |

---

## Phase 1: GEE Point Query Backend

### Task 1: Install Earth Engine JS SDK

**Files:**
- Modify: `package.json` (add dependency)

- [ ] **Step 1: Install the Earth Engine package**

```bash
cd C:/Users/Santosh/Claude_Access/dicrav2
npm install @google/earthengine
```

This is Google's official Node.js Earth Engine client. It runs server-side in Next.js API routes.

- [ ] **Step 2: Verify installation**

```bash
node -e "const ee = require('@google/earthengine'); console.log('ee loaded:', typeof ee.Initialize)"
```

Expected: `ee loaded: function`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @google/earthengine for server-side point queries"
```

---

### Task 2: Create GEE Point Query Library

**Files:**
- Create: `lib/gee-point-query.ts`

This module handles GEE initialization with a service account and queries all indicators at a given lat/lon.

- [ ] **Step 1: Create the point query module**

```typescript
// lib/gee-point-query.ts
import ee from "@google/earthengine";

let initialized = false;

/**
 * Initialize GEE with service account credentials.
 * Expects GEE_SERVICE_ACCOUNT_EMAIL and GEE_PRIVATE_KEY env vars.
 * Falls back to application default credentials if not set.
 */
function initializeGEE(): Promise<void> {
  if (initialized) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const email = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
    const keyRaw = process.env.GEE_PRIVATE_KEY;

    if (email && keyRaw) {
      // Service account auth (for production / CI)
      const key = keyRaw.replace(/\\n/g, "\n");
      const credentials = { client_email: email, private_key: key };
      ee.data.authenticateViaPrivateKey(
        credentials,
        () => {
          ee.initialize(null, null, () => {
            initialized = true;
            resolve();
          }, reject);
        },
        reject
      );
    } else {
      // Fallback: use pre-authenticated credentials (local dev with `earthengine authenticate`)
      ee.initialize(null, null, () => {
        initialized = true;
        resolve();
      }, reject);
    }
  });
}

export interface PointQueryResult {
  lat: number;
  lon: number;
  timestamp: string;
  indicators: {
    ndvi: number | null;
    ndvi_date: string | null;
    land_surface_temp: number | null;
    soil_moisture: number | null;
    precipitation: number | null;
    evi: number | null;
  };
}

/**
 * Query GEE for the latest available indicator values at a specific point.
 * Returns raw physical values (not scores).
 */
export async function queryPoint(lat: number, lon: number): Promise<PointQueryResult> {
  await initializeGEE();

  const point = ee.Geometry.Point([lon, lat]);
  const now = new Date();
  // Look back 45 days to find the most recent data
  const startDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  const start = startDate.toISOString().split("T")[0];
  const end = now.toISOString().split("T")[0];

  // MODIS MOD13Q1 — 250m NDVI + EVI (16-day composite)
  const modisNdvi = ee.ImageCollection("MODIS/061/MOD13Q1")
    .filterDate(start, end)
    .select(["NDVI", "EVI"])
    .sort("system:time_start", false)
    .first();

  // MODIS LST — Land Surface Temperature
  const modisLst = ee.ImageCollection("MODIS/061/MOD11A2")
    .filterDate(start, end)
    .select("LST_Day_1km")
    .sort("system:time_start", false)
    .first();

  // ERA5-Land — Soil Moisture (volumetric_soil_water_layer_1)
  const era5Sm = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
    .filterDate(start, end)
    .select("volumetric_soil_water_layer_1")
    .sort("system:time_start", false)
    .first();

  // CHIRPS — Precipitation (higher res than IMD on GEE)
  const chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(start, end)
    .select("precipitation");
  const precipSum = chirps.sum();

  // Sample all at the point
  const ndviSample = modisNdvi.sample({ region: point, scale: 250, numPixels: 1 });
  const lstSample = modisLst.sample({ region: point, scale: 1000, numPixels: 1 });
  const smSample = era5Sm.sample({ region: point, scale: 11132, numPixels: 1 });
  const precipSample = precipSum.sample({ region: point, scale: 5566, numPixels: 1 });

  // Get the date of the NDVI image
  const ndviDate = modisNdvi.date();

  // Evaluate all in one getInfo call via a combined dictionary
  const combined = ee.Dictionary({
    ndvi: ndviSample.first().toDictionary(),
    lst: lstSample.first().toDictionary(),
    sm: smSample.first().toDictionary(),
    precip: precipSample.first().toDictionary(),
    ndvi_date: ndviDate.format("YYYY-MM-dd"),
  });

  const result: any = await new Promise((resolve, reject) => {
    combined.evaluate((data: any, err: any) => {
      if (err) reject(new Error(err));
      else resolve(data);
    });
  });

  // Parse results — apply scale factors
  const ndviRaw = result.ndvi?.NDVI;
  const eviRaw = result.ndvi?.EVI;
  const lstRaw = result.lst?.LST_Day_1km;
  const smRaw = result.sm?.volumetric_soil_water_layer_1;
  const precipRaw = result.precip?.precipitation;

  return {
    lat,
    lon,
    timestamp: new Date().toISOString(),
    indicators: {
      ndvi: ndviRaw != null ? ndviRaw * 0.0001 : null,          // MODIS scale factor
      ndvi_date: result.ndvi_date ?? null,
      land_surface_temp: lstRaw != null ? lstRaw * 0.02 - 273.15 : null, // Kelvin to Celsius
      soil_moisture: smRaw ?? null,                               // m3/m3
      precipitation: precipRaw ?? null,                           // mm (cumulative over window)
      evi: eviRaw != null ? eviRaw * 0.0001 : null,             // MODIS scale factor
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/gee-point-query.ts
git commit -m "feat: add GEE point query library for server-side pixel lookups"
```

---

### Task 3: Create the Point Query API Route

**Files:**
- Create: `app/api/point-query/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// app/api/point-query/route.ts
import { NextResponse } from "next/server";
import { queryPoint } from "@/lib/gee-point-query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  // Validate inputs
  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon parameters" },
      { status: 400 }
    );
  }

  // Bounds check — India approximately
  if (lat < 6 || lat > 38 || lon < 67 || lon > 98) {
    return NextResponse.json(
      { error: "Coordinates outside India bounds" },
      { status: 400 }
    );
  }

  try {
    const result = await queryPoint(lat, lon);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[point-query] GEE error:", err);
    return NextResponse.json(
      { error: "Failed to query Earth Engine", detail: err.message },
      { status: 502 }
    );
  }
}

// GEE queries can take 3-10 seconds
export const maxDuration = 30;
```

- [ ] **Step 2: Test the endpoint locally**

Open browser or curl:
```bash
curl "http://localhost:3000/api/point-query?lat=17.385&lon=78.4867"
```

Expected: JSON with NDVI, LST, soil moisture, precipitation values for Hyderabad.

Note: Requires GEE auth. If `GEE_SERVICE_ACCOUNT_EMAIL` is not set, it falls back to local `earthengine authenticate` credentials. For local dev, run `earthengine authenticate` once in the terminal.

- [ ] **Step 3: Commit**

```bash
git add app/api/point-query/route.ts
git commit -m "feat: add /api/point-query endpoint for plot-level GEE queries"
```

---

## Phase 2: Map Click-to-Query UI

### Task 4: Create Point Query Results Card

**Files:**
- Create: `components/map/point-query-card.tsx`

- [ ] **Step 1: Create the results card component**

```tsx
// components/map/point-query-card.tsx
"use client";

import { X, MapPin, Loader2 } from "lucide-react";
import type { PointQueryResult } from "@/lib/gee-point-query";

interface PointQueryCardProps {
  result: PointQueryResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const INDICATORS = [
  {
    key: "ndvi" as const,
    label: "Vegetation (NDVI)",
    unit: "",
    format: (v: number) => v.toFixed(3),
    color: "var(--dicra-ind-vegetation)",
    interpret: (v: number) =>
      v > 0.6 ? "Healthy vegetation" : v > 0.3 ? "Moderate vegetation" : v > 0.1 ? "Sparse vegetation" : "Barren / water",
  },
  {
    key: "evi" as const,
    label: "Enhanced Vegetation (EVI)",
    unit: "",
    format: (v: number) => v.toFixed(3),
    color: "#22C55E",
    interpret: (v: number) =>
      v > 0.4 ? "Dense canopy" : v > 0.2 ? "Moderate canopy" : "Low canopy cover",
  },
  {
    key: "land_surface_temp" as const,
    label: "Land Surface Temp",
    unit: "°C",
    format: (v: number) => v.toFixed(1),
    color: "var(--dicra-ind-heat)",
    interpret: (v: number) =>
      v > 45 ? "Extreme heat" : v > 35 ? "High heat stress" : v > 25 ? "Warm" : "Cool",
  },
  {
    key: "soil_moisture" as const,
    label: "Soil Moisture",
    unit: "m\u00B3/m\u00B3",
    format: (v: number) => v.toFixed(3),
    color: "var(--dicra-ind-moisture)",
    interpret: (v: number) =>
      v > 0.35 ? "Saturated" : v > 0.2 ? "Adequate moisture" : v > 0.1 ? "Dry" : "Very dry",
  },
  {
    key: "precipitation" as const,
    label: "Recent Rainfall",
    unit: "mm",
    format: (v: number) => v.toFixed(1),
    color: "var(--dicra-ind-rainfall)",
    interpret: (v: number) =>
      v > 200 ? "Heavy rainfall" : v > 50 ? "Moderate rainfall" : v > 10 ? "Light rainfall" : "Minimal rain",
  },
];

export function PointQueryCard({ result, loading, error, onClose }: PointQueryCardProps) {
  return (
    <div
      className="absolute top-4 right-4 z-20 w-[300px] rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] shadow-lg overflow-hidden"
      style={{ background: "var(--dicra-surface)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dicra-border)]"
           style={{ background: "var(--dicra-surface-muted)" }}>
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: "var(--dicra-accent)" }} />
          <span className="text-[12px] font-bold uppercase tracking-[0.5px]"
                style={{ color: "var(--dicra-text-secondary)" }}>
            Point Query
          </span>
        </div>
        <button onClick={onClose} className="text-[var(--dicra-text-muted)] hover:text-[var(--dicra-text-primary)] transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--dicra-accent)" }} />
            <span className="text-[12px]" style={{ color: "var(--dicra-text-muted)" }}>
              Querying Earth Engine...
            </span>
          </div>
        )}

        {error && (
          <div className="text-[12px] py-4 text-center" style={{ color: "var(--dicra-risk-critical)" }}>
            {error}
          </div>
        )}

        {result && !loading && (
          <>
            <div className="text-[11px] mb-3" style={{ color: "var(--dicra-text-muted)" }}>
              {result.lat.toFixed(4)}°N, {result.lon.toFixed(4)}°E
              {result.indicators.ndvi_date && (
                <span className="ml-2">· Data: {result.indicators.ndvi_date}</span>
              )}
            </div>

            <div className="space-y-2.5">
              {INDICATORS.map((ind) => {
                const value = result.indicators[ind.key];
                return (
                  <div key={ind.key}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
                        {ind.label}
                      </span>
                      <span className="text-[13px] font-bold" style={{ color: ind.color }}>
                        {value != null ? `${ind.format(value)}${ind.unit}` : "—"}
                      </span>
                    </div>
                    {value != null && (
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--dicra-text-faint)" }}>
                        {ind.interpret(value)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/map/point-query-card.tsx
git commit -m "feat: add point query results card component"
```

---

### Task 5: Add Click-to-Query Mode to Choropleth Map

**Files:**
- Modify: `components/map/choropleth-map.tsx`

This adds a "query point" toggle button on the map. When active, clicking anywhere on the map drops a marker and calls `/api/point-query`. The PointQueryCard floats over the map showing results.

- [ ] **Step 1: Read the current choropleth map component**

Read `components/map/choropleth-map.tsx` in full to understand the current MapLibre setup, event handlers, and rendering.

- [ ] **Step 2: Add point query state and handler**

Add to the component:
1. A `pointQueryMode` boolean state
2. A `pointResult` / `loading` / `error` state
3. A toggle button (Crosshair icon) in the map's top-left corner
4. A map click handler that, when in point query mode, drops a marker and calls the API
5. Render `PointQueryCard` when there's a result

Key additions:

```tsx
import { useState, useCallback } from "react";
import { Crosshair } from "lucide-react";
import { PointQueryCard } from "./point-query-card";
import type { PointQueryResult } from "@/lib/gee-point-query";

// Inside the component, add state:
const [pointMode, setPointMode] = useState(false);
const [pointResult, setPointResult] = useState<PointQueryResult | null>(null);
const [pointLoading, setPointLoading] = useState(false);
const [pointError, setPointError] = useState<string | null>(null);
const markerRef = useRef<maplibregl.Marker | null>(null);

// Add click handler (in the useEffect where map loads):
m.on("click", (e: maplibregl.MapMouseEvent) => {
  if (!pointMode) return; // Only handle in point query mode
  
  const { lat, lng: lon } = e.lngLat;
  
  // Place/move marker
  if (markerRef.current) markerRef.current.remove();
  markerRef.current = new maplibregl.Marker({ color: "#34D399" })
    .setLngLat([lon, lat])
    .addTo(m);
  
  // Fetch data
  setPointLoading(true);
  setPointError(null);
  setPointResult(null);
  
  fetch(`/api/point-query?lat=${lat}&lon=${lon}`)
    .then(r => r.json())
    .then(data => {
      if (data.error) throw new Error(data.error);
      setPointResult(data);
    })
    .catch(err => setPointError(err.message))
    .finally(() => setPointLoading(false));
});

// Add toggle button in JSX (absolute positioned on the map):
<button
  onClick={() => {
    setPointMode(prev => !prev);
    if (pointMode) {
      // Exiting point mode — clear marker and results
      markerRef.current?.remove();
      setPointResult(null);
      setPointError(null);
    }
  }}
  className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
  style={{
    background: pointMode ? "var(--dicra-accent)" : "var(--dicra-surface)",
    color: pointMode ? "var(--dicra-brand)" : "var(--dicra-text-secondary)",
    border: `1px solid ${pointMode ? "var(--dicra-accent)" : "var(--dicra-border)"}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  }}
  title={pointMode ? "Exit point query mode" : "Click any location for plot-level data"}
>
  <Crosshair size={14} />
  {pointMode ? "Exit Query Mode" : "Query Point"}
</button>

// Render the results card:
{(pointResult || pointLoading || pointError) && (
  <PointQueryCard
    result={pointResult}
    loading={pointLoading}
    error={pointError}
    onClose={() => {
      setPointResult(null);
      setPointError(null);
      markerRef.current?.remove();
    }}
  />
)}
```

Important: When `pointMode` is true, the existing `onFeatureClick` (district/state navigation) should be suppressed. Wrap the existing click handler to check `!pointMode` before navigating.

Also change the cursor to crosshair when in point mode:
```tsx
// After setting pointMode
m.getCanvas().style.cursor = pointMode ? "crosshair" : "";
```

- [ ] **Step 3: Test the full flow**

1. Open `/dashboard`
2. Click "Query Point" button on the map
3. Cursor changes to crosshair
4. Click anywhere in India
5. Green marker drops, "Querying Earth Engine..." spinner shows
6. After 2-5 seconds, card shows NDVI, EVI, LST, soil moisture, precipitation
7. Click "Exit Query Mode" — marker and card disappear
8. Click on a state — normal navigation resumes

- [ ] **Step 4: Commit**

```bash
git add components/map/choropleth-map.tsx
git commit -m "feat: add click-to-query mode for plot-level GEE data on map"
```

---

## Phase 3: Automated Monthly Pipeline

### Task 6: Create GitHub Actions Workflow for Monthly Pipeline

**Files:**
- Create: `.github/workflows/monthly-pipeline.yml`
- Create: `pipeline/src/gee_service_auth.py`

- [ ] **Step 1: Create GEE service auth helper for CI**

```python
# pipeline/src/gee_service_auth.py
"""Authenticate to GEE using a service account for CI/CD.

Expects GEE_SERVICE_ACCOUNT_EMAIL and GEE_PRIVATE_KEY env vars.
"""

import os
import json
import ee


def authenticate_service_account():
    email = os.environ.get("GEE_SERVICE_ACCOUNT_EMAIL")
    key_raw = os.environ.get("GEE_PRIVATE_KEY", "")
    project = os.environ.get("GEE_PROJECT", "climaterisk-494201")

    if not email or not key_raw:
        print("[GEE Auth] No service account credentials found, using default auth...")
        ee.Initialize(project=project)
        return

    key = key_raw.replace("\\n", "\n")
    credentials = ee.ServiceAccountCredentials(email, key_data=key)
    ee.Initialize(credentials, project=project)
    print(f"[GEE Auth] Authenticated as {email}")
```

- [ ] **Step 2: Update fetch_gee_ndvi.py to use service auth when available**

In `pipeline/src/fetch_gee_ndvi.py`, update `initialize_gee()` to try service auth first:

```python
def initialize_gee():
    try:
        from src.gee_service_auth import authenticate_service_account
        authenticate_service_account()
    except Exception:
        project = os.environ.get("GEE_PROJECT", "climaterisk-494201")
        try:
            ee.Initialize(project=project)
        except Exception:
            ee.Authenticate()
            ee.Initialize(project=project)
```

- [ ] **Step 3: Create the GitHub Actions workflow**

```yaml
# .github/workflows/monthly-pipeline.yml
name: Monthly Climate Data Pipeline

on:
  schedule:
    # Run on the 5th of each month at 02:00 UTC
    # (gives data sources time to publish previous month's data)
    - cron: '0 2 5 * *'
  workflow_dispatch:
    inputs:
      year:
        description: 'Year (e.g. 2026)'
        required: false
      month:
        description: 'Month (e.g. 3)'
        required: false

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    timeout-minutes: 45

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
          cache-dependency-path: pipeline/requirements.txt

      - name: Install dependencies
        run: |
          pip install -r pipeline/requirements.txt

      - name: Determine target month
        id: target
        run: |
          if [ -n "${{ inputs.year }}" ] && [ -n "${{ inputs.month }}" ]; then
            echo "year=${{ inputs.year }}" >> $GITHUB_OUTPUT
            echo "month=${{ inputs.month }}" >> $GITHUB_OUTPUT
          else
            # Default: previous month
            PREV=$(date -d "last month" +"%Y %m" 2>/dev/null || date -v-1m +"%Y %m")
            echo "year=$(echo $PREV | cut -d' ' -f1)" >> $GITHUB_OUTPUT
            echo "month=$(echo $PREV | cut -d' ' -f2 | sed 's/^0//')" >> $GITHUB_OUTPUT
          fi

      - name: Run pipeline
        working-directory: pipeline
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          GEE_PROJECT: ${{ secrets.GEE_PROJECT }}
          GEE_SERVICE_ACCOUNT_EMAIL: ${{ secrets.GEE_SERVICE_ACCOUNT_EMAIL }}
          GEE_PRIVATE_KEY: ${{ secrets.GEE_PRIVATE_KEY }}
          CDS_URL: ${{ secrets.CDS_URL }}
          CDS_KEY: ${{ secrets.CDS_KEY }}
        run: |
          python -m src.run_pipeline ${{ steps.target.outputs.year }} ${{ steps.target.outputs.month }}

      - name: Summary
        if: always()
        run: |
          echo "## Pipeline Run: ${{ steps.target.outputs.year }}-${{ steps.target.outputs.month }}" >> $GITHUB_STEP_SUMMARY
          echo "Status: ${{ job.status }}" >> $GITHUB_STEP_SUMMARY
```

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/monthly-pipeline.yml pipeline/src/gee_service_auth.py pipeline/src/fetch_gee_ndvi.py
git commit -m "feat: add GitHub Actions monthly pipeline cron + GEE service auth"
```

---

### Task 7: Document Required Secrets and GEE Tier Setup

**Files:**
- Modify: `pipeline/README.md` or create if not exists

- [ ] **Step 1: Document the required GitHub secrets**

Add to pipeline docs:

```markdown
## Automated Pipeline (GitHub Actions)

### Required GitHub Secrets

Set these in your repo's Settings → Secrets → Actions:

| Secret | Description | Where to get it |
|--------|------------|----------------|
| `SUPABASE_URL` | Supabase project URL | Supabase dashboard → Settings → API |
| `SUPABASE_KEY` | Supabase service role key | Supabase dashboard → Settings → API |
| `GEE_PROJECT` | GEE Cloud project ID | Google Cloud Console |
| `GEE_SERVICE_ACCOUNT_EMAIL` | GEE service account email | Google Cloud Console → IAM → Service Accounts |
| `GEE_PRIVATE_KEY` | GEE service account private key (JSON) | Create key for the service account |
| `CDS_URL` | Copernicus CDS API URL | https://cds.climate.copernicus.eu/api |
| `CDS_KEY` | Copernicus CDS API key | CDS dashboard → User Profile |

### GEE Tier Selection (URGENT — due April 27, 2026)

1. Go to https://code.earthengine.google.com/
2. Select "Contributor" tier for your project (free, 1,000 EECU-hours/month)
3. Link a billing account (won't be charged for non-commercial use)

### Manual Trigger

You can trigger the pipeline manually from GitHub:
Actions → Monthly Climate Data Pipeline → Run workflow → Enter year/month
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/README.md
git commit -m "docs: add pipeline automation setup instructions"
```

---

## Execution Order

1. **Task 1** — Install Earth Engine JS SDK
2. **Task 2** — Create GEE point query library
3. **Task 3** — Create API route
4. **Task 6** — GitHub Actions workflow (independent of Tasks 4-5, can run in parallel)
5. **Task 4** — Point query results card
6. **Task 5** — Map click-to-query integration
7. **Task 7** — Documentation

**Dependencies:**
- Tasks 2 and 3 are sequential (library → API route)
- Tasks 4 and 5 are sequential (card → map integration)
- Task 6 is independent of the UI work
- Task 7 is independent

**User actions required before Task 3 can be tested:**
- GEE must be authenticated locally (`earthengine authenticate`)
- Or `GEE_SERVICE_ACCOUNT_EMAIL` + `GEE_PRIVATE_KEY` must be in `.env.local`

**User actions required before Task 6 works in CI:**
- GitHub secrets must be configured
- GEE Contributor tier must be selected (before April 27, 2026)
- GEE service account must be created in Google Cloud Console

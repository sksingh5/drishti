# Dashboard UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the DiCRA dashboard with a warm institutional aesthetic, inline explainer system, data source transparency, and a CSS-variable-based theming system — consistent across all pages.

**Architecture:** Replace the top nav with a dark green icon sidebar. Introduce CSS custom properties for all visual tokens so the palette can be swapped from `globals.css`. Create shared metadata configs (`lib/indicators.ts`, `lib/sources.ts`) as single sources of truth for explainer text, colors, and source details. Build reusable components (stat-card, indicator-card, source-chip, methodology-banner) that all pages compose from.

**Tech Stack:** Next.js 16.2.4, React 19, Tailwind CSS v4 (CSS-native), shadcn/ui v4, DM Sans + JetBrains Mono fonts, Recharts 3, MapLibre GL 5, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-04-21-dashboard-ux-redesign.md`

---

## File Structure

### New files:
| File | Responsibility |
|------|---------------|
| `lib/indicators.ts` | Indicator metadata: labels, colors, explainers, sources, reliability |
| `lib/sources.ts` | Data source metadata: names, resolution, frequency, reliability badges |
| `components/sidebar.tsx` | Vertical icon sidebar with tooltips, replaces `nav.tsx` |
| `components/stat-card.tsx` | Stat card with left accent bar, change badge, proportion bar |
| `components/indicator-card.tsx` | Indicator gauge with score, bar, source line, inline explainer |
| `components/source-chip.tsx` | Source status pill (dot + name + timestamp) |
| `components/source-footer.tsx` | Row of source chips, fetches freshness data |
| `components/methodology-banner.tsx` | Dark green CTA banner linking to methodology |
| `components/risk-donut.tsx` | Semi-circle donut chart for risk distribution |
| `components/breadcrumbs.tsx` | Breadcrumb nav for state/district pages |
| `app/methodology/page.tsx` | Full methodology reference page |

### Modified files:
| File | Changes |
|------|---------|
| `app/globals.css` | Replace theme tokens with DiCRA design system variables |
| `app/layout.tsx` | Replace top nav + footer with sidebar layout, add fonts |
| `app/page.tsx` | Redesign: stat strip, map+ranking grid, indicator row, banner |
| `app/national-overview.tsx` | Full rewrite with new components |
| `app/state/[stateId]/state-view.tsx` | Apply same pattern as national overview |
| `app/district/[districtId]/district-scorecard.tsx` | Hero card, 6 indicator gauges, sources card |
| `app/compare/page.tsx` | Updated styling, add explainers |
| `app/alerts/alerts-dashboard.tsx` | Add summary stats, visual severity |
| `app/weights/page.tsx` | Add per-slider explainers, visual presets |
| `components/charts/indicator-gauge.tsx` | Restyle to match new design |
| `components/risk-badge.tsx` | Use theme tokens |
| `components/map/choropleth-map.tsx` | Update legend colors to theme tokens |
| `components/map/map-legend.tsx` | Restyle |
| `lib/types.ts` | Update RISK_COLORS to use CSS variable references |

### Removed files:
| File | Reason |
|------|--------|
| `components/nav.tsx` | Replaced by `components/sidebar.tsx` |
| `components/data-freshness.tsx` | Replaced by `components/source-footer.tsx` |

---

## Task 1: Theme Foundation — CSS Variables and Fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update globals.css with DiCRA design tokens**

Replace the `:root` block and `@theme inline` block in `app/globals.css`. Keep the shadcn imports and the `.dark` block (unused but harmless). Add the DiCRA custom properties and map them into the Tailwind theme.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

/* === DiCRA Design Tokens === */
:root {
  /* Identity */
  --dicra-brand: #142B21;
  --dicra-brand-mid: #1A3D2C;
  --dicra-accent: #34D399;
  --dicra-accent-subtle: rgba(52, 211, 153, 0.1);

  /* Surfaces */
  --dicra-bg: #F6F5F1;
  --dicra-surface: #FFFFFF;
  --dicra-surface-muted: #F9F8F5;
  --dicra-border: #EDEAE4;
  --dicra-border-subtle: #F0EDE7;

  /* Text */
  --dicra-text-primary: #111111;
  --dicra-text-secondary: #3D3A34;
  --dicra-text-muted: #8C877D;
  --dicra-text-faint: #B5B0A6;

  /* Risk levels */
  --dicra-risk-critical: #DC2626;
  --dicra-risk-high: #EA580C;
  --dicra-risk-moderate: #D97706;
  --dicra-risk-low: #16A34A;
  --dicra-risk-critical-bg: #FEF2F2;
  --dicra-risk-high-bg: #FFF7ED;
  --dicra-risk-moderate-bg: #FFFBEB;
  --dicra-risk-low-bg: #F0FDF4;

  /* Indicator colors */
  --dicra-ind-rainfall: #3B82F6;
  --dicra-ind-heat: #EF4444;
  --dicra-ind-drought: #F59E0B;
  --dicra-ind-vegetation: #22C55E;
  --dicra-ind-flood: #8B5CF6;
  --dicra-ind-moisture: #06B6D4;

  /* Radii */
  --dicra-radius-sm: 6px;
  --dicra-radius-md: 10px;
  --dicra-radius-lg: 14px;
  --dicra-radius-xl: 16px;

  /* Shadows */
  --dicra-shadow-card: 0 1px 2px rgba(0,0,0,0.04);
  --dicra-shadow-dropdown: 0 4px 16px rgba(0,0,0,0.08);

  /* Map shadcn tokens to DiCRA palette */
  --background: var(--dicra-bg);
  --foreground: var(--dicra-text-primary);
  --card: var(--dicra-surface);
  --card-foreground: var(--dicra-text-primary);
  --popover: var(--dicra-surface);
  --popover-foreground: var(--dicra-text-primary);
  --primary: var(--dicra-brand);
  --primary-foreground: #FFFFFF;
  --secondary: var(--dicra-surface-muted);
  --secondary-foreground: var(--dicra-text-secondary);
  --muted: var(--dicra-surface-muted);
  --muted-foreground: var(--dicra-text-muted);
  --accent: var(--dicra-accent);
  --accent-foreground: var(--dicra-brand);
  --destructive: var(--dicra-risk-critical);
  --border: var(--dicra-border);
  --input: var(--dicra-border);
  --ring: var(--dicra-accent);
  --radius: 0.875rem;

  --chart-1: var(--dicra-ind-rainfall);
  --chart-2: var(--dicra-ind-heat);
  --chart-3: var(--dicra-ind-drought);
  --chart-4: var(--dicra-ind-vegetation);
  --chart-5: var(--dicra-ind-flood);

  --sidebar: var(--dicra-brand);
  --sidebar-foreground: rgba(255,255,255,0.7);
  --sidebar-primary: var(--dicra-accent);
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: var(--dicra-accent-subtle);
  --sidebar-accent-foreground: var(--dicra-accent);
  --sidebar-border: rgba(255,255,255,0.1);
  --sidebar-ring: var(--dicra-accent);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-heading: 'DM Sans', system-ui, sans-serif;

  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* DiCRA-specific Tailwind utilities */
  --color-dicra-brand: var(--dicra-brand);
  --color-dicra-brand-mid: var(--dicra-brand-mid);
  --color-dicra-accent: var(--dicra-accent);
  --color-dicra-bg: var(--dicra-bg);
  --color-dicra-surface: var(--dicra-surface);
  --color-dicra-surface-muted: var(--dicra-surface-muted);
  --color-dicra-border: var(--dicra-border);
  --color-dicra-border-subtle: var(--dicra-border-subtle);
  --color-dicra-text-primary: var(--dicra-text-primary);
  --color-dicra-text-secondary: var(--dicra-text-secondary);
  --color-dicra-text-muted: var(--dicra-text-muted);
  --color-dicra-text-faint: var(--dicra-text-faint);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

/* MapLibre GL JS */
.maplibregl-map {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 2: Update layout.tsx with DM Sans + JetBrains Mono fonts and sidebar layout**

```tsx
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { WeightProvider } from "@/components/weight-provider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "DiCRA — District Climate Risk Analytics",
  description: "Climate risk analysis platform for India with district-level risk scoring, interactive dashboards, and configurable indicators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="flex h-full" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <WeightProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--dicra-bg)]">
            {children}
          </main>
        </WeightProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run dev server and verify fonts load, background is parchment**

Run: `npm run dev`
Expected: Page loads with DM Sans font and warm #F6F5F1 background. Sidebar component will be missing (next task). Existing pages should still render with updated colors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add DiCRA design system tokens and fonts"
```

---

## Task 2: Metadata Configs — Indicators and Sources

**Files:**
- Create: `lib/indicators.ts`
- Create: `lib/sources.ts`

- [ ] **Step 1: Create lib/indicators.ts**

```ts
export type IndicatorType =
  | "rainfall_anomaly"
  | "drought_index"
  | "vegetation_health"
  | "heat_stress"
  | "flood_risk"
  | "soil_moisture";

export type RiskLevel = "critical" | "high" | "moderate" | "low";

export interface IndicatorMeta {
  key: IndicatorType;
  label: string;
  shortLabel: string;
  color: string;
  source: string;
  resolution: string;
  frequency: string;
  reliability: "high" | "moderate" | "derived";
  explainer: string;
  methodology: string;
}

export const INDICATORS: Record<IndicatorType, IndicatorMeta> = {
  rainfall_anomaly: {
    key: "rainfall_anomaly",
    label: "Rainfall Anomaly",
    shortLabel: "Rainfall",
    color: "var(--dicra-ind-rainfall)",
    source: "IMD Pune",
    resolution: "0.25°",
    frequency: "Monthly",
    reliability: "high",
    explainer:
      "Measures deviation from 30-year historical average rainfall. Higher score means greater anomaly (deficit or excess), increasing risk to agriculture and water resources.",
    methodology:
      "Percentile ranking of absolute deviation from climatological mean. IMD 0.25° gridded daily rainfall aggregated to monthly district-level totals via zonal statistics.",
  },
  heat_stress: {
    key: "heat_stress",
    label: "Heat Stress",
    shortLabel: "Heat",
    color: "var(--dicra-ind-heat)",
    source: "IMD Pune",
    resolution: "1°",
    frequency: "Monthly",
    reliability: "high",
    explainer:
      "Mean daily maximum temperature scored against historical distribution. Higher scores indicate extreme heat conditions affecting public health and crop yields.",
    methodology:
      "IMD gridded daily Tmax, monthly mean computed, percentile-scored against all-district distribution for the month.",
  },
  drought_index: {
    key: "drought_index",
    label: "Drought Index",
    shortLabel: "Drought",
    color: "var(--dicra-ind-drought)",
    source: "Computed SPI",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer:
      "Standardized Precipitation Index (SPI) computed from gamma-fitted rainfall distribution. Negative SPI indicates drought conditions. Score maps SPI to 0–100 risk scale.",
    methodology:
      "Gamma distribution fit to historical same-month rainfall per district. CDF transformed to standard normal deviate. SPI mapped to risk: -3→100, 0→50, +3→0.",
  },
  vegetation_health: {
    key: "vegetation_health",
    label: "Vegetation Health",
    shortLabel: "Vegetation",
    color: "var(--dicra-ind-vegetation)",
    source: "MODIS NDVI",
    resolution: "1 km",
    frequency: "16-day",
    reliability: "moderate",
    explainer:
      "Satellite-derived vegetation index (NDVI) from MODIS Terra. Low NDVI means stressed vegetation. Score is inverted: higher score = more vegetation stress = more risk.",
    methodology:
      "MOD13A3 monthly 1km NDVI, zonal mean per district. Percentile-scored against all-district distribution. Inverted so high score = stressed vegetation.",
  },
  flood_risk: {
    key: "flood_risk",
    label: "Flood Risk",
    shortLabel: "Flood",
    color: "var(--dicra-ind-flood)",
    source: "Composite",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer:
      "Composite of rainfall anomaly (40%), soil moisture saturation (40%), and elevation factor (20%). High score means conditions are favorable for flooding.",
    methodology:
      "Weighted composite: 0.4×rainfall_score + 0.4×(100−soil_moisture_score) + 0.2×elevation_score. Elevation currently uses placeholder value of 50.",
  },
  soil_moisture: {
    key: "soil_moisture",
    label: "Soil Moisture",
    shortLabel: "Moisture",
    color: "var(--dicra-ind-moisture)",
    source: "ERA5-Land",
    resolution: "0.1°",
    frequency: "Monthly",
    reliability: "high",
    explainer:
      "Volumetric soil water content from ERA5-Land reanalysis. Score is inverted: low moisture = high drought risk. High moisture contributes to flood risk via the composite indicator.",
    methodology:
      "ERA5-Land monthly swvl1 (layer 1 soil moisture), zonal mean per district. Percentile-scored then inverted: low moisture → high risk score.",
  },
};

export const INDICATOR_LIST = Object.values(INDICATORS);

export const ALL_INDICATOR_KEYS: IndicatorType[] = [
  "rainfall_anomaly",
  "heat_stress",
  "drought_index",
  "vegetation_health",
  "flood_risk",
  "soil_moisture",
];

export function classifyRisk(score: number): RiskLevel {
  if (score >= 76) return "critical";
  if (score >= 51) return "high";
  if (score >= 26) return "moderate";
  return "low";
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: "var(--dicra-risk-critical)",
  high: "var(--dicra-risk-high)",
  moderate: "var(--dicra-risk-moderate)",
  low: "var(--dicra-risk-low)",
};

export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  critical: "var(--dicra-risk-critical-bg)",
  high: "var(--dicra-risk-high-bg)",
  moderate: "var(--dicra-risk-moderate-bg)",
  low: "var(--dicra-risk-low-bg)",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  moderate: "MODERATE",
  low: "LOW",
};
```

- [ ] **Step 2: Create lib/sources.ts**

```ts
import type { IndicatorType } from "./indicators";

export type ReliabilityLevel = "high" | "moderate" | "derived";

export interface DataSourceMeta {
  key: string;
  name: string;
  shortName: string;
  resolution: string;
  frequency: string;
  coverage: string;
  reliability: ReliabilityLevel;
  indicators: IndicatorType[];
  description: string;
}

export const DATA_SOURCES: Record<string, DataSourceMeta> = {
  imd_rainfall: {
    key: "imd_rainfall",
    name: "IMD Pune Gridded Rainfall",
    shortName: "IMD Rainfall",
    resolution: "0.25° lat/lon",
    frequency: "Monthly",
    coverage: "Since 1901",
    reliability: "high",
    indicators: ["rainfall_anomaly"],
    description:
      "India Meteorological Department gridded daily rainfall dataset at 0.25° resolution, aggregated to monthly totals.",
  },
  imd_temperature: {
    key: "imd_temperature",
    name: "IMD Pune Gridded Temperature",
    shortName: "IMD Temperature",
    resolution: "1° lat/lon",
    frequency: "Monthly",
    coverage: "Since 1951",
    reliability: "high",
    indicators: ["heat_stress"],
    description:
      "IMD gridded daily maximum temperature dataset at 1° resolution.",
  },
  era5_land: {
    key: "era5_land",
    name: "Copernicus ERA5-Land Reanalysis",
    shortName: "ERA5 Soil Moisture",
    resolution: "0.1° lat/lon",
    frequency: "Monthly reanalysis",
    coverage: "Since 1950",
    reliability: "high",
    indicators: ["soil_moisture"],
    description:
      "ECMWF ERA5-Land monthly volumetric soil water content (layer 1) at 0.1° resolution.",
  },
  modis_ndvi: {
    key: "modis_ndvi",
    name: "MODIS NDVI (Terra MOD13A3)",
    shortName: "MODIS NDVI",
    resolution: "1 km",
    frequency: "Monthly (16-day composite)",
    coverage: "Since 2000",
    reliability: "moderate",
    indicators: ["vegetation_health"],
    description:
      "NASA MODIS Terra monthly 1km NDVI product, zonal mean per district.",
  },
  computed_spi: {
    key: "computed_spi",
    name: "Standardized Precipitation Index",
    shortName: "SPI Drought",
    resolution: "District-level",
    frequency: "Monthly",
    coverage: "Depends on rainfall history",
    reliability: "derived",
    indicators: ["drought_index"],
    description:
      "SPI computed from gamma-fitted historical rainfall per district.",
  },
  computed_flood: {
    key: "computed_flood",
    name: "Composite Flood Risk Score",
    shortName: "Flood Composite",
    resolution: "District-level",
    frequency: "Monthly",
    coverage: "Depends on inputs",
    reliability: "derived",
    indicators: ["flood_risk"],
    description:
      "Weighted composite of rainfall, soil moisture, and elevation factors.",
  },
};

export const SOURCE_LIST = Object.values(DATA_SOURCES);

export const RELIABILITY_STYLES: Record<
  ReliabilityLevel,
  { label: string; bg: string; text: string }
> = {
  high: { label: "HIGH RELIABILITY", bg: "var(--dicra-risk-low-bg)", text: "var(--dicra-risk-low)" },
  moderate: { label: "MODERATE", bg: "var(--dicra-risk-moderate-bg)", text: "var(--dicra-risk-moderate)" },
  derived: { label: "DERIVED", bg: "var(--dicra-surface-muted)", text: "var(--dicra-text-muted)" },
};
```

- [ ] **Step 3: Commit**

```bash
git add lib/indicators.ts lib/sources.ts
git commit -m "feat: add indicator and data source metadata configs"
```

---

## Task 3: Sidebar Navigation

**Files:**
- Create: `components/sidebar.tsx`
- Delete: `components/nav.tsx` (after layout.tsx is updated)

- [ ] **Step 1: Create components/sidebar.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, ArrowLeftRight, Bell, SlidersHorizontal, BookOpen } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/weights", label: "Weights", icon: SlidersHorizontal },
  { href: "/methodology", label: "Methodology", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-[68px] flex-col items-center py-4 gap-1"
         style={{ background: "linear-gradient(180deg, var(--dicra-brand) 0%, #0A2E1A 100%)" }}>
      {/* Logo */}
      <Link href="/" className="mb-6 flex h-9 w-9 items-center justify-center rounded-[var(--dicra-radius-md)] font-black text-sm text-white"
            style={{ background: "linear-gradient(135deg, var(--dicra-accent), #059669)", boxShadow: "0 4px 12px rgba(5,150,105,0.3)" }}>
        D
      </Link>

      {/* Nav items */}
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} title={label}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-[var(--dicra-radius-md)] transition-colors",
                  isActive
                    ? "text-[var(--dicra-accent)]"
                    : "text-white/35 hover:text-white/70"
                )}
                style={isActive ? { background: "var(--dicra-accent-subtle)" } : undefined}>
            {isActive && (
              <span className="absolute left-0 top-[10px] bottom-[10px] w-[3px] rounded-r-sm"
                    style={{ background: "var(--dicra-accent)" }} />
            )}
            <Icon size={18} />
          </Link>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Avatar */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
           style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
        S
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Delete components/nav.tsx**

```bash
git rm components/nav.tsx
```

- [ ] **Step 3: Verify — dev server shows sidebar on left, content in main area**

Run: `npm run dev`
Expected: Dark green sidebar on left with 5 icon links. Active page has green accent. Main content fills remaining width on parchment background.

- [ ] **Step 4: Commit**

```bash
git add components/sidebar.tsx app/layout.tsx
git commit -m "feat: replace top nav with dark green icon sidebar"
```

---

## Task 4: Shared UI Components — Stat Card, Source Chip, Methodology Banner

**Files:**
- Create: `components/stat-card.tsx`
- Create: `components/source-chip.tsx`
- Create: `components/source-footer.tsx`
- Create: `components/methodology-banner.tsx`
- Create: `components/breadcrumbs.tsx`

- [ ] **Step 1: Create components/stat-card.tsx**

```tsx
interface StatCardProps {
  label: string;
  value: number;
  change?: number; // positive = increase, negative = decrease
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  total?: number; // for proportion bar
}

export function StatCard({ label, value, change, accentColor, iconBg, icon, total }: StatCardProps) {
  const proportion = total ? (value / total) * 100 : 0;

  return (
    <div className="relative rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      {/* Left accent bar */}
      <span className="absolute top-3.5 bottom-3.5 left-0 w-[3px] rounded-r-sm" style={{ background: accentColor }} />

      <div className="flex items-center justify-between mb-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[var(--dicra-radius-md)] text-sm"
             style={{ background: iconBg }}>
          {icon}
        </div>
        {change !== undefined && (
          <span className="text-[10px] font-bold px-[7px] py-[3px] rounded-[var(--dicra-radius-sm)]"
                style={{
                  background: change > 0 ? "var(--dicra-risk-critical-bg)" : change < 0 ? "var(--dicra-risk-low-bg)" : "var(--dicra-surface-muted)",
                  color: change > 0 ? "var(--dicra-risk-critical)" : change < 0 ? "var(--dicra-risk-low)" : "var(--dicra-text-muted)",
                }}>
            {change > 0 ? `▲ ${change}` : change < 0 ? `▼ ${Math.abs(change)}` : "— 0"}
          </span>
        )}
      </div>

      <div className="text-[32px] font-black tracking-[-1.5px] leading-none" style={{ color: "var(--dicra-text-primary)" }}>
        {value}
      </div>
      <div className="text-[11px] font-medium mt-1" style={{ color: "var(--dicra-text-muted)" }}>{label}</div>

      {total ? (
        <div className="mt-2.5 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--dicra-border-subtle)" }}>
          <div className="h-full rounded-full" style={{ width: `${proportion}%`, background: accentColor }} />
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Create components/source-chip.tsx**

```tsx
interface SourceChipProps {
  name: string;
  status: "ok" | "stale" | "error" | "pending";
  lastFetched?: string | null;
}

export function SourceChip({ name, status, lastFetched }: SourceChipProps) {
  const dotColor = {
    ok: "var(--dicra-accent)",
    stale: "var(--dicra-risk-moderate)",
    error: "var(--dicra-risk-critical)",
    pending: "var(--dicra-text-faint)",
  }[status];

  const timeAgo = lastFetched ? formatTimeAgo(lastFetched) : "No data";

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--dicra-border)] bg-[var(--dicra-surface)] px-3 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{
        background: dotColor,
        boxShadow: status === "ok" ? `0 0 5px rgba(52,211,153,0.3)` : undefined,
      }} />
      <span className="text-[10px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>{name}</span>
      <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>{timeAgo}</span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}
```

- [ ] **Step 3: Create components/source-footer.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { SourceChip } from "./source-chip";
import { SOURCE_LIST } from "@/lib/sources";

interface FreshnessEntry {
  source_name: string;
  status: "ok" | "stale" | "error" | "pending";
  last_fetched: string | null;
}

export function SourceFooter() {
  const [entries, setEntries] = useState<FreshnessEntry[]>([]);

  useEffect(() => {
    fetch("/api/data-freshness")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  // Merge DB status with metadata; show all sources even if no data yet
  const chips = SOURCE_LIST.map((src) => {
    const entry = entries.find((e) => e.source_name === src.key);
    return {
      name: src.shortName,
      status: entry?.status ?? ("pending" as const),
      lastFetched: entry?.last_fetched ?? null,
    };
  });

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {chips.map((c) => (
        <SourceChip key={c.name} name={c.name} status={c.status} lastFetched={c.lastFetched} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create components/methodology-banner.tsx**

```tsx
import Link from "next/link";
import { BookOpen } from "lucide-react";

export function MethodologyBanner() {
  return (
    <Link href="/methodology"
          className="flex items-center gap-4 rounded-[var(--dicra-radius-lg)] px-5 py-4 mt-4 no-underline transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--dicra-brand) 0%, var(--dicra-brand-mid) 100%)" }}>
      <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[var(--dicra-radius-md)]"
           style={{ background: "var(--dicra-accent-subtle)" }}>
        <BookOpen size={20} className="text-[var(--dicra-accent)]" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] font-bold text-white">How are risk scores calculated?</div>
        <div className="text-[11px] text-white/60 leading-relaxed mt-0.5">
          Composite scores combine 6 climate indicators using peer-reviewed methods from IMD, ISRO, and Copernicus. Weights are adjustable.
        </div>
      </div>
      <span className="text-[11px] font-semibold flex-shrink-0" style={{ color: "var(--dicra-accent)" }}>
        Methodology →
      </span>
    </Link>
  );
}
```

- [ ] **Step 5: Create components/breadcrumbs.tsx**

```tsx
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] mb-4">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span style={{ color: "var(--dicra-text-faint)" }}>/</span>}
          {item.href ? (
            <Link href={item.href} className="font-semibold no-underline" style={{ color: "var(--dicra-brand)" }}>
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: "var(--dicra-text-primary)" }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/stat-card.tsx components/source-chip.tsx components/source-footer.tsx components/methodology-banner.tsx components/breadcrumbs.tsx
git commit -m "feat: add stat card, source chip, methodology banner, breadcrumbs"
```

---

## Task 5: Indicator Card with Inline Explainer

**Files:**
- Create: `components/indicator-card.tsx`
- Modify: `components/risk-badge.tsx`

- [ ] **Step 1: Create components/indicator-card.tsx**

```tsx
import { INDICATORS, classifyRisk, RISK_BG_COLORS, RISK_COLORS, RISK_LABELS } from "@/lib/indicators";
import type { IndicatorType } from "@/lib/indicators";

interface IndicatorCardProps {
  indicatorType: IndicatorType;
  score: number | null;
  value?: number | null;
  showExplainer?: boolean;
}

export function IndicatorCard({ indicatorType, score, value, showExplainer = true }: IndicatorCardProps) {
  const meta = INDICATORS[indicatorType];
  if (!meta) return null;

  const risk = score !== null ? classifyRisk(score) : null;
  const displayScore = score ?? 0;

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
          {meta.label}
        </span>
        {risk && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-[7px] py-[2px] rounded-[5px]"
                style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}>
            {RISK_LABELS[risk]}
          </span>
        )}
      </div>

      {/* Score */}
      <div className="text-[28px] font-black tracking-[-1px] leading-none" style={{ color: meta.color }}>
        {score !== null ? score : "—"}
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--dicra-border-subtle)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${displayScore}%`, background: meta.color }} />
      </div>

      {/* Source line */}
      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="h-[5px] w-[5px] rounded-full" style={{ background: "var(--dicra-accent)", boxShadow: "0 0 4px rgba(52,211,153,0.3)" }} />
        <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>
          {meta.source} · {meta.frequency} · {meta.resolution}
        </span>
      </div>

      {/* Inline explainer */}
      {showExplainer && (
        <div className="mt-2.5 rounded-lg p-2.5 border border-[var(--dicra-border)]" style={{ background: "var(--dicra-surface-muted)" }}>
          <div className="text-[9px] font-bold uppercase tracking-[0.8px] mb-0.5" style={{ color: "var(--dicra-brand)" }}>
            ℹ What this means
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            {meta.explainer}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update components/risk-badge.tsx to use theme tokens**

```tsx
import { classifyRisk, RISK_COLORS, RISK_BG_COLORS, RISK_LABELS } from "@/lib/indicators";

export function RiskBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-[5px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border border-[var(--dicra-border)]"
            style={{ color: "var(--dicra-text-muted)" }}>
        No data
      </span>
    );
  }

  const risk = classifyRisk(score);
  return (
    <span className="inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}>
      {score} — {RISK_LABELS[risk]}
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/indicator-card.tsx components/risk-badge.tsx
git commit -m "feat: add indicator card with inline explainer and source line"
```

---

## Task 6: Risk Donut Chart

**Files:**
- Create: `components/risk-donut.tsx`

- [ ] **Step 1: Create components/risk-donut.tsx**

```tsx
import { classifyRisk, type RiskLevel } from "@/lib/indicators";

interface RiskDonutProps {
  counts: Record<RiskLevel, number>;
  total: number;
}

export function RiskDonut({ counts, total }: RiskDonutProps) {
  const segments: { level: RiskLevel; count: number; color: string; label: string }[] = [
    { level: "critical", count: counts.critical, color: "var(--dicra-risk-critical)", label: "Critical" },
    { level: "high", count: counts.high, color: "var(--dicra-risk-high)", label: "High" },
    { level: "moderate", count: counts.moderate, color: "var(--dicra-risk-moderate)", label: "Moderate" },
    { level: "low", count: counts.low, color: "var(--dicra-risk-low)", label: "Low" },
  ];

  // Compute conic-gradient angles
  let cumulative = 0;
  const stops = segments.map((seg) => {
    const start = cumulative;
    const degrees = total > 0 ? (seg.count / total) * 360 : 0;
    cumulative += degrees;
    return { ...seg, start, end: cumulative };
  });

  const gradient = stops
    .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
    .join(", ");

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      <div className="text-[13px] font-bold mb-3.5" style={{ color: "var(--dicra-text-primary)" }}>
        Risk Distribution
      </div>
      <div className="flex items-center gap-4">
        {/* Semi-circle donut */}
        <div className="relative w-[110px] h-[60px] flex-shrink-0">
          <div className="w-[110px] h-[55px] overflow-hidden">
            <div className="w-[110px] h-[110px] rounded-full"
                 style={{ background: `conic-gradient(${gradient})` }}>
              <div className="absolute top-[18px] left-[18px] w-[74px] h-[74px] rounded-full bg-[var(--dicra-surface)]" />
            </div>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[22px] font-black tracking-[-1px]" style={{ color: "var(--dicra-text-primary)" }}>{total}</div>
            <div className="text-[9px] uppercase tracking-[0.5px]" style={{ color: "var(--dicra-text-muted)" }}>Total</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5 flex-1">
          {segments.map((seg) => (
            <div key={seg.level} className="flex items-center gap-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: seg.color }} />
              <span className="flex-1" style={{ color: "var(--dicra-text-secondary)" }}>{seg.label}</span>
              <span className="font-bold" style={{ color: "var(--dicra-text-primary)" }}>{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/risk-donut.tsx
git commit -m "feat: add semi-circle risk distribution donut chart"
```

---

## Task 7: Redesign National Overview Page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/national-overview.tsx`
- Modify: `components/state-ranking.tsx`
- Modify: `components/map/map-legend.tsx`

- [ ] **Step 1: Rewrite app/national-overview.tsx**

This is the main component. It composes stat cards, map, ranking, indicator row, methodology banner, and source footer. Read the current `app/national-overview.tsx` and `app/page.tsx` first, then rewrite `national-overview.tsx` to use the new components. Keep the existing data fetching via `useEffect` and the `useWeights()` hook. Replace the visual layout with:

1. Page header row (title + period)
2. 4 stat cards (critical/high/moderate/low district counts)
3. Grid: choropleth map (left) + risk donut + state rankings (right)
4. Indicator summary row (3 indicator cards for rainfall, heat, vegetation — national averages)
5. Methodology banner
6. Source footer

The implementation should import and compose `StatCard`, `IndicatorCard`, `RiskDonut`, `MethodologyBanner`, `SourceFooter` from the components created in previous tasks.

Keep `ChoroplethMap` and update it to use theme colors via props. Keep `StateRanking` but restyle it.

- [ ] **Step 2: Update components/state-ranking.tsx with new design**

Restyle the ranking list to use rank badges (numbered, colored by risk), score bars, and score numbers matching the mockup. Use theme tokens for all colors.

- [ ] **Step 3: Update components/map/map-legend.tsx**

Restyle the map legend to use theme tokens and rounded pill design.

- [ ] **Step 4: Verify — dev server shows redesigned national overview**

Run: `npm run dev` and navigate to `/`
Expected: Parchment background, stat strip with 4 cards, map + right panel, indicator row with explainers, green methodology banner, source chips at bottom.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/national-overview.tsx components/state-ranking.tsx components/map/map-legend.tsx
git commit -m "feat: redesign national overview with stat cards, explainers, source footer"
```

---

## Task 8: Redesign State View Page

**Files:**
- Modify: `app/state/[stateId]/state-view.tsx`
- Modify: `app/state/[stateId]/page.tsx`

- [ ] **Step 1: Rewrite state-view.tsx**

Same layout pattern as national overview but scoped to the state:
1. Breadcrumbs: India / State Name
2. Page header with state name + district count
3. Stat cards showing district risk counts within the state
4. Map (district-level choropleth) + district rankings
5. Methodology banner
6. Source footer

Use `Breadcrumbs` component. Reuse `StatCard`, `RiskDonut`, `MethodologyBanner`, `SourceFooter`.

- [ ] **Step 2: Verify — navigate to a state, see redesigned view**

- [ ] **Step 3: Commit**

```bash
git add app/state/
git commit -m "feat: redesign state view with breadcrumbs, stat cards, source footer"
```

---

## Task 9: Redesign District Scorecard

**Files:**
- Modify: `app/district/[districtId]/district-scorecard.tsx`
- Modify: `app/district/[districtId]/page.tsx`

- [ ] **Step 1: Rewrite district-scorecard.tsx**

Layout:
1. Breadcrumbs: India / State / District
2. Hero row: district name + composite score on left | metadata grid (LGD, area, period, rank) on right
3. 6 indicator cards in 3×2 grid (all with explainers and source lines)
4. 2-column: trend chart (left) | data sources & reliability card (right)
5. Source footer

For the data sources & reliability card, create an inline component that maps indicator sources to rows with reliability badges using `DATA_SOURCES` and `RELIABILITY_STYLES` from `lib/sources.ts`.

- [ ] **Step 2: Verify — navigate to a district, see hero card, 6 gauges, sources card**

- [ ] **Step 3: Commit**

```bash
git add app/district/
git commit -m "feat: redesign district scorecard with hero card, reliability badges"
```

---

## Task 10: Redesign Compare, Alerts, Weights Pages

**Files:**
- Modify: `app/compare/page.tsx`
- Modify: `app/alerts/alerts-dashboard.tsx`
- Modify: `app/weights/page.tsx`

- [ ] **Step 1: Update compare page**

Keep the selector and radar chart. Replace the inline indicator displays with `IndicatorCard` components. Add breadcrumbs. Apply parchment background and card styling. Add source footer.

- [ ] **Step 2: Update alerts dashboard**

Add 3 stat cards at top (total active alerts, critical count, new this period). Restyle the table with left-edge severity accents on rows. Replace the old badge colors with theme tokens. Add source footer.

- [ ] **Step 3: Update weights page**

Restyle with parchment background and card borders. Add an inline explainer below each slider explaining what increasing that indicator's weight does (pull text from `INDICATORS[key].explainer`). Restyle preset buttons as visual cards with weight distribution mini-bars. Add source footer.

- [ ] **Step 4: Verify all 3 pages render correctly**

- [ ] **Step 5: Commit**

```bash
git add app/compare/ app/alerts/ app/weights/
git commit -m "feat: redesign compare, alerts, weights pages with new design system"
```

---

## Task 11: Methodology Page

**Files:**
- Create: `app/methodology/page.tsx`

- [ ] **Step 1: Create app/methodology/page.tsx**

Full reference page with these sections:

1. **Scoring System** — explain 0-100 percentile scoring, risk categories (0-25 low, 26-50 moderate, 51-75 high, 76-100 critical), what "risk" means in this context.

2. **Indicator Definitions** — one card per indicator using `INDICATOR_LIST` from `lib/indicators.ts`. Each shows: label, full methodology text, source, resolution, frequency, reliability badge.

3. **Data Sources** — table built from `SOURCE_LIST` showing all sources with resolution, coverage, frequency, and reliability badges using `RELIABILITY_STYLES`.

4. **Weight System** — explain how composite scores work: weighted average of 6 indicator scores. Describe presets. Link to weights page.

5. **Limitations** — bullet list: data freshness lag, spatial resolution limits, SPI requires multi-year history, MODIS cloud contamination, flood risk uses placeholder elevation.

Style: clean typographic layout using parchment background, white content cards, consistent font sizes from the design system. Use `IndicatorCard` (with `showExplainer={false}`) for the indicator section previews.

- [ ] **Step 2: Verify — navigate to /methodology, all sections render**

- [ ] **Step 3: Commit**

```bash
git add app/methodology/
git commit -m "feat: add methodology reference page"
```

---

## Task 12: Clean Up and Type Consistency

**Files:**
- Modify: `lib/types.ts`
- Delete: `components/data-freshness.tsx`
- Modify: `components/charts/indicator-gauge.tsx`

- [ ] **Step 1: Update lib/types.ts**

Remove `classifyRisk`, `RISK_COLORS`, `INDICATOR_LABELS`, and `IndicatorType` from `lib/types.ts` since they now live in `lib/indicators.ts`. Keep `DataSourceStatus` and any other types still used by API routes and queries. Update any imports across the codebase that referenced these from `lib/types.ts` to import from `lib/indicators.ts` instead.

- [ ] **Step 2: Delete components/data-freshness.tsx**

```bash
git rm components/data-freshness.tsx
```

- [ ] **Step 3: Update indicator-gauge.tsx**

If the old `indicator-gauge.tsx` is still imported anywhere, restyle it to use theme tokens or replace imports with `IndicatorCard`. Check all imports:

```bash
grep -r "indicator-gauge" app/ components/
```

- [ ] **Step 4: Run build to verify no broken imports**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: clean up old types, remove deprecated components"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 2: Visual verification of all pages**

Start dev server and check each page:
- `/` — stat strip, map, rankings, indicator row, methodology banner, source chips
- `/state/1` — breadcrumbs, stat cards, district map, rankings
- `/district/1` — hero card, 6 indicator gauges with explainers, sources card
- `/compare` — redesigned selectors, indicator cards, radar chart
- `/alerts` — summary stats, styled table
- `/weights` — sliders with explainers, visual presets
- `/methodology` — all 5 sections render

- [ ] **Step 3: Theme swap test**

Change `--dicra-brand` from `#142B21` to `#1E3A5F` (navy blue) in globals.css. Verify the sidebar, methodology banner, and all accent elements change to blue. Revert.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete dashboard UX redesign — all pages, theming, explainers"
```

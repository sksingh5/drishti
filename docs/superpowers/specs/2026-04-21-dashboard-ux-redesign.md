# DiCRA Dashboard UX Redesign — Design Spec

**Date:** 2026-04-21
**Status:** Draft
**Scope:** Visual redesign, explainer system, data source transparency, theming

## 1. Goals

1. **Explainer system** — help users understand what each indicator means, how scores work, and what actions to take. Layered: inline cards for everyone, methodology page for researchers.
2. **Data source transparency** — show where data comes from, when it was last updated, and how reliable it is. Visible on every page.
3. **Visual redesign** — distinctive, warm, professional aesthetic. Not stock. Consistent across all 6 pages.
4. **Theming** — CSS custom properties system so the color palette, typography, and spacing can be changed from one file without touching components.

## 2. Design System

### 2.1 Theming Architecture

All visual tokens live in CSS custom properties in `globals.css`. Components reference tokens, never raw colors. This allows palette swaps by changing ~30 variables.

**Token categories:**
- `--color-*` — all colors (backgrounds, text, borders, accents, risk levels, indicators)
- `--font-*` — font families
- `--radius-*` — border radii
- `--space-*` — spacing scale (optional, use Tailwind's default scale for now)
- `--shadow-*` — box shadows

```css
:root {
  /* === IDENTITY === */
  --color-brand: #142B21;          /* Forest — sidebar, CTAs, banners */
  --color-brand-mid: #1A3D2C;      /* Forest mid — hover states */
  --color-accent: #34D399;          /* Emerald — active states, live dots */
  --color-accent-subtle: rgba(52, 211, 153, 0.1);  /* Emerald ghost */

  /* === SURFACES === */
  --color-bg: #F6F5F1;             /* Parchment — page background */
  --color-surface: #FFFFFF;         /* Card backgrounds */
  --color-surface-muted: #F9F8F5;  /* Explainer card, hover states */
  --color-border: #EDEAE4;         /* Card borders */
  --color-border-subtle: #F0EDE7;  /* Dividers, inner borders */

  /* === TEXT === */
  --color-text-primary: #111111;    /* Headings, numbers */
  --color-text-secondary: #3D3A34;  /* Body text */
  --color-text-muted: #8C877D;      /* Labels, captions */
  --color-text-faint: #B5B0A6;      /* Placeholders, timestamps */

  /* === RISK LEVELS === */
  --color-risk-critical: #DC2626;
  --color-risk-high: #EA580C;
  --color-risk-moderate: #D97706;
  --color-risk-low: #16A34A;
  --color-risk-critical-bg: #FEF2F2;
  --color-risk-high-bg: #FFF7ED;
  --color-risk-moderate-bg: #FFFBEB;
  --color-risk-low-bg: #F0FDF4;

  /* === INDICATOR COLORS === */
  --color-ind-rainfall: #3B82F6;
  --color-ind-heat: #EF4444;
  --color-ind-drought: #F59E0B;
  --color-ind-vegetation: #22C55E;
  --color-ind-flood: #8B5CF6;
  --color-ind-moisture: #06B6D4;

  /* === TYPOGRAPHY === */
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* === RADII === */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 16px;

  /* === SHADOWS === */
  --shadow-card: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-dropdown: 0 4px 16px rgba(0,0,0,0.08);
}
```

To change the entire palette, edit these variables. Components never use hardcoded colors.

### 2.2 Typography

| Role | Font | Weight | Size | Tracking | Usage |
|------|------|--------|------|----------|-------|
| Hero number | DM Sans | 900 | 32-48px | -1.5px | Stat card numbers, composite scores |
| Page title | DM Sans | 800 | 22px | -0.5px | "National Overview", "Jaisalmer" |
| Card title | DM Sans | 700 | 13px | normal | Section headings inside cards |
| Body | DM Sans | 500 | 12px | normal | Descriptions, explainer text |
| Label | DM Sans | 600 | 10-11px | normal | Form labels, stat labels |
| Micro label | DM Sans | 700 | 9px | 0.8px uppercase | Explainer headers, badge text |
| Data value | JetBrains Mono | 500 | 11px | normal | Timestamps, raw values, LGD codes |

### 2.3 Card System

All cards share:
- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Radius: `var(--radius-lg)` (14px)
- No heavy box-shadows — borders provide structure
- Card header: bottom border `var(--color-border-subtle)`, flex row with title + actions

**Stat cards** add a 3px left-edge accent bar colored by risk level.

### 2.4 Layout

- **Sidebar:** 68px wide, `var(--color-brand)` background, fixed. Icon-only nav with active indicator (left-edge green bar + background tint). Logo at top, avatar at bottom.
- **Main area:** `var(--color-bg)` background, 24-28px padding.
- **Content grid:** Map/primary content (1fr) + right panel (320px) on overview/state pages. Full-width grids on detail pages.

## 3. Navigation

### 3.1 Sidebar (replaces current top nav)

| Icon | Label (tooltip) | Route |
|------|-----------------|-------|
| Home | Overview | `/` |
| Swap | Compare | `/compare` |
| Alert | Alerts | `/alerts` |
| Sliders | Weights | `/weights` |
| Book | Methodology | `/methodology` |

Active state: left-edge 3px emerald bar, `var(--color-accent-subtle)` background, icon colored `var(--color-accent)`.

Tooltip shows on hover (CSS-only, no JS library needed).

### 3.2 Breadcrumbs

On state/district pages: `India / Rajasthan / Jaisalmer` with links back. Style: `var(--color-text-faint)` separators, `var(--color-brand)` for clickable segments.

## 4. Explainer System

### 4.1 Inline Explainer Cards

Appear below each indicator gauge on all pages that show indicator scores. Always visible (not collapsed).

**Structure:**
```
┌─────────────────────────────────────┐
│ ℹ WHAT THIS MEANS                  │
│ Plain-language explanation of the   │
│ indicator score in context.         │
└─────────────────────────────────────┘
```

**Style:**
- Background: `var(--color-surface-muted)` (#F9F8F5)
- Border: `1px solid var(--color-border)`
- Radius: 8px
- Label: 9px uppercase, `var(--color-brand)` color
- Text: 11px, `var(--color-text-secondary)`, line-height 1.5

**Content per indicator:**

| Indicator | Explainer |
|-----------|-----------|
| Rainfall Anomaly | Measures deviation from 30-year historical average rainfall. Higher score means greater anomaly (deficit or excess), increasing risk to agriculture and water resources. |
| Heat Stress | Mean daily maximum temperature scored against historical distribution. Higher scores indicate extreme heat conditions affecting public health and crop yields. |
| Drought Index | Standardized Precipitation Index (SPI) computed using gamma-fitted rainfall distribution. Negative SPI = drought conditions. Score maps SPI to 0-100 risk scale. |
| Vegetation Health | Satellite-derived vegetation index (NDVI) from MODIS. Low NDVI = stressed vegetation. Score inverted so higher = more stress = more risk. |
| Flood Risk | Composite of rainfall anomaly (40%), soil moisture saturation (40%), and elevation factor (20%). High score = conditions favorable for flooding. |
| Soil Moisture | Volumetric soil water from ERA5-Land reanalysis. Score inverted: low moisture = high drought risk. High moisture contributes to flood risk via the composite. |

### 4.2 Methodology Page (`/methodology`)

A new standalone page accessible from the sidebar. Sections:

1. **Scoring System** — how 0-100 percentile scoring works, what "risk" means
2. **Indicator Definitions** — detailed description of each indicator, the science behind it, thresholds
3. **Data Sources** — table of all sources with resolution, temporal coverage, update frequency, reliability rating
4. **Weight System** — how composite scores are computed, what presets mean
5. **Limitations** — honest disclosure of data gaps, resolution limits, and temporal lag

Tone: accessible to policy makers, with expandable "Technical Details" sections for researchers.

### 4.3 Methodology Banner

Appears at the bottom of the National Overview and State View pages. Dark green banner (`var(--color-brand)` gradient) with book icon, one-line summary, and "Methodology →" link.

## 5. Data Source Transparency

### 5.1 Source Status Footer

Every page shows a row of source chips at the bottom of the main content area.

**Source chip structure:**
```
[●] IMD Rainfall  ·  2h ago
```

- Green pulsing dot = live/ok
- Yellow dot = stale (>24h for daily sources, >7d for monthly)
- Red dot = error
- Name in semibold, timestamp in muted

### 5.2 Data Sources & Reliability Card

On the District Scorecard page, a dedicated card shows per-source detail:

| Source | Resolution | Frequency | Coverage | Reliability |
|--------|-----------|-----------|----------|-------------|
| IMD Pune Gridded | 0.25° | Monthly | Since 1901 | HIGH |
| Copernicus ERA5-Land | 0.1° | Monthly reanalysis | Since 1950 | HIGH |
| MODIS NDVI (Terra) | 1km | 16-day composite | Since 2000 | MODERATE |
| Computed SPI | District-level | Monthly | Depends on rainfall data | DERIVED |
| Computed Flood Risk | District-level | Monthly | Depends on inputs | DERIVED |

Reliability badges:
- **HIGH** — green background, government/institutional source, long historical record
- **MODERATE** — amber background, satellite-derived, shorter record or coarser resolution
- **DERIVED** — gray background, computed from other indicators

### 5.3 Per-Indicator Source Line

Every indicator gauge card shows a source line below the progress bar:
```
[●] IMD Pune · Monthly · 0.25° grid
```
Dot color matches the source status. This is visible on every indicator everywhere.

## 6. Page Designs

### 6.1 National Overview (`/`)

**Layout:** Sidebar + main area with stat strip → map+ranking grid → indicator row → methodology banner → source footer.

**Additions to current page:**
- 4 stat cards with risk category counts, month-over-month change badges, proportion bars
- Risk Distribution donut (semi-circle) in right panel
- Indicator summary row (3 cards: rainfall, heat, vegetation) with inline explainers and source lines
- Methodology banner
- Source status footer

### 6.2 State View (`/state/[stateId]`)

Same layout pattern as national but scoped to state. Stat cards show district counts within the state. Map shows district-level choropleth. Rankings show districts within the state.

### 6.3 District Scorecard (`/district/[districtId]`)

**Layout:**
- Breadcrumb navigation
- Hero row: district name + composite score badge | metadata grid (LGD code, area, period, rank)
- 6 indicator gauge cards (3×2 grid) each with score, bar, source line, inline explainer
- 2-column below: Historical Trends chart | Data Sources & Reliability card
- Source footer

### 6.4 Compare (`/compare`)

Same sidebar. Two-district selection at top. Side-by-side indicator cards (not just numbers — include explainers). Radar chart below with same color system.

### 6.5 Alerts (`/alerts`)

Add visual prominence for critical alerts:
- Summary stat cards at top (total active, critical count, new this period)
- Table below with severity color coding (left-edge accent like stat cards)
- Inline context: what triggered the alert, which threshold was crossed

### 6.6 Weights (`/weights`)

Current slider layout works. Add:
- Inline explainer per indicator slider (what does increasing this weight mean?)
- Preset cards with visual weight distribution bars (not just buttons)

### 6.7 Methodology (`/methodology`) — NEW

Full-page reference with sections described in §4.2. Sidebar nav links for each section. Clean typographic layout.

## 7. Theming Implementation

### 7.1 CSS Custom Properties

All tokens defined in `:root` in `globals.css` as described in §2.1. Dark mode support via `.dark` class override (future, not in scope now).

### 7.2 Tailwind Integration

Since this project uses Tailwind v4 (CSS-native config via `@theme` in `globals.css`), map tokens using the `@theme` directive:

```css
/* globals.css */
@theme {
  --color-brand: var(--color-brand);
  --color-brand-mid: var(--color-brand-mid);
  --color-accent: var(--color-accent);
  --color-parchment: var(--color-bg);
  --color-surface: var(--color-surface);
  /* ... etc */
}
```

Components use Tailwind classes like `bg-surface`, `text-brand`, `border-border` which resolve to the CSS variables. Changing the `:root` variables changes the entire theme. No `tailwind.config.ts` needed — Tailwind v4 reads from CSS.

### 7.3 Indicator Metadata

Create a single source-of-truth config object:

```ts
// lib/indicators.ts
export const INDICATORS = {
  rainfall_anomaly: {
    label: "Rainfall Anomaly",
    color: "var(--color-ind-rainfall)",
    source: "IMD Pune",
    resolution: "0.25°",
    frequency: "Monthly",
    reliability: "high",
    explainer: "Measures deviation from 30-year historical average rainfall...",
    methodology: "Percentile ranking of absolute deviation from climatological mean...",
  },
  // ... for all 6 indicators
} as const;
```

All components import from this file. To change an indicator's color, label, or explainer text — edit one place.

### 7.4 Source Status Metadata

```ts
// lib/sources.ts
export const DATA_SOURCES = {
  imd_rainfall: {
    name: "IMD Pune Gridded Rainfall",
    shortName: "IMD Rainfall",
    resolution: "0.25° lat/lon",
    frequency: "Monthly",
    coverage: "Since 1901",
    reliability: "high",
    indicators: ["rainfall_anomaly"],
  },
  // ... for all sources
} as const;
```

## 8. Files to Create/Modify

### New files:
- `lib/theme.ts` — CSS variable types, theme helper utilities
- `lib/indicators.ts` — indicator metadata (colors, labels, explainers, sources)
- `lib/sources.ts` — data source metadata (names, reliability, coverage)
- `components/sidebar.tsx` — new sidebar nav replacing top nav
- `components/stat-card.tsx` — stat card with accent bar, change badge, proportion bar
- `components/indicator-card.tsx` — indicator gauge + source line + inline explainer
- `components/source-chip.tsx` — source status pill for footer
- `components/source-card.tsx` — detailed source row with reliability badge
- `components/explainer-card.tsx` — the inline "What this means" card
- `components/methodology-banner.tsx` — dark green CTA banner
- `components/risk-donut.tsx` — semi-circle distribution chart
- `app/methodology/page.tsx` — new methodology page

### Modified files:
- `globals.css` — replace current theme variables with the design system tokens
- `tailwind.config.ts` — extend theme with CSS variable mappings
- `app/layout.tsx` — replace top nav with sidebar layout
- `app/page.tsx` — redesign with stat strip, indicator row, methodology banner
- `app/state/[stateId]/page.tsx` — same pattern applied
- `app/district/[districtId]/district-scorecard.tsx` — hero card, 6 gauges, sources card
- `app/compare/page.tsx` — updated styling, add explainers to comparison
- `app/alerts/alerts-dashboard.tsx` — add summary stats, visual severity
- `app/weights/page.tsx` — add per-slider explainers, visual preset cards
- `components/nav.tsx` — remove (replaced by sidebar)
- `components/risk-badge.tsx` — update to use theme tokens
- `components/data-freshness.tsx` — replace with source-chip footer pattern

## 9. Out of Scope

- Dark mode (future — the theming system supports it, but not implementing now)
- Search/autocomplete for districts
- Alert acknowledgment workflow
- Export/PDF generation
- Mobile responsive layout (sidebar collapses — defer to later)

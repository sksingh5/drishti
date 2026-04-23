# Landing Page Redesign — Design Spec

## Context
DiCRA v2 is pivoting from a geospatial dashboard to a Climate-Financial Intelligence Platform. The landing page needs to communicate three key messages to a mixed audience (bankers, state planners, researchers) using dramatic visuals and Apple-inspired design language.

## Design Direction
- **Hero style**: Full-bleed aerial photo with dark overlay (Option A — approved)
- **Audience**: Broad "Climate Intelligence Platform" framing for bankers + planners + researchers
- **Aesthetic**: Apple website design language — spacious, large bold typography, smooth scroll reveals, minimal borders, generous white space, dramatic section transitions
- **Images**: Pexels API (free, commercial use) — aerial India landscapes, climate imagery

## Key Messages (mapped to sections)
- **A**: "Comprehensive District-Level Climate Analysis and Decision Making Dashboard"
- **B**: "Built on the robust framework of reliable data sources and public API"
- **C**: "Modules for different decision making use cases"

---

## Section Structure (7 sections)

### 1. Hero — Full-Bleed Photo
- Aerial India landscape (Kashmir/Punjab fields) behind 65% dark overlay
- Single CTA: "Explore Dashboard →" (emerald green button)
- NO methodology button
- Credibility strip below: "7 Indicators · 784 Districts · 36 States & UTs · Peer-Reviewed"
- Apple-style: Large 48-56px font-weight-900 headline, generous vertical padding (120px+)

### 2. Data Provenance & Trust
- Headline: "Built on Reliable, Public Data Sources"
- Subhead: "Every indicator traces to a published government or institutional dataset"
- 4 data source cards in a row: IMD Pune, Copernicus ERA5, NASA MODIS, Google Earth Engine
- Each card: logo-placeholder, name, what it provides, resolution
- Dark brand banner below: transparency guarantee statement
- Apple-style: Cards float with subtle shadow, generous spacing, fade-in on scroll

### 3. Decision-Making Modules
- Headline: "Modules for Every Decision Maker"
- 3 large module cards:
  1. **National Overview** — "State-level risk heatmap with composite scoring" [LIVE]
  2. **District Scorecard** — "7-indicator risk profile with actionable insights" [LIVE]
  3. **MFI Portfolio Stress Test** — "Overlay loan exposure with climate risk zones" [COMING SOON]
- Each card: icon, title, description, status badge
- Apple-style: Large cards with hover lift effect, clean grid, generous padding

### 4. Indicators Grid
- Headline: "Seven Indicators, One Composite Score"
- 7 indicator cards (existing data from `lib/indicators.ts`)
- Each: color dot, name, one-line explainer, source badge
- Apple-style: Clean grid, subtle hover, no heavy borders

### 5. Platform Status
- Headline: "What's Live"
- Live from Supabase: indicator name, district count, latest period
- Green checkmark for live, clock for coming soon
- Apple-style: Minimal list with generous line height

### 6. CTA
- Full-width dark section with climate photo background (drought/cracked earth)
- Headline: "Start Exploring District-Level Climate Intelligence"
- Single CTA button: "Open Dashboard →"
- Apple-style: Dramatic dark section, large text, centered

### 7. Footer
- Compact: data source credits, methodology link, version
- Muted text on light background

---

## Apple Design Language — Specifics
- **Typography**: 48-56px hero headlines, 32-36px section headlines, weight 800-900
- **Spacing**: 120-160px section padding, 80px+ between elements
- **Colors**: Keep DiCRA palette but use more white space between sections
- **Borders**: Minimal — prefer shadow (`0 2px 20px rgba(0,0,0,0.06)`) over borders
- **Animations**: CSS `@keyframes` fade-up on scroll (IntersectionObserver), 0.6s ease-out
- **Transitions**: Hover cards lift with `transform: translateY(-4px)` + shadow increase
- **Sections**: Alternate between white and very subtle off-white backgrounds
- **Images**: Pexels photos downloaded to `/public/images/` for performance

## Image Sources (Pexels, free commercial use)
- Hero: Aerial Kashmir/Punjab fields (ID: 11768985 or 29277511)
- CTA background: Drought/cracked earth (ID: 36898812)
- Download at build time, serve from `/public/images/`

## File Changes
- **Modify**: `app/page.tsx` — complete rewrite of landing page
- **New**: `components/scroll-reveal.tsx` — IntersectionObserver wrapper for fade-in animations
- **New**: `public/images/hero-aerial.jpg` — downloaded from Pexels
- **New**: `public/images/cta-drought.jpg` — downloaded from Pexels
- **Modify**: `app/globals.css` — add scroll animation keyframes

## Verification
- Visual: all 7 sections render with correct imagery and messaging
- Mobile: sections stack, hero text scales down, cards go single column
- Dark mode: sections adapt (hero overlay stays dark, other sections use dark surface)
- Performance: images optimized (Next.js Image component with priority on hero)
- Build: `npm run build` passes

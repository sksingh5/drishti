# Crop & Farmer Impact Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add crop-specific advisory cards and a district-level point query map to district pages, organized in a responsive tabs (desktop) / accordion (mobile) layout.

**Architecture:** Static JSON data files map India's ~15 agro-climatic zones to top crops per zone, with districts assigned to zones. Crop alert rules match indicator scores to crop-specific warnings. The district page is restructured into 3 sections (Risk Overview, Crop Advisory, Trends) displayed as tabs on desktop and accordion on mobile. The Crop Advisory tab includes a district map with GEE point query and standing advisory cards per crop.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, MapLibre GL, GEE (existing point query)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `data/crop-zones.json` | Static mapping: agro-climatic zones → crops → district IDs |
| `data/crop-alert-rules.json` | Crop + indicator + threshold → alert message |
| `data/crop-guidance-rules.json` | Crop + risk condition → ICAR/KVK guidance text |
| `lib/crop-data.ts` | Functions: getCropsForDistrict(), getAlertsForCrop(), getGuidanceForCrop() |
| `components/district-sections.tsx` | Responsive tabs (desktop) / accordion (mobile) wrapper |
| `components/crop-advisory-card.tsx` | Single crop card: alerts + guidance |
| `components/crop-advisory-section.tsx` | District map + grid of crop cards |
| `app/district/[districtId]/district-scorecard.tsx` | Modified: wrap content in section layout |

---

## Phase 1: Data Layer

### Task 1: Create Agro-Climatic Zone Data

**Files:**
- Create: `data/crop-zones.json`

- [ ] **Step 1: Create the zone-to-crop mapping file**

This is India's 15 agro-climatic zones with the dominant crops and a placeholder for district IDs (will be populated in Step 2).

```json
{
  "zones": [
    {
      "id": "western_himalayan",
      "name": "Western Himalayan",
      "crops": ["Apple", "Rice", "Maize", "Wheat"],
      "district_ids": []
    },
    {
      "id": "eastern_himalayan",
      "name": "Eastern Himalayan",
      "crops": ["Rice", "Tea", "Maize", "Large Cardamom"],
      "district_ids": []
    },
    {
      "id": "lower_gangetic_plains",
      "name": "Lower Gangetic Plains",
      "crops": ["Rice", "Jute", "Wheat", "Potato"],
      "district_ids": []
    },
    {
      "id": "middle_gangetic_plains",
      "name": "Middle Gangetic Plains",
      "crops": ["Rice", "Wheat", "Sugarcane", "Maize"],
      "district_ids": []
    },
    {
      "id": "upper_gangetic_plains",
      "name": "Upper Gangetic Plains",
      "crops": ["Wheat", "Sugarcane", "Rice", "Mustard"],
      "district_ids": []
    },
    {
      "id": "trans_gangetic_plains",
      "name": "Trans-Gangetic Plains",
      "crops": ["Wheat", "Rice", "Cotton", "Sugarcane"],
      "district_ids": []
    },
    {
      "id": "eastern_plateau_hills",
      "name": "Eastern Plateau & Hills",
      "crops": ["Rice", "Groundnut", "Pigeon Pea", "Maize"],
      "district_ids": []
    },
    {
      "id": "central_plateau_hills",
      "name": "Central Plateau & Hills",
      "crops": ["Soybean", "Wheat", "Gram", "Sorghum"],
      "district_ids": []
    },
    {
      "id": "western_plateau_hills",
      "name": "Western Plateau & Hills",
      "crops": ["Cotton", "Soybean", "Pigeon Pea", "Sorghum"],
      "district_ids": []
    },
    {
      "id": "southern_plateau_hills",
      "name": "Southern Plateau & Hills",
      "crops": ["Rice", "Groundnut", "Cotton", "Sunflower"],
      "district_ids": []
    },
    {
      "id": "east_coast_plains_hills",
      "name": "East Coast Plains & Hills",
      "crops": ["Rice", "Groundnut", "Sugarcane", "Coconut"],
      "district_ids": []
    },
    {
      "id": "west_coast_plains_ghats",
      "name": "West Coast Plains & Ghats",
      "crops": ["Rice", "Coconut", "Cashew", "Rubber"],
      "district_ids": []
    },
    {
      "id": "gujarat_plains_hills",
      "name": "Gujarat Plains & Hills",
      "crops": ["Cotton", "Groundnut", "Wheat", "Cumin"],
      "district_ids": []
    },
    {
      "id": "western_dry",
      "name": "Western Dry Region",
      "crops": ["Pearl Millet", "Cluster Bean", "Mustard", "Cumin"],
      "district_ids": []
    },
    {
      "id": "island",
      "name": "Island Region",
      "crops": ["Coconut", "Rice", "Arecanut", "Spices"],
      "district_ids": []
    }
  ]
}
```

- [ ] **Step 2: Populate district IDs per zone**

Write a script or manually map district IDs from the Supabase `districts` table to their agro-climatic zones using state-level grouping. The mapping can be approximate — districts in a state typically belong to 1-2 zones.

Use this state-to-zone mapping as a starting point:
- Jammu & Kashmir, Himachal Pradesh, Uttarakhand → western_himalayan
- Sikkim, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Meghalaya, Assam → eastern_himalayan
- West Bengal → lower_gangetic_plains
- Bihar, Jharkhand → middle_gangetic_plains
- Uttar Pradesh (western) → upper_gangetic_plains
- Punjab, Haryana, Delhi, Chandigarh → trans_gangetic_plains
- Odisha, Chhattisgarh → eastern_plateau_hills
- Madhya Pradesh, Bundelkhand (UP) → central_plateau_hills
- Maharashtra (Vidarbha, Marathwada) → western_plateau_hills
- Karnataka, Telangana → southern_plateau_hills
- Andhra Pradesh, Tamil Nadu, Puducherry → east_coast_plains_hills
- Kerala, Goa, coastal Karnataka, coastal Maharashtra → west_coast_plains_ghats
- Gujarat, Dadra & Nagar Haveli, Daman & Diu → gujarat_plains_hills
- Rajasthan → western_dry
- Andaman & Nicobar, Lakshadweep → island

Query Supabase for all district IDs grouped by state, then assign to zones.

- [ ] **Step 3: Commit**

```bash
git add data/crop-zones.json
git commit -m "feat: add agro-climatic zone to crop mapping data"
```

---

### Task 2: Create Crop Alert Rules

**Files:**
- Create: `data/crop-alert-rules.json`

- [ ] **Step 1: Create the alert rules file**

Each rule maps a crop + indicator + threshold to an alert message. When the district's indicator score exceeds the threshold, the alert fires.

```json
[
  { "crop": "Rice", "indicator": "heat_stress", "threshold": 60, "direction": "above", "alert": "High temperatures can reduce grain filling in rice — consider shade nets or adjusted planting schedule" },
  { "crop": "Rice", "indicator": "soil_moisture", "threshold": 60, "direction": "above", "alert": "Low soil moisture is critical for paddy — ensure irrigation availability for standing water requirements" },
  { "crop": "Rice", "indicator": "flood_risk", "threshold": 60, "direction": "above", "alert": "Flood risk elevated — prepare drainage channels and consider raised nursery beds" },
  { "crop": "Rice", "indicator": "drought_index", "threshold": 60, "direction": "above", "alert": "Drought conditions detected — switch to short-duration rice varieties if sowing window remains" },

  { "crop": "Wheat", "indicator": "heat_stress", "threshold": 55, "direction": "above", "alert": "Terminal heat can reduce wheat yield significantly — consider early sowing or heat-tolerant varieties (HD 3086, DBW 187)" },
  { "crop": "Wheat", "indicator": "rainfall_anomaly", "threshold": 65, "direction": "above", "alert": "Abnormal rainfall during wheat season — watch for lodging and fungal infections" },
  { "crop": "Wheat", "indicator": "soil_moisture", "threshold": 55, "direction": "above", "alert": "Soil moisture dropping — ensure timely irrigation at crown root initiation and flowering stages" },

  { "crop": "Cotton", "indicator": "heat_stress", "threshold": 60, "direction": "above", "alert": "High temperatures may affect boll development and fiber quality — ensure adequate irrigation" },
  { "crop": "Cotton", "indicator": "soil_moisture", "threshold": 60, "direction": "above", "alert": "Low soil moisture is critical during boll filling — consider drip irrigation" },
  { "crop": "Cotton", "indicator": "rainfall_anomaly", "threshold": 70, "direction": "above", "alert": "Excessive rainfall can cause boll rot — ensure field drainage" },
  { "crop": "Cotton", "indicator": "vegetation_health", "threshold": 65, "direction": "above", "alert": "Vegetation stress detected — check for pest infestation (pink bollworm, whitefly)" },

  { "crop": "Sugarcane", "indicator": "heat_stress", "threshold": 65, "direction": "above", "alert": "Extreme heat can affect sucrose accumulation — maintain adequate irrigation" },
  { "crop": "Sugarcane", "indicator": "soil_moisture", "threshold": 55, "direction": "above", "alert": "Sugarcane is water-intensive — low soil moisture impacts growth rate and juice quality" },
  { "crop": "Sugarcane", "indicator": "flood_risk", "threshold": 60, "direction": "above", "alert": "Waterlogging can cause red rot — ensure field drainage" },

  { "crop": "Soybean", "indicator": "rainfall_anomaly", "threshold": 60, "direction": "above", "alert": "Soybean is sensitive to waterlogging — ensure drainage during heavy rainfall spells" },
  { "crop": "Soybean", "indicator": "heat_stress", "threshold": 60, "direction": "above", "alert": "Heat stress during flowering can reduce pod setting — consider foliar sprays" },
  { "crop": "Soybean", "indicator": "drought_index", "threshold": 60, "direction": "above", "alert": "Moisture stress during pod filling reduces yield — prioritize irrigation if available" },

  { "crop": "Groundnut", "indicator": "soil_moisture", "threshold": 60, "direction": "above", "alert": "Moisture stress affects pegging and pod development — ensure soil moisture at critical stages" },
  { "crop": "Groundnut", "indicator": "heat_stress", "threshold": 65, "direction": "above", "alert": "High soil temperatures can affect kernel development — mulching recommended" },

  { "crop": "Maize", "indicator": "heat_stress", "threshold": 60, "direction": "above", "alert": "Heat stress during tasseling can sharply reduce yield — ensure irrigation during pollination" },
  { "crop": "Maize", "indicator": "drought_index", "threshold": 55, "direction": "above", "alert": "Maize is drought-sensitive at silking stage — prioritize irrigation" },
  { "crop": "Maize", "indicator": "flood_risk", "threshold": 55, "direction": "above", "alert": "Maize cannot tolerate waterlogging — ensure raised bed planting in flood-prone areas" },

  { "crop": "Pigeon Pea", "indicator": "soil_moisture", "threshold": 65, "direction": "above", "alert": "Pigeon pea tolerates moderate drought but needs moisture at flowering — monitor soil conditions" },
  { "crop": "Pigeon Pea", "indicator": "flood_risk", "threshold": 50, "direction": "above", "alert": "Pigeon pea is highly sensitive to waterlogging — avoid low-lying plots" },

  { "crop": "Pearl Millet", "indicator": "drought_index", "threshold": 70, "direction": "above", "alert": "Even drought-hardy pearl millet needs moisture at panicle emergence — monitor closely" },
  { "crop": "Pearl Millet", "indicator": "heat_stress", "threshold": 70, "direction": "above", "alert": "Extreme heat can affect grain development — consider OPV varieties for resilience" },

  { "crop": "Mustard", "indicator": "heat_stress", "threshold": 50, "direction": "above", "alert": "Mustard is cold-season — elevated temperatures during flowering reduce oil content" },
  { "crop": "Mustard", "indicator": "rainfall_anomaly", "threshold": 60, "direction": "above", "alert": "Excess moisture promotes Alternaria blight — monitor and apply fungicide if needed" },

  { "crop": "Coconut", "indicator": "drought_index", "threshold": 60, "direction": "above", "alert": "Extended drought reduces nut yield — basin irrigation recommended for young palms" },
  { "crop": "Coconut", "indicator": "heat_stress", "threshold": 65, "direction": "above", "alert": "Heat stress causes button shedding — provide adequate mulching and irrigation" },

  { "crop": "Potato", "indicator": "heat_stress", "threshold": 50, "direction": "above", "alert": "Potato tuber formation is impaired above 30°C — consider early harvest or hill-region sourcing" },
  { "crop": "Potato", "indicator": "soil_moisture", "threshold": 60, "direction": "above", "alert": "Irregular soil moisture causes cracking and hollow heart — maintain uniform irrigation" }
]
```

- [ ] **Step 2: Commit**

```bash
git add data/crop-alert-rules.json
git commit -m "feat: add crop-specific climate alert rules"
```

---

### Task 3: Create Crop Guidance Rules

**Files:**
- Create: `data/crop-guidance-rules.json`

- [ ] **Step 1: Create the guidance rules file**

Each entry maps a crop + condition to a list of general guidance points (sourced from ICAR/KVK standard recommendations).

```json
[
  {
    "crop": "Rice",
    "conditions": { "heat_stress": 60 },
    "guidance": [
      "Use short-duration varieties (e.g., Pusa Basmati 1509, MTU 1010) to escape terminal heat",
      "Apply light irrigation during evenings to cool the field microclimate",
      "Avoid nitrogen top-dressing during extreme heat — it worsens leaf burn"
    ]
  },
  {
    "crop": "Rice",
    "conditions": { "drought_index": 55 },
    "guidance": [
      "Switch to System of Rice Intensification (SRI) to reduce water requirement by 30-40%",
      "Alternate wetting and drying (AWD) saves water without yield penalty",
      "Consider direct-seeded rice (DSR) if transplanting window is missed"
    ]
  },
  {
    "crop": "Rice",
    "conditions": { "flood_risk": 55 },
    "guidance": [
      "Use submergence-tolerant varieties (Swarna-Sub1, FR13A)",
      "Prepare raised nursery beds to protect seedlings",
      "Keep drainage channels clear before monsoon onset"
    ]
  },
  {
    "crop": "Wheat",
    "conditions": { "heat_stress": 55 },
    "guidance": [
      "Advance sowing by 7-10 days to avoid terminal heat during grain filling",
      "Apply light irrigation at grain filling stage to buffer heat impact",
      "Use heat-tolerant varieties: HD 3086, DBW 187, WH 1105"
    ]
  },
  {
    "crop": "Wheat",
    "conditions": { "soil_moisture": 55 },
    "guidance": [
      "Ensure irrigation at 4 critical stages: CRI, tillering, flowering, grain filling",
      "Mulching with rice straw retains soil moisture and suppresses weeds",
      "Sprinkler irrigation is more efficient than flood irrigation for wheat"
    ]
  },
  {
    "crop": "Cotton",
    "conditions": { "heat_stress": 60 },
    "guidance": [
      "Maintain adequate soil moisture through drip irrigation during peak summer",
      "Apply kaolin spray (5%) to reflect sunlight and reduce leaf temperature",
      "Monitor for increased bollworm pressure — heat stress weakens plant defenses"
    ]
  },
  {
    "crop": "Cotton",
    "conditions": { "soil_moisture": 60 },
    "guidance": [
      "Drip irrigation with fertigation optimizes water use in cotton",
      "Intercropping with short-duration pulses conserves soil moisture",
      "Apply organic mulch to reduce evaporation from soil surface"
    ]
  },
  {
    "crop": "Soybean",
    "conditions": { "rainfall_anomaly": 60 },
    "guidance": [
      "Sow on ridges or raised beds to prevent waterlogging",
      "Ensure proper seed treatment (Trichoderma) to prevent damping off in wet conditions",
      "Avoid sowing in heavy black soil areas prone to waterlogging"
    ]
  },
  {
    "crop": "Soybean",
    "conditions": { "drought_index": 55 },
    "guidance": [
      "Apply life-saving irrigation at flowering and pod-filling stages",
      "Spray 2% KCl solution to improve drought tolerance",
      "Mulching with crop residue reduces soil moisture loss"
    ]
  },
  {
    "crop": "Maize",
    "conditions": { "heat_stress": 60 },
    "guidance": [
      "Irrigate during tasseling — maize is most heat-sensitive at pollination",
      "Consider heat-tolerant hybrids (HQPM-1, Vivek QPM-9)",
      "Maintain crop residue on soil surface to reduce soil temperature"
    ]
  },
  {
    "crop": "Groundnut",
    "conditions": { "soil_moisture": 60 },
    "guidance": [
      "Apply gypsum at flowering to support peg penetration in dry soils",
      "Sprinkler irrigation at pegging and pod development stages is critical",
      "Harvest at optimal maturity — water stress causes immature pods"
    ]
  },
  {
    "crop": "Sugarcane",
    "conditions": { "heat_stress": 65 },
    "guidance": [
      "Maintain trash mulching to keep soil cool and conserve moisture",
      "Irrigate at 7-day intervals during peak summer months",
      "Detrashing lower leaves improves air circulation and reduces pest buildup"
    ]
  },
  {
    "crop": "Pearl Millet",
    "conditions": { "drought_index": 60 },
    "guidance": [
      "Choose extra-early varieties (60-65 days) to escape late-season drought",
      "Tie ridges or in-situ moisture conservation techniques reduce runoff",
      "Apply farmyard manure to improve soil water-holding capacity"
    ]
  },
  {
    "crop": "Mustard",
    "conditions": { "heat_stress": 50 },
    "guidance": [
      "Complete sowing by mid-October to ensure flowering occurs in cool conditions",
      "Apply irrigation at rosette and siliqua formation stages",
      "Avoid late sowing — every week of delay reduces yield by 8-10%"
    ]
  },
  {
    "crop": "Coconut",
    "conditions": { "drought_index": 55 },
    "guidance": [
      "Basin irrigation with 200L per palm per week during dry months",
      "Apply husk burial or coir pith mulching around the basin",
      "Intercrop with drought-tolerant crops (cowpea, horse gram) to maximize land use"
    ]
  },
  {
    "crop": "Potato",
    "conditions": { "heat_stress": 50 },
    "guidance": [
      "Advance planting to early October for plains and complete by November",
      "Use heat-tolerant varieties: Kufri Surya, Kufri Pukhraj",
      "Maintain uniform irrigation — alternate wet-dry causes tuber defects"
    ]
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add data/crop-guidance-rules.json
git commit -m "feat: add crop-specific ICAR/KVK guidance rules"
```

---

### Task 4: Create Crop Data Library

**Files:**
- Create: `lib/crop-data.ts`

- [ ] **Step 1: Create the library**

```typescript
// lib/crop-data.ts
import cropZonesData from "@/data/crop-zones.json";
import alertRulesData from "@/data/crop-alert-rules.json";
import guidanceRulesData from "@/data/crop-guidance-rules.json";
import type { IndicatorType } from "@/lib/indicators";

interface Zone {
  id: string;
  name: string;
  crops: string[];
  district_ids: number[];
}

interface AlertRule {
  crop: string;
  indicator: string;
  threshold: number;
  direction: "above" | "below";
  alert: string;
}

interface GuidanceRule {
  crop: string;
  conditions: Record<string, number>;
  guidance: string[];
}

export interface CropAlert {
  indicator: string;
  score: number;
  alert: string;
}

export interface CropAdvisory {
  crop: string;
  zone: string;
  alerts: CropAlert[];
  guidance: string[];
}

const zones: Zone[] = cropZonesData.zones;
const alertRules: AlertRule[] = alertRulesData as AlertRule[];
const guidanceRules: GuidanceRule[] = guidanceRulesData as GuidanceRule[];

/** Find which agro-climatic zone a district belongs to */
export function getZoneForDistrict(districtId: number): Zone | null {
  return zones.find(z => z.district_ids.includes(districtId)) ?? null;
}

/** Get the list of major crops for a district */
export function getCropsForDistrict(districtId: number): { crops: string[]; zoneName: string } {
  const zone = getZoneForDistrict(districtId);
  if (!zone) return { crops: [], zoneName: "Unknown" };
  return { crops: zone.crops, zoneName: zone.name };
}

/** Generate alerts for a specific crop based on current indicator scores */
export function getAlertsForCrop(
  crop: string,
  scores: Partial<Record<IndicatorType, number>>
): CropAlert[] {
  const alerts: CropAlert[] = [];
  for (const rule of alertRules) {
    if (rule.crop !== crop) continue;
    const score = scores[rule.indicator as IndicatorType];
    if (score === undefined) continue;
    const triggered = rule.direction === "above"
      ? score >= rule.threshold
      : score <= rule.threshold;
    if (triggered) {
      alerts.push({ indicator: rule.indicator, score, alert: rule.alert });
    }
  }
  return alerts;
}

/** Get general guidance for a crop based on current conditions */
export function getGuidanceForCrop(
  crop: string,
  scores: Partial<Record<IndicatorType, number>>
): string[] {
  const allGuidance: string[] = [];
  for (const rule of guidanceRules) {
    if (rule.crop !== crop) continue;
    const conditionsMet = Object.entries(rule.conditions).every(
      ([indicator, threshold]) => {
        const score = scores[indicator as IndicatorType];
        return score !== undefined && score >= threshold;
      }
    );
    if (conditionsMet) {
      allGuidance.push(...rule.guidance);
    }
  }
  return allGuidance;
}

/** Get full advisory for all crops in a district */
export function getDistrictCropAdvisory(
  districtId: number,
  scores: Partial<Record<IndicatorType, number>>
): CropAdvisory[] {
  const { crops, zoneName } = getCropsForDistrict(districtId);
  return crops.map(crop => ({
    crop,
    zone: zoneName,
    alerts: getAlertsForCrop(crop, scores),
    guidance: getGuidanceForCrop(crop, scores),
  }));
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/crop-data.ts
git commit -m "feat: add crop data library — zone lookup, alerts, guidance"
```

---

## Phase 2: UI Components

### Task 5: Create Responsive Section Layout (Tabs / Accordion)

**Files:**
- Create: `components/district-sections.tsx`

- [ ] **Step 1: Create the responsive section component**

This component renders tabs on desktop (md+) and an accordion on mobile. It takes an array of sections with labels and content.

```tsx
// components/district-sections.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Section {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface DistrictSectionsProps {
  sections: Section[];
  defaultSection?: string;
}

export function DistrictSections({ sections, defaultSection }: DistrictSectionsProps) {
  const [activeTab, setActiveTab] = useState(defaultSection ?? sections[0]?.id ?? "");
  const [expandedMobile, setExpandedMobile] = useState<Set<string>>(
    new Set([defaultSection ?? sections[0]?.id ?? ""])
  );

  const toggleMobile = (id: string) => {
    setExpandedMobile(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Desktop: Tabs */}
      <div className="hidden md:block">
        <div className="flex gap-1 mb-5 border-b border-[var(--dicra-border)]">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className="flex items-center gap-2 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.5px] transition-colors relative"
              style={{
                color: activeTab === s.id ? "var(--dicra-accent)" : "var(--dicra-text-muted)",
              }}
            >
              {s.icon}
              {s.label}
              {activeTab === s.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: "var(--dicra-accent)" }} />
              )}
            </button>
          ))}
        </div>
        {sections.map(s => (
          <div key={s.id} style={{ display: activeTab === s.id ? "block" : "none" }}>
            {s.content}
          </div>
        ))}
      </div>

      {/* Mobile: Accordion */}
      <div className="md:hidden flex flex-col gap-2">
        {sections.map(s => {
          const isExpanded = expandedMobile.has(s.id);
          return (
            <div key={s.id}
                 className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden"
                 style={{ background: "var(--dicra-surface)" }}>
              <button
                onClick={() => toggleMobile(s.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-bold uppercase tracking-[0.5px]"
                style={{
                  color: isExpanded ? "var(--dicra-accent)" : "var(--dicra-text-muted)",
                  background: isExpanded ? "var(--dicra-surface-muted)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  {s.icon}
                  {s.label}
                </div>
                <ChevronDown
                  size={16}
                  className="transition-transform"
                  style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>
              {isExpanded && (
                <div className="p-4">
                  {s.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/district-sections.tsx
git commit -m "feat: add responsive tabs/accordion section layout component"
```

---

### Task 6: Create Crop Advisory Card Component

**Files:**
- Create: `components/crop-advisory-card.tsx`

- [ ] **Step 1: Create the card component**

```tsx
// components/crop-advisory-card.tsx
"use client";

import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { INDICATORS } from "@/lib/indicators";
import type { CropAdvisory } from "@/lib/crop-data";

const CROP_ICONS: Record<string, string> = {
  Rice: "🌾", Wheat: "🌾", Cotton: "🏵️", Sugarcane: "🎋",
  Soybean: "🫘", Groundnut: "🥜", Maize: "🌽", Potato: "🥔",
  Tea: "🍵", Coconut: "🥥", Mustard: "🌼", Apple: "🍎",
  "Pearl Millet": "🌾", "Pigeon Pea": "🫘", Sorghum: "🌾",
  Default: "🌱",
};

export function CropAdvisoryCard({ advisory }: { advisory: CropAdvisory }) {
  const icon = CROP_ICONS[advisory.crop] ?? CROP_ICONS.Default;
  const hasAlerts = advisory.alerts.length > 0;
  const hasGuidance = advisory.guidance.length > 0;

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden"
         style={{ background: "var(--dicra-surface)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--dicra-border)]"
           style={{ background: "var(--dicra-surface-muted)" }}>
        <span className="text-[18px]">{icon}</span>
        <span className="text-[13px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>
          {advisory.crop}
        </span>
      </div>

      <div className="p-4">
        {/* Alerts Section */}
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.8px] mb-2"
               style={{ color: "var(--dicra-text-muted)" }}>
            Alerts
          </div>
          {hasAlerts ? (
            <div className="flex flex-col gap-1.5">
              {advisory.alerts.map((a, i) => {
                const meta = INDICATORS[a.indicator as keyof typeof INDICATORS];
                return (
                  <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5"
                                   style={{ color: "var(--dicra-risk-high)" }} />
                    <div>
                      <span className="font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
                        {meta?.shortLabel ?? a.indicator} ({a.score}/100):
                      </span>{" "}
                      <span style={{ color: "var(--dicra-text-secondary)" }}>{a.alert}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--dicra-text-faint)" }}>
              <CheckCircle size={13} style={{ color: "var(--dicra-risk-low)" }} />
              No active alerts for {advisory.crop}
            </div>
          )}
        </div>

        {/* General Guidance Section */}
        {hasGuidance && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.8px] mb-2"
                 style={{ color: "var(--dicra-text-muted)" }}>
              General Guidance
            </div>
            <div className="flex flex-col gap-1.5">
              {advisory.guidance.map((g, i) => (
                <div key={i} className="flex gap-2 text-[11px] leading-relaxed">
                  <Lightbulb size={13} className="flex-shrink-0 mt-0.5"
                             style={{ color: "var(--dicra-accent)" }} />
                  <span style={{ color: "var(--dicra-text-secondary)" }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/crop-advisory-card.tsx
git commit -m "feat: add crop advisory card with alerts and guidance"
```

---

### Task 7: Create Crop Advisory Section (Map + Cards)

**Files:**
- Create: `components/crop-advisory-section.tsx`

- [ ] **Step 1: Create the section component**

This component renders the district map (with point query) at the top and crop advisory cards below.

```tsx
// components/crop-advisory-section.tsx
"use client";

import { ChoroplethMap } from "@/components/map/choropleth-map";
import { CropAdvisoryCard } from "@/components/crop-advisory-card";
import type { CropAdvisory } from "@/lib/crop-data";

interface CropAdvisorySectionProps {
  advisories: CropAdvisory[];
  zoneName: string;
  districtName: string;
  districtGeojsonUrl?: string;
}

export function CropAdvisorySection({ advisories, zoneName, districtName, districtGeojsonUrl }: CropAdvisorySectionProps) {
  return (
    <div>
      {/* District Map with Point Query */}
      {districtGeojsonUrl && (
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden mb-5"
             style={{ height: 320, background: "var(--dicra-surface)" }}>
          <ChoroplethMap
            geojsonUrl={districtGeojsonUrl}
            features={[]}
            fitBounds={undefined}
          />
        </div>
      )}

      {/* Zone label */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-muted)" }}>
          Agro-Climatic Zone: {zoneName}
        </div>
        <div className="text-[13px] font-bold mt-1" style={{ color: "var(--dicra-text-primary)" }}>
          Advisory for Major Crops in {districtName}
        </div>
      </div>

      {/* Crop Advisory Cards */}
      {advisories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {advisories.map(a => (
            <CropAdvisoryCard key={a.crop} advisory={a} />
          ))}
        </div>
      ) : (
        <div className="text-[12px] text-center py-8" style={{ color: "var(--dicra-text-faint)" }}>
          Crop data not yet available for this district.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/crop-advisory-section.tsx
git commit -m "feat: add crop advisory section with map and card grid"
```

---

## Phase 3: Integration

### Task 8: Restructure District Scorecard with Tabs/Accordion

**Files:**
- Modify: `app/district/[districtId]/district-scorecard.tsx`

This is the largest task. The existing flat layout is wrapped into the `DistrictSections` component with 3 tabs.

- [ ] **Step 1: Read the current file**

Read `app/district/[districtId]/district-scorecard.tsx` in full.

- [ ] **Step 2: Add imports**

Add at the top of the file:

```tsx
import { DistrictSections } from "@/components/district-sections";
import { CropAdvisorySection } from "@/components/crop-advisory-section";
import { getDistrictCropAdvisory, getCropsForDistrict } from "@/lib/crop-data";
import { ShieldAlert, Sprout, TrendingUp } from "lucide-react";
```

- [ ] **Step 3: Compute crop advisory data**

After the existing `periodLabel` computation (around line 38-40), add:

```tsx
const cropAdvisories = getDistrictCropAdvisory(district.id, indicatorScores as Partial<Record<IndicatorType, number>>);
const { zoneName } = getCropsForDistrict(district.id);
```

- [ ] **Step 4: Wrap content in DistrictSections**

Replace everything after the hero row closing `</div>` (after the metadata grid, around line 152) with:

```tsx
      <DistrictSections
        defaultSection="risk"
        sections={[
          {
            id: "risk",
            label: "Risk Overview",
            icon: <ShieldAlert size={14} />,
            content: (
              <>
                {/* Recommended Actions */}
                {/* ... existing ActionPanel code ... */}

                {/* 6 Indicator Cards */}
                {/* ... existing InsightCard grid code ... */}

                {/* Data Sources */}
                {/* ... existing data sources table ... */}

                <SourceFooter />
              </>
            ),
          },
          {
            id: "crops",
            label: "Crop Advisory",
            icon: <Sprout size={14} />,
            content: (
              <CropAdvisorySection
                advisories={cropAdvisories}
                zoneName={zoneName}
                districtName={district.name}
              />
            ),
          },
          {
            id: "trends",
            label: "Trends",
            icon: <TrendingUp size={14} />,
            content: (
              <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
                   style={{ background: "var(--dicra-surface)" }}>
                <div className="text-[12px] font-bold uppercase tracking-[0.8px] mb-3"
                     style={{ color: "var(--dicra-text-secondary)" }}>
                  Historical Trends
                </div>
                <TrendChart data={history} />
              </div>
            ),
          },
        ]}
      />
```

Move the existing ActionPanel, InsightCard grid, and data sources table into the `risk` section content. Move the TrendChart into the `trends` section. The hero row stays outside the sections (always visible).

- [ ] **Step 5: Clean up removed code**

Remove the old flat layout code that's now been moved into the sections. Remove the `MethodologyBanner` if it's no longer needed here (it's accessible via the dashboard).

- [ ] **Step 6: Verify the page renders**

Open `http://localhost:3000/district/1` — should see hero row + 3 tabs. Click each tab to verify content renders.

- [ ] **Step 7: Test mobile**

Open browser dev tools, switch to mobile viewport (375px). Should see accordion with collapsible sections.

- [ ] **Step 8: Commit**

```bash
git add app/district/[districtId]/district-scorecard.tsx
git commit -m "feat: restructure district page with tabs/accordion + crop advisory"
```

---

## Execution Order

1. **Task 1** — Zone data (needs district ID population)
2. **Task 2** — Alert rules (independent)
3. **Task 3** — Guidance rules (independent)
4. **Task 4** — Crop data library (depends on Tasks 1-3)
5. **Task 5** — Section layout component (independent of data tasks)
6. **Task 6** — Crop advisory card (depends on Task 4 types)
7. **Task 7** — Crop advisory section (depends on Tasks 5, 6)
8. **Task 8** — District scorecard integration (depends on all above)

Tasks 1, 2, 3, and 5 can run in parallel.
Task 4 needs 1-3 complete.
Tasks 6 and 7 are sequential.
Task 8 is last.

import type { IndicatorType } from "./indicators";

// JSON data imports — resolveJsonModule is enabled in tsconfig
import cropZonesData from "../data/crop-zones.json";
import cropAlertRulesData from "../data/crop-alert-rules.json";
import cropGuidanceRulesData from "../data/crop-guidance-rules.json";
import districtCropsData from "../data/district-crops.json";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  major_crops: string[];
  states: string[];
  district_ids: number[];
}

export interface AlertRule {
  crop: string;
  indicator: string;
  threshold: number;
  direction: "above" | "below";
  alert: string;
}

export interface GuidanceRule {
  crop: string;
  conditions: Partial<Record<string, number>>;
  guidance: string[];
}

export interface CropAlert {
  indicator: string;
  score: number;
  alert: string;
}

export interface CropInfo {
  name: string;
  area_1000ha: number;
}

export interface CropAdvisory {
  crop: string;
  zone: string;
  area_1000ha?: number;
  alerts: CropAlert[];
  guidance: string[];
}

// ── Typed data ─────────────────────────────────────────────────────────────

const zones: Zone[] = cropZonesData.zones as Zone[];
const alertRules: AlertRule[] = cropAlertRulesData as AlertRule[];
const guidanceRules: GuidanceRule[] = cropGuidanceRulesData as GuidanceRule[];
const districtCrops: Record<string, CropInfo[]> = districtCropsData as Record<string, CropInfo[]>;

// ── Zone lookup ────────────────────────────────────────────────────────────

/**
 * Find which agro-climatic zone a district belongs to.
 * Returns null if the district is not mapped to any zone.
 */
export function getZoneForDistrict(districtId: number): Zone | null {
  return zones.find((z) => z.district_ids.includes(districtId)) ?? null;
}

// ── Crop lookup ────────────────────────────────────────────────────────────

/**
 * Get the major crops for a district.
 * Uses ICRISAT district-level data (277 districts with area under cultivation).
 * Falls back to agro-climatic zone mapping for districts without ICRISAT data.
 */
export function getCropsForDistrict(districtId: number): {
  crops: string[];
  cropDetails: CropInfo[];
  zoneName: string;
  source: "icrisat" | "zone" | "none";
} {
  const zone = getZoneForDistrict(districtId);
  const zoneName = zone?.name ?? "";

  // Priority 1: ICRISAT district-level data (actual area under cultivation)
  const icrisatCrops = districtCrops[String(districtId)];
  if (icrisatCrops && icrisatCrops.length > 0) {
    return {
      crops: icrisatCrops.map((c) => c.name),
      cropDetails: icrisatCrops,
      zoneName,
      source: "icrisat",
    };
  }

  // Priority 2: Zone-based fallback
  if (zone) {
    return {
      crops: zone.major_crops,
      cropDetails: zone.major_crops.map((name) => ({ name, area_1000ha: 0 })),
      zoneName,
      source: "zone",
    };
  }

  return { crops: [], cropDetails: [], zoneName: "", source: "none" };
}

// ── Alert generation ───────────────────────────────────────────────────────

/**
 * Generate crop-specific alerts from indicator scores.
 * A rule fires when the score meets the threshold in the specified direction.
 */
export function getAlertsForCrop(
  crop: string,
  scores: Partial<Record<IndicatorType, number>>
): CropAlert[] {
  const alerts: CropAlert[] = [];

  for (const rule of alertRules) {
    if (rule.crop !== crop) continue;

    const score = scores[rule.indicator as IndicatorType];
    if (score === undefined) continue;

    const triggered =
      rule.direction === "above"
        ? score >= rule.threshold
        : score <= rule.threshold;

    if (triggered) {
      alerts.push({ indicator: rule.indicator, score, alert: rule.alert });
    }
  }

  return alerts;
}

// ── Guidance generation ────────────────────────────────────────────────────

/**
 * Get agronomic guidance for a crop given the current indicator scores.
 * A guidance rule is active when every condition threshold is met.
 */
export function getGuidanceForCrop(
  crop: string,
  scores: Partial<Record<IndicatorType, number>>
): string[] {
  const guidance: string[] = [];

  for (const rule of guidanceRules) {
    if (rule.crop !== crop) continue;

    // All conditions in the rule must be satisfied (AND logic)
    const allMet = Object.entries(rule.conditions).every(
      ([indicator, threshold]) => {
        if (threshold === undefined) return false;
        const score = scores[indicator as IndicatorType];
        return score !== undefined && score >= threshold;
      }
    );

    if (allMet) {
      guidance.push(...rule.guidance);
    }
  }

  // Deduplicate in case multiple rules add the same tip
  return [...new Set(guidance)];
}

// ── District-level advisory ────────────────────────────────────────────────

/**
 * Generate a full crop advisory for every major crop in a district.
 * Uses ICRISAT district-level data when available (includes area under cultivation),
 * falls back to zone-based crop mapping otherwise.
 */
export function getDistrictCropAdvisory(
  districtId: number,
  scores: Partial<Record<IndicatorType, number>>
): CropAdvisory[] {
  const { cropDetails, zoneName } = getCropsForDistrict(districtId);

  return cropDetails.map((cropInfo) => ({
    crop: cropInfo.name,
    zone: zoneName,
    area_1000ha: cropInfo.area_1000ha > 0 ? cropInfo.area_1000ha : undefined,
    alerts: getAlertsForCrop(cropInfo.name, scores),
    guidance: getGuidanceForCrop(cropInfo.name, scores),
  }));
}

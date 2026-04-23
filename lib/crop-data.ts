import type { IndicatorType } from "./indicators";

// JSON data imports — resolveJsonModule is enabled in tsconfig
import cropZonesData from "../data/crop-zones.json";
import cropAlertRulesData from "../data/crop-alert-rules.json";
import cropGuidanceRulesData from "../data/crop-guidance-rules.json";

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

export interface CropAdvisory {
  crop: string;
  zone: string;
  alerts: CropAlert[];
  guidance: string[];
}

// ── Typed data ─────────────────────────────────────────────────────────────

const zones: Zone[] = cropZonesData.zones as Zone[];
const alertRules: AlertRule[] = cropAlertRulesData as AlertRule[];
const guidanceRules: GuidanceRule[] = cropGuidanceRulesData as GuidanceRule[];

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
 * Get the major crops for a district, based on its agro-climatic zone.
 * Returns an empty crops array and an empty zoneName if the district is unmapped.
 */
export function getCropsForDistrict(districtId: number): {
  crops: string[];
  zoneName: string;
} {
  const zone = getZoneForDistrict(districtId);
  if (!zone) return { crops: [], zoneName: "" };
  return { crops: zone.major_crops, zoneName: zone.name };
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
 * Combines zone lookup, alert generation, and guidance generation.
 */
export function getDistrictCropAdvisory(
  districtId: number,
  scores: Partial<Record<IndicatorType, number>>
): CropAdvisory[] {
  const { crops, zoneName } = getCropsForDistrict(districtId);

  return crops.map((crop) => ({
    crop,
    zone: zoneName,
    alerts: getAlertsForCrop(crop, scores),
    guidance: getGuidanceForCrop(crop, scores),
  }));
}

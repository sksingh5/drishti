import { IndicatorType } from "./indicators";

export const DEFAULT_WEIGHTS: Record<IndicatorType, number> = {
  rainfall_anomaly: 0.2,
  drought_index: 0.2,
  vegetation_health: 0.15,
  heat_stress: 0.15,
  flood_risk: 0.15,
  soil_moisture: 0.15,
};

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
  const otherKeys = (Object.keys(result) as IndicatorType[]).filter(k => k !== changedKey);
  const remaining = 1 - newValue;
  const otherSum = otherKeys.reduce((sum, k) => sum + weights[k], 0);
  if (otherSum === 0) {
    const equal = remaining / otherKeys.length;
    otherKeys.forEach(k => (result[k] = equal));
  } else {
    otherKeys.forEach(k => { result[k] = (weights[k] / otherSum) * remaining; });
  }
  return result;
}

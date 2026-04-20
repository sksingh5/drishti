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

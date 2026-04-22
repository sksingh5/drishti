import type { IndicatorType } from "./indicators";
export type { IndicatorType } from "./indicators";

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

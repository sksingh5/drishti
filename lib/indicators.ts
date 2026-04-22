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
    explainer: "Measures deviation from 30-year historical average rainfall. Higher score means greater anomaly (deficit or excess), increasing risk to agriculture and water resources.",
    methodology: "Percentile ranking of absolute deviation from climatological mean. IMD 0.25° gridded daily rainfall aggregated to monthly district-level totals via zonal statistics.",
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
    explainer: "Mean daily maximum temperature scored against historical distribution. Higher scores indicate extreme heat conditions affecting public health and crop yields.",
    methodology: "IMD gridded daily Tmax, monthly mean computed, percentile-scored against all-district distribution for the month.",
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
    explainer: "Standardized Precipitation Index (SPI) computed from gamma-fitted rainfall distribution. Negative SPI indicates drought conditions. Score maps SPI to 0–100 risk scale.",
    methodology: "Gamma distribution fit to historical same-month rainfall per district. CDF transformed to standard normal deviate. SPI mapped to risk: -3→100, 0→50, +3→0.",
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
    explainer: "Satellite-derived vegetation index (NDVI) from MODIS Terra. Low NDVI means stressed vegetation. Score is inverted: higher score = more vegetation stress = more risk.",
    methodology: "MOD13A3 monthly 1km NDVI, zonal mean per district. Percentile-scored against all-district distribution. Inverted so high score = stressed vegetation.",
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
    explainer: "Composite of rainfall anomaly (40%), soil moisture saturation (40%), and elevation factor (20%). High score means conditions are favorable for flooding.",
    methodology: "Weighted composite: 0.4×rainfall_score + 0.4×(100−soil_moisture_score) + 0.2×elevation_score. Elevation currently uses placeholder value of 50.",
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
    explainer: "Volumetric soil water content from ERA5-Land reanalysis. Score is inverted: low moisture = high drought risk. High moisture contributes to flood risk via the composite indicator.",
    methodology: "ERA5-Land monthly swvl1 (layer 1 soil moisture), zonal mean per district. Percentile-scored then inverted: low moisture → high risk score.",
  },
};

export const INDICATOR_LIST = Object.values(INDICATORS);

export const ALL_INDICATOR_KEYS: IndicatorType[] = [
  "rainfall_anomaly", "heat_stress", "drought_index",
  "vegetation_health", "flood_risk", "soil_moisture",
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

export const RISK_HEX_COLORS: Record<RiskLevel, string> = {
  critical: "#DC2626",
  high: "#EA580C",
  moderate: "#D97706",
  low: "#16A34A",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  moderate: "MODERATE",
  low: "LOW",
};

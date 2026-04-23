export type IndicatorType =
  | "rainfall_anomaly"
  | "drought_index"
  | "vegetation_health"
  | "heat_stress"
  | "flood_risk"
  | "soil_moisture"
  | "vulnerability";

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
    explainer: "Tracks whether your district is getting unusually high or low rainfall compared to what's normal. A high score means rainfall is far from normal — either too much (flood risk) or too little (drought risk). This directly affects crop health, water availability, and farming decisions.",
    methodology: "IMD 0.25° gridded daily rainfall aggregated to monthly district-level totals via zonal statistics. Per-district monthly baseline computed from 2019-2023 means. Anomaly = |current - baseline_mean| / baseline_mean, percentile-ranked across all districts.",
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
    explainer: "Measures how extreme daily temperatures are in your district. A high score means dangerously hot conditions that can harm crops, reduce worker productivity, and increase health risks — especially for outdoor laborers and the elderly.",
    methodology: "IMD gridded daily Tmax, monthly mean computed, percentile-scored against all-district distribution for the month.",
  },
  drought_index: {
    key: "drought_index",
    label: "Drought Index",
    shortLabel: "Drought",
    color: "var(--dicra-ind-drought)",
    source: "Computed SPI / IMD",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer: "Indicates how dry your district has been over the past 3 months compared to the rest of India. A high score signals prolonged rainfall deficit — meaning wells may run low, crops face water stress, and irrigation demand increases.",
    methodology: "3-month accumulated rainfall from IMD, percentile-ranked across all districts. Inverted scoring: lowest rainfall districts score highest. Upgrade path: gamma distribution SPI-3 requires 10+ years of same-month history per district (WMO guideline).",
  },
  vegetation_health: {
    key: "vegetation_health",
    label: "Vegetation Health",
    shortLabel: "Vegetation",
    color: "var(--dicra-ind-vegetation)",
    source: "MODIS MOD13A3",
    resolution: "1km",
    frequency: "Monthly",
    reliability: "high",
    explainer: "Shows how green and healthy the vegetation in your district is, measured by satellites. A high score means vegetation is stressed or dying — an early warning sign of crop failure, overgrazing, or the effects of drought and heat.",
    methodology: "MOD13A3 monthly 1km NDVI via Google Earth Engine. Scaled by 0.0001, aggregated to district-level zonal means using FAO GAUL boundaries. Inverted percentile scoring: low NDVI = high risk.",
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
    explainer: "Estimates your district's exposure to flooding based on recent heavy rainfall and soil saturation. A high score means the ground is already wet and more rain could cause waterlogging, crop damage, or displacement.",
    methodology: "Weighted composite: 0.4 × rainfall_score + 0.4 × (100 − soil_moisture_score) + 0.2 × elevation_score. Elevation currently uses a placeholder value of 50 (neutral). Real elevation data from SRTM DEM will replace this in a future update.",
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
    explainer: "Measures how much water is in the topsoil across your district. A high score means the soil is unusually dry — bad news for crops that depend on soil moisture, and an early indicator of drought conditions.",
    methodology: "ERA5-Land monthly averaged volumetric soil water layer 1 (swvl1) from Copernicus CDS. Zonal statistics per district. Inverted percentile scoring: low moisture = high risk.",
  },
  vulnerability: {
    key: "vulnerability",
    label: "Vulnerability Index",
    shortLabel: "Vulnerability",
    color: "#E11D48",
    source: "Computed",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer: "A combined measure of how exposed your district is to multiple climate stresses at once. A high score means both rainfall patterns and vegetation health are abnormal — districts with high vulnerability need the most urgent attention.",
    methodology: "Vulnerability = mean(rainfall_anomaly_score, vegetation_health_score). Captures NDVI-rainfall divergence — districts with both high rainfall anomaly and vegetation stress are flagged. Scale: 0-100 (mapped to 1-10 for display).",
  },
};

export const INDICATOR_LIST = Object.values(INDICATORS);

export const ALL_INDICATOR_KEYS: IndicatorType[] = [
  "rainfall_anomaly", "heat_stress", "drought_index",
  "vegetation_health", "flood_risk", "soil_moisture",
  "vulnerability",
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

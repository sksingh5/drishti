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
    explainer: "Measures how current monthly rainfall deviates from the 5-year climatological mean (2019-2023) for each district. Higher score indicates greater anomaly — both excess and deficit increase risk. WMO recommends 30-year normals; our 5-year baseline is an interim measure.",
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
    explainer: "Mean daily maximum temperature scored against historical distribution. Higher scores indicate extreme heat conditions affecting public health and crop yields.",
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
    explainer: "Drought risk derived from rainfall deficit analysis. Currently uses cross-district percentile ranking of 3-month accumulated rainfall (low rainfall = high drought risk). Will upgrade to full SPI-3 (gamma-fitted) when 10+ years of monthly data are available.",
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
    explainer: "Satellite-derived NDVI from MODIS MOD13A3 at 1km resolution. Low NDVI indicates vegetation stress — a leading indicator of crop failure, drought impact, or land degradation.",
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
    explainer: "Composite of rainfall anomaly (40%) and soil moisture saturation (40%). An elevation factor (20%) is included but currently uses a neutral placeholder — DEM integration is pending. Actual flood risk may vary significantly with topography.",
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
    explainer: "Volumetric soil water content from ERA5-Land reanalysis at 0.1° resolution. Low soil moisture indicates drought stress for agriculture and increased wildfire risk.",
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
    explainer: "Composite vulnerability score combining rainfall anomaly and vegetation health divergence. Districts where climate stress is high but vegetation is also stressed indicate systemic agricultural vulnerability.",
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

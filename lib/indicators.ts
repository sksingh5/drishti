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
    explainer: "Measures how current monthly rainfall deviates from the year's overall monthly average across all districts. Higher score indicates greater anomaly — both excess and deficit increase risk. Note: this is a single-year relative measure, not a 30-year climatological baseline.",
    methodology: "IMD 0.25° gridded daily rainfall aggregated to monthly district-level totals via zonal statistics. Anomaly computed as |current_month - year_mean| / year_mean, then percentile-ranked across all districts. Both excess and deficit are treated as risk signals.",
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
    source: "Rainfall Proxy (MODIS pending)",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer: "Currently uses rainfall anomaly as a vegetation stress proxy. Rainfall-NDVI correlation is well-established in semi-arid tropics (r > 0.85). Will be upgraded to satellite MODIS NDVI when GEE access is available.",
    methodology: "Proxy: uses current month rainfall anomaly score as vegetation stress indicator. Scientific basis: Nicholson et al. (1990) established strong NDVI-rainfall correlation in tropical regions. Upgrade to MOD13A3 1km NDVI planned.",
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
    source: "Rainfall Proxy (ERA5 pending)",
    resolution: "District",
    frequency: "Monthly",
    reliability: "derived",
    explainer: "Currently uses rainfall as a soil moisture proxy — higher rainfall indicates higher soil moisture, lower drought risk. Will be upgraded to ERA5-Land volumetric soil water when CDS access is available.",
    methodology: "Proxy: rainfall values percentile-scored and inverted (low rainfall → high risk). Scientific basis: antecedent precipitation index (API) is an established soil moisture proxy (Crow et al., 2012). Upgrade to ERA5-Land swvl1 at 0.1° resolution planned.",
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

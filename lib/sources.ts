import type { IndicatorType } from "./indicators";

export type ReliabilityLevel = "high" | "moderate" | "derived";

export interface DataSourceMeta {
  key: string;
  name: string;
  shortName: string;
  resolution: string;
  frequency: string;
  coverage: string;
  reliability: ReliabilityLevel;
  indicators: IndicatorType[];
  description: string;
}

export const DATA_SOURCES: Record<string, DataSourceMeta> = {
  imd_rainfall: {
    key: "imd_rainfall",
    name: "IMD Pune Gridded Rainfall",
    shortName: "IMD Rainfall",
    resolution: "0.25° lat/lon",
    frequency: "Monthly",
    coverage: "Since 1901",
    reliability: "high",
    indicators: ["rainfall_anomaly"],
    description: "India Meteorological Department gridded daily rainfall dataset at 0.25° resolution, aggregated to monthly totals.",
  },
  imd_temperature: {
    key: "imd_temperature",
    name: "IMD Pune Gridded Temperature",
    shortName: "IMD Temperature",
    resolution: "1° lat/lon",
    frequency: "Monthly",
    coverage: "Since 1951",
    reliability: "high",
    indicators: ["heat_stress"],
    description: "IMD gridded daily maximum temperature dataset at 1° resolution.",
  },
  era5_land: {
    key: "era5_land",
    name: "Copernicus ERA5-Land Reanalysis",
    shortName: "ERA5 Soil Moisture",
    resolution: "0.1° lat/lon",
    frequency: "Monthly reanalysis",
    coverage: "Since 1950",
    reliability: "high",
    indicators: ["soil_moisture"],
    description: "ECMWF ERA5-Land monthly volumetric soil water content (layer 1) at 0.1° resolution.",
  },
  modis_ndvi: {
    key: "modis_ndvi",
    name: "MODIS NDVI (Terra MOD13A3)",
    shortName: "MODIS NDVI",
    resolution: "1 km",
    frequency: "Monthly (16-day composite)",
    coverage: "Since 2000",
    reliability: "moderate",
    indicators: ["vegetation_health"],
    description: "NASA MODIS Terra monthly 1km NDVI product, zonal mean per district.",
  },
  computed_spi: {
    key: "computed_spi",
    name: "Standardized Precipitation Index",
    shortName: "SPI Drought",
    resolution: "District-level",
    frequency: "Monthly",
    coverage: "Depends on rainfall history",
    reliability: "derived",
    indicators: ["drought_index"],
    description: "SPI computed from gamma-fitted historical rainfall per district.",
  },
  computed_flood: {
    key: "computed_flood",
    name: "Composite Flood Risk Score",
    shortName: "Flood Composite",
    resolution: "District-level",
    frequency: "Monthly",
    coverage: "Depends on inputs",
    reliability: "derived",
    indicators: ["flood_risk"],
    description: "Weighted composite of rainfall, soil moisture, and elevation factors.",
  },
};

export const SOURCE_LIST = Object.values(DATA_SOURCES);

export const RELIABILITY_STYLES: Record<ReliabilityLevel, { label: string; bg: string; text: string }> = {
  high: { label: "HIGH RELIABILITY", bg: "var(--dicra-risk-low-bg)", text: "var(--dicra-risk-low)" },
  moderate: { label: "MODERATE", bg: "var(--dicra-risk-moderate-bg)", text: "var(--dicra-risk-moderate)" },
  derived: { label: "DERIVED", bg: "var(--dicra-surface-muted)", text: "var(--dicra-text-muted)" },
};

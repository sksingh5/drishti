"use client";

import { X, MapPin, Loader2 } from "lucide-react";

interface PointIndicators {
  ndvi: number | null;
  ndvi_date: string | null;
  land_surface_temp: number | null;
  soil_moisture: number | null;
  precipitation: number | null;
  evi: number | null;
}

interface PointQueryResult {
  lat: number;
  lon: number;
  timestamp: string;
  indicators: PointIndicators;
}

interface PointQueryCardProps {
  result: PointQueryResult | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

const INDICATORS: {
  key: keyof PointIndicators;
  label: string;
  unit: string;
  format: (v: number) => string;
  color: string;
  interpret: (v: number) => string;
}[] = [
  {
    key: "ndvi",
    label: "Vegetation (NDVI)",
    unit: "",
    format: (v) => v.toFixed(3),
    color: "var(--dicra-ind-vegetation)",
    interpret: (v) =>
      v > 0.6 ? "Healthy vegetation" : v > 0.3 ? "Moderate vegetation" : v > 0.1 ? "Sparse vegetation" : "Barren / water",
  },
  {
    key: "evi",
    label: "Enhanced Vegetation (EVI)",
    unit: "",
    format: (v) => v.toFixed(3),
    color: "#22C55E",
    interpret: (v) =>
      v > 0.4 ? "Dense canopy" : v > 0.2 ? "Moderate canopy" : "Low canopy cover",
  },
  {
    key: "land_surface_temp",
    label: "Land Surface Temp",
    unit: "°C",
    format: (v) => v.toFixed(1),
    color: "var(--dicra-ind-heat)",
    interpret: (v) =>
      v > 45 ? "Extreme heat" : v > 35 ? "High heat stress" : v > 25 ? "Warm" : "Cool",
  },
  {
    key: "soil_moisture",
    label: "Soil Moisture",
    unit: " m³/m³",
    format: (v) => v.toFixed(3),
    color: "var(--dicra-ind-moisture)",
    interpret: (v) =>
      v > 0.35 ? "Saturated" : v > 0.2 ? "Adequate moisture" : v > 0.1 ? "Dry" : "Very dry",
  },
  {
    key: "precipitation",
    label: "Recent Rainfall",
    unit: " mm",
    format: (v) => v.toFixed(1),
    color: "var(--dicra-ind-rainfall)",
    interpret: (v) =>
      v > 200 ? "Heavy rainfall" : v > 50 ? "Moderate rainfall" : v > 10 ? "Light rainfall" : "Minimal rain",
  },
];

export function PointQueryCard({ result, loading, error, onClose }: PointQueryCardProps) {
  return (
    <div
      className="absolute top-4 right-4 z-20 w-[300px] rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] shadow-lg overflow-hidden"
      style={{ background: "var(--dicra-surface)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--dicra-border)]"
           style={{ background: "var(--dicra-surface-muted)" }}>
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: "var(--dicra-accent)" }} />
          <span className="text-[12px] font-bold uppercase tracking-[0.5px]"
                style={{ color: "var(--dicra-text-secondary)" }}>
            Point Query
          </span>
        </div>
        <button onClick={onClose} className="text-[var(--dicra-text-muted)] hover:text-[var(--dicra-text-primary)] transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4">
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--dicra-accent)" }} />
            <span className="text-[12px]" style={{ color: "var(--dicra-text-muted)" }}>
              Querying Earth Engine...
            </span>
          </div>
        )}

        {error && (
          <div className="text-[12px] py-4 text-center" style={{ color: "var(--dicra-risk-critical)" }}>
            {error}
          </div>
        )}

        {result && !loading && (
          <>
            <div className="text-[11px] mb-3" style={{ color: "var(--dicra-text-muted)" }}>
              {result.lat.toFixed(4)}°N, {result.lon.toFixed(4)}°E
              {result.indicators.ndvi_date && (
                <span className="ml-2">· Data: {result.indicators.ndvi_date}</span>
              )}
            </div>

            <div className="space-y-2.5">
              {INDICATORS.map((ind) => {
                const value = result.indicators[ind.key];
                if (ind.key === "ndvi_date") return null;
                const numValue = typeof value === "number" ? value : null;
                return (
                  <div key={ind.key}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
                        {ind.label}
                      </span>
                      <span className="text-[13px] font-bold" style={{ color: ind.color }}>
                        {numValue != null ? `${ind.format(numValue)}${ind.unit}` : "—"}
                      </span>
                    </div>
                    {numValue != null && (
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--dicra-text-faint)" }}>
                        {ind.interpret(numValue)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

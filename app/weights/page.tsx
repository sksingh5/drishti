"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { SourceFooter } from "@/components/source-footer";
import { useWeights } from "@/components/weight-provider";
import { WeightProfile, IndicatorType, INDICATOR_LABELS } from "@/lib/types";
import { INDICATORS } from "@/lib/indicators";

const ALL_INDICATORS: IndicatorType[] = ["rainfall_anomaly", "drought_index", "vegetation_health", "heat_stress", "flood_risk", "soil_moisture"];

export default function WeightsPage() {
  const { weights, setWeight, resetToDefaults, applyPreset } = useWeights();
  const [presets, setPresets] = useState<WeightProfile[]>([]);
  useEffect(() => { fetch("/api/weight-presets").then(r => r.json()).then(setPresets); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" style={{ background: "var(--dicra-bg)" }}>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--dicra-text-primary)" }}>Weight Configuration</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Indicator weights with inline explainers */}
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-5">
          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--dicra-text-primary)" }}>Indicator Weights</h2>
          <div className="space-y-6">
            {ALL_INDICATORS.map(type => {
              const pct = Math.round(weights[type] * 100);
              const meta = INDICATORS[type];
              return (
                <div key={type}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium" style={{ color: "var(--dicra-text-secondary)" }}>{INDICATOR_LABELS[type]}</label>
                    <span className="text-sm font-bold" style={{ color: "var(--dicra-text-primary)" }}>{pct}%</span>
                  </div>
                  <Slider value={[pct]} min={0} max={60} step={1} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; setWeight(type, v / 100); }} />
                  {meta && (
                    <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--dicra-text-faint)" }}>
                      {meta.explainer}
                    </p>
                  )}
                </div>
              );
            })}
            <p className="text-xs" style={{ color: "var(--dicra-text-muted)" }}>
              Total: {Math.round(Object.values(weights).reduce((s, w) => s + w, 0) * 100)}% — adjusting one slider auto-rebalances the others.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={resetToDefaults}
              style={{ borderColor: "var(--dicra-border)", color: "var(--dicra-text-secondary)" }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>

        {/* Presets as visual cards */}
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-5">
          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--dicra-text-primary)" }}>Presets</h2>
          <div className="space-y-3">
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.weights)}
                className="w-full text-left rounded-[var(--dicra-radius-md)] border border-[var(--dicra-border)] p-4 transition-colors hover:border-[var(--dicra-brand)]"
                style={{ background: "var(--dicra-surface-muted)" }}
              >
                <div className="font-semibold text-sm" style={{ color: "var(--dicra-text-primary)" }}>{preset.name}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(preset.weights).map(([key, val]) => {
                    const w = val as number;
                    if (w <= 0) return null;
                    return (
                      <span
                        key={key}
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-[4px]"
                        style={{ background: "var(--dicra-border-subtle)", color: "var(--dicra-text-muted)" }}
                      >
                        {INDICATORS[key as IndicatorType]?.shortLabel ?? key}: {Math.round(w * 100)}%
                      </span>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <SourceFooter />
    </div>
  );
}

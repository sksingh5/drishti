"use client";
import { Slider } from "@/components/ui/slider";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";
import { useWeights } from "@/components/weight-provider";

const ALL_INDICATORS: IndicatorType[] = ["rainfall_anomaly", "drought_index", "vegetation_health", "heat_stress", "flood_risk", "soil_moisture"];

export function WeightSliders() {
  const { weights, setWeight } = useWeights();
  return (
    <div className="space-y-6">
      {ALL_INDICATORS.map(type => {
        const pct = Math.round(weights[type] * 100);
        return (
          <div key={type}>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-700">{INDICATOR_LABELS[type]}</label>
              <span className="text-sm font-bold text-neutral-900">{pct}%</span>
            </div>
            <Slider value={[pct]} min={0} max={60} step={1} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; setWeight(type, v / 100); }} />
          </div>
        );
      })}
      <p className="text-xs text-neutral-400">
        Total: {Math.round(Object.values(weights).reduce((s, w) => s + w, 0) * 100)}% — adjusting one slider auto-rebalances the others.
      </p>
    </div>
  );
}

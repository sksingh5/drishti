"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorType, INDICATOR_LABELS, INDICATOR_COLORS, classifyRisk, RISK_COLORS } from "@/lib/types";

interface IndicatorGaugeProps { type: IndicatorType; score: number | null; value?: number | null; }

export function IndicatorGauge({ type, score, value }: IndicatorGaugeProps) {
  const label = INDICATOR_LABELS[type];
  const color = INDICATOR_COLORS[type];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {score !== null && score !== undefined ? (
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            <span className="mb-1 text-sm text-neutral-500">/100</span>
            <span className="mb-1 ml-auto rounded px-2 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: RISK_COLORS[classifyRisk(score)] }}>
              {classifyRisk(score)}
            </span>
          </div>
        ) : (<span className="text-sm text-neutral-400">No data</span>)}
        {value !== null && value !== undefined && (
          <p className="mt-1 text-xs text-neutral-400">Raw value: {typeof value === "number" ? value.toFixed(2) : value}</p>
        )}
      </CardContent>
    </Card>
  );
}

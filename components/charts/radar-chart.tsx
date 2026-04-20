"use client";
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";

const ALL_INDICATORS: IndicatorType[] = ["rainfall_anomaly", "drought_index", "vegetation_health", "heat_stress", "flood_risk", "soil_moisture"];

interface RadarChartProps {
  district1: { name: string; scores: Partial<Record<IndicatorType, number>> };
  district2: { name: string; scores: Partial<Record<IndicatorType, number>> };
}

export function ComparisonRadarChart({ district1, district2 }: RadarChartProps) {
  const data = ALL_INDICATORS.map(type => ({
    indicator: INDICATOR_LABELS[type],
    [district1.name]: district1.scores[type] ?? 0,
    [district2.name]: district2.scores[type] ?? 0,
  }));
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name={district1.name} dataKey={district1.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
        <Radar name={district2.name} dataKey={district2.name} stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}

"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndicatorType, INDICATORS } from "@/lib/indicators";

interface TrendChartProps { data: { period_start: string; indicator_type: string; score: number }[]; indicators?: IndicatorType[]; }

export function TrendChart({ data, indicators }: TrendChartProps) {
  const types = indicators || ([...new Set(data.map(d => d.indicator_type))] as IndicatorType[]);
  const pivoted = new Map<string, Record<string, number>>();
  for (const row of data) {
    if (!pivoted.has(row.period_start)) pivoted.set(row.period_start, {});
    pivoted.get(row.period_start)![row.indicator_type] = row.score;
  }
  const chartData = [...pivoted.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([period, scores]) => ({ period: period.slice(0, 7), ...scores }));
  if (chartData.length === 0) return <p className="text-sm text-neutral-400">No historical data</p>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip />
        {types.map(type => (
          <Line key={type} type="monotone" dataKey={type} name={INDICATORS[type].label} stroke={INDICATORS[type].color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

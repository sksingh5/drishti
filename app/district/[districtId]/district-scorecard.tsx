"use client";
import Link from "next/link";
import { IndicatorType, INDICATOR_LABELS } from "@/lib/types";
import { IndicatorGauge } from "@/components/charts/indicator-gauge";
import { TrendChart } from "@/components/charts/trend-chart";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const ALL_INDICATORS: IndicatorType[] = ["rainfall_anomaly", "drought_index", "vegetation_health", "heat_stress", "flood_risk", "soil_moisture"];

export function DistrictScorecard({ detail, history }: { detail: { district: any; latest_scores: any[] }; history: any[] }) {
  const { weights } = useWeights();
  const { district, latest_scores } = detail;

  const indicatorScores: Partial<Record<IndicatorType, number>> = {};
  const indicatorValues: Partial<Record<IndicatorType, number>> = {};
  for (const s of latest_scores) {
    indicatorScores[s.indicator_type as IndicatorType] = s.score;
    indicatorValues[s.indicator_type as IndicatorType] = s.value;
  }

  const compositeScore = computeCompositeScore(indicatorScores, weights);
  const stateName = district.states?.name || "Unknown State";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">India</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href={`/state/${district.state_id}`}>{stateName}</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>{district.name}</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{district.name}</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">Composite Risk:</span>
          <RiskBadge score={compositeScore} />
        </div>
      </div>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {ALL_INDICATORS.map(type => (
          <IndicatorGauge key={type} type={type} score={indicatorScores[type] ?? null} value={indicatorValues[type] ?? null} />
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Historical Trends</CardTitle></CardHeader>
        <CardContent><TrendChart data={history} /></CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader><CardTitle>District Info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-neutral-500">State:</span> {stateName}</div>
          <div><span className="text-neutral-500">LGD Code:</span> {district.lgd_code}</div>
          {district.area_sq_km && <div><span className="text-neutral-500">Area:</span> {district.area_sq_km.toLocaleString()} sq km</div>}
          <div><Link href={`/compare?district1=${district.id}`} className="text-blue-600 hover:underline">Compare with another district</Link></div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndicatorGauge } from "@/components/charts/indicator-gauge";
import { ComparisonRadarChart } from "@/components/charts/radar-chart";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { IndicatorType, DistrictWithScore } from "@/lib/types";

const ALL_INDICATORS: IndicatorType[] = ["rainfall_anomaly", "drought_index", "vegetation_health", "heat_stress", "flood_risk", "soil_moisture"];

export default function ComparePage() {
  const { weights } = useWeights();
  const [states, setStates] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [districts, setDistricts] = useState<DistrictWithScore[]>([]);
  const [district1Id, setDistrict1Id] = useState<string>("");
  const [district2Id, setDistrict2Id] = useState<string>("");

  useEffect(() => { fetch("/api/states").then(r => r.json()).then(setStates); }, []);
  useEffect(() => {
    if (!selectedState) return;
    fetch(`/api/states/${selectedState}/districts`).then(r => r.json()).then(setDistricts);
  }, [selectedState]);

  const d1 = districts.find(d => String(d.id) === district1Id);
  const d2 = districts.find(d => String(d.id) === district2Id);
  const d1Score = d1 ? computeCompositeScore(d1.indicator_scores, weights) : null;
  const d2Score = d2 ? computeCompositeScore(d2.indicator_scores, weights) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Compare Districts</h1>
      <div className="mb-6 flex flex-wrap gap-4">
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select state" /></SelectTrigger>
          <SelectContent>{states.map((s: any) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={district1Id} onValueChange={setDistrict1Id}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="District 1" /></SelectTrigger>
          <SelectContent>{districts.map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={district2Id} onValueChange={setDistrict2Id}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="District 2" /></SelectTrigger>
          <SelectContent>{districts.filter(d => String(d.id) !== district1Id).map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>
      {d1 && d2 && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-6">
            <Card>
              <CardHeader><div className="flex items-center justify-between"><CardTitle>{d1.name}</CardTitle><RiskBadge score={d1Score} /></div></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">{ALL_INDICATORS.map(type => (<IndicatorGauge key={type} type={type} score={d1.indicator_scores[type] ?? null} />))}</CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex items-center justify-between"><CardTitle>{d2.name}</CardTitle><RiskBadge score={d2Score} /></div></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">{ALL_INDICATORS.map(type => (<IndicatorGauge key={type} type={type} score={d2.indicator_scores[type] ?? null} />))}</CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Radar Comparison</CardTitle></CardHeader>
            <CardContent><ComparisonRadarChart district1={{ name: d1.name, scores: d1.indicator_scores }} district2={{ name: d2.name, scores: d2.indicator_scores }} /></CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

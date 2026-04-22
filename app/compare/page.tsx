"use client";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComparisonRadarChart } from "@/components/charts/radar-chart";
import { RiskBadge } from "@/components/risk-badge";
import { IndicatorCard } from "@/components/indicator-card";
import { SourceFooter } from "@/components/source-footer";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { DistrictWithScore } from "@/lib/types";
import { IndicatorType } from "@/lib/indicators";

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
    <div className="mx-auto max-w-7xl px-4 py-6" style={{ background: "var(--dicra-bg)" }}>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--dicra-text-primary)" }}>Compare Districts</h1>

      <div className="mb-6 flex flex-wrap gap-4 rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
        <Select value={selectedState} onValueChange={(v) => setSelectedState(v ?? "")}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select state" /></SelectTrigger>
          <SelectContent>{states.map((s: any) => (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={district1Id} onValueChange={(v) => setDistrict1Id(v ?? "")}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="District 1" /></SelectTrigger>
          <SelectContent>{districts.map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}</SelectContent>
        </Select>
        <Select value={district2Id} onValueChange={(v) => setDistrict2Id(v ?? "")}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="District 2" /></SelectTrigger>
          <SelectContent>{districts.filter(d => String(d.id) !== district1Id).map(d => (<SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>))}</SelectContent>
        </Select>
      </div>

      {d1 && d2 && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* District 1 */}
            <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: "var(--dicra-text-primary)" }}>{d1.name}</h2>
                <RiskBadge score={d1Score} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ALL_INDICATORS.map(type => (
                  <IndicatorCard key={type} indicatorType={type} score={d1.indicator_scores[type] ?? null} showExplainer={false} />
                ))}
              </div>
            </div>

            {/* District 2 */}
            <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: "var(--dicra-text-primary)" }}>{d2.name}</h2>
                <RiskBadge score={d2Score} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ALL_INDICATORS.map(type => (
                  <IndicatorCard key={type} indicatorType={type} score={d2.indicator_scores[type] ?? null} showExplainer={false} />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-5">
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--dicra-text-primary)" }}>Radar Comparison</h2>
            <ComparisonRadarChart district1={{ name: d1.name, scores: d1.indicator_scores }} district2={{ name: d2.name, scores: d2.indicator_scores }} />
          </div>
        </>
      )}

      <SourceFooter />
    </div>
  );
}

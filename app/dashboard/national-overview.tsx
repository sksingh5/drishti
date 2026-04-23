"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { AlertTriangle, TrendingUp, Minus, Check } from "lucide-react";
import { PeriodSelector } from "@/components/period-selector";
import { StateWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { StateRanking } from "@/components/state-ranking";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { StatCard } from "@/components/stat-card";
import { IndicatorCard } from "@/components/indicator-card";
import { RiskDonut } from "@/components/risk-donut";
import { MethodologyBanner } from "@/components/methodology-banner";
import { SourceFooter } from "@/components/source-footer";
import { classifyRisk, ALL_INDICATOR_KEYS } from "@/lib/indicators";
import type { IndicatorType } from "@/lib/indicators";
import type { RiskLevel } from "@/lib/indicators";

export function NationalOverview({ states }: { states: StateWithScore[] }) {
  const router = useRouter();
  const { weights } = useWeights();

  const mapFeatures = states.map((s) => ({
    id: s.id,
    lgd_code: s.lgd_code,
    name: s.name,
    score: computeCompositeScore(s.indicator_scores, weights),
  }));

  // Classify each state by risk level
  const riskCounts: Record<RiskLevel, number> = { critical: 0, high: 0, moderate: 0, low: 0 };
  for (const s of states) {
    const score = computeCompositeScore(s.indicator_scores, weights);
    if (score !== null) {
      riskCounts[classifyRisk(score)]++;
    }
  }
  const totalClassified = riskCounts.critical + riskCounts.high + riskCounts.moderate + riskCounts.low;

  // Compute national average for key indicators
  function avgIndicator(key: IndicatorType): number | null {
    let sum = 0;
    let count = 0;
    for (const s of states) {
      const val = s.indicator_scores[key];
      if (val !== undefined && val !== null) {
        sum += val;
        count++;
      }
    }
    return count > 0 ? Math.round(sum / count) : null;
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1
            className="text-[26px] font-black tracking-[-0.5px] leading-none"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            National Overview
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "var(--dicra-text-muted)" }}>
            Composite risk across {states.length} states &amp; UTs — click any state to see districts
          </p>
        </div>
        <Suspense fallback={
          <span className="text-[10px] font-bold uppercase tracking-[0.8px] px-3 py-1.5 rounded-[var(--dicra-radius-sm)]"
                style={{ background: "var(--dicra-surface-muted)", color: "var(--dicra-text-secondary)", border: "1px solid var(--dicra-border)" }}>
            Latest Period
          </span>
        }>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Stat cards row — States classified by composite risk */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Critical Risk States"
          value={riskCounts.critical}
          accentColor="var(--dicra-risk-critical)"
          iconBg="var(--dicra-risk-critical-bg)"
          icon={<AlertTriangle size={16} style={{ color: "var(--dicra-risk-critical)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="High Risk States"
          value={riskCounts.high}
          accentColor="var(--dicra-risk-high)"
          iconBg="var(--dicra-risk-high-bg)"
          icon={<TrendingUp size={16} style={{ color: "var(--dicra-risk-high)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="Moderate Risk States"
          value={riskCounts.moderate}
          accentColor="var(--dicra-risk-moderate)"
          iconBg="var(--dicra-risk-moderate-bg)"
          icon={<Minus size={16} style={{ color: "var(--dicra-risk-moderate)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="Low Risk States"
          value={riskCounts.low}
          accentColor="var(--dicra-risk-low)"
          iconBg="var(--dicra-risk-low-bg)"
          icon={<Check size={16} style={{ color: "var(--dicra-risk-low)" }} />}
          total={totalClassified}
        />
      </div>

      {/* Content grid: Map + Right panel */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6" style={{ minHeight: 420 }}>
        <div className="flex-1 relative overflow-hidden rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)]" style={{ minHeight: 380 }}>
          <ChoroplethMap
            geojsonUrl="/geo/states.json"
            features={mapFeatures}
            onFeatureClick={(f) => router.push(`/state/${f.id}`)}
            fitBounds={[[68, 6], [98, 37]]}
          />
          <div className="absolute bottom-4 left-4">
            <MapLegend />
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-[320px] lg:flex-shrink-0">
          <RiskDonut counts={riskCounts} total={totalClassified} />
          <div className="flex-1 overflow-auto rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
            <StateRanking states={states} />
          </div>
        </div>
      </div>

      {/* Indicator summary — national averages across all states */}
      <div className="mb-3 mt-2">
        <h2 className="text-[14px] font-bold uppercase tracking-[0.8px]"
            style={{ color: "var(--dicra-text-secondary)" }}>
          National Indicator Averages
        </h2>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--dicra-text-muted)" }}>
          Mean risk score across all {states.length} states — higher score indicates greater risk (0–100 scale)
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {ALL_INDICATOR_KEYS.map((key) => (
          <IndicatorCard key={key} indicatorType={key} score={avgIndicator(key)} showExplainer={false} />
        ))}
      </div>

      {/* Methodology banner */}
      <MethodologyBanner />

      {/* Source footer */}
      <SourceFooter />
    </div>
  );
}

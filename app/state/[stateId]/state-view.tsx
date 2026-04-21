"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, TrendingUp, Minus, Check } from "lucide-react";
import { DistrictWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { StatCard } from "@/components/stat-card";
import { RiskDonut } from "@/components/risk-donut";
import { MethodologyBanner } from "@/components/methodology-banner";
import { SourceFooter } from "@/components/source-footer";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { classifyRisk } from "@/lib/indicators";
import type { RiskLevel } from "@/lib/indicators";

interface Props {
  state: { id: number; lgd_code: number; name: string };
  districts: DistrictWithScore[];
}

export function StateView({ state, districts }: Props) {
  const router = useRouter();
  const { weights } = useWeights();

  const districtsWithComposite = districts
    .map((d) => ({
      ...d,
      composite_score: computeCompositeScore(d.indicator_scores, weights),
    }))
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0));

  const mapFeatures = districtsWithComposite.map((d) => ({
    id: d.id,
    lgd_code: d.lgd_code,
    name: d.name,
    score: d.composite_score,
  }));

  // Classify each district by risk level
  const riskCounts: Record<RiskLevel, number> = { critical: 0, high: 0, moderate: 0, low: 0 };
  for (const d of districtsWithComposite) {
    if (d.composite_score !== null) {
      riskCounts[classifyRisk(d.composite_score)]++;
    }
  }
  const totalClassified = riskCounts.critical + riskCounts.high + riskCounts.moderate + riskCounts.low;

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "India", href: "/" },
          { label: state.name },
        ]}
      />

      {/* Header row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1
            className="text-[26px] font-black tracking-[-0.5px] leading-none"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            {state.name}
          </h1>
          <p className="text-[13px] mt-1.5" style={{ color: "var(--dicra-text-muted)" }}>
            {districts.length} districts
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-[0.8px] px-3 py-1.5 rounded-[var(--dicra-radius-sm)]"
          style={{
            background: "var(--dicra-surface-muted)",
            color: "var(--dicra-text-secondary)",
            border: "1px solid var(--dicra-border)",
          }}
        >
          Latest Period
        </span>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Critical Risk Districts"
          value={riskCounts.critical}
          accentColor="var(--dicra-risk-critical)"
          iconBg="var(--dicra-risk-critical-bg)"
          icon={<AlertTriangle size={16} style={{ color: "var(--dicra-risk-critical)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="High Risk Districts"
          value={riskCounts.high}
          accentColor="var(--dicra-risk-high)"
          iconBg="var(--dicra-risk-high-bg)"
          icon={<TrendingUp size={16} style={{ color: "var(--dicra-risk-high)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="Moderate Risk Districts"
          value={riskCounts.moderate}
          accentColor="var(--dicra-risk-moderate)"
          iconBg="var(--dicra-risk-moderate-bg)"
          icon={<Minus size={16} style={{ color: "var(--dicra-risk-moderate)" }} />}
          total={totalClassified}
        />
        <StatCard
          label="Low Risk Districts"
          value={riskCounts.low}
          accentColor="var(--dicra-risk-low)"
          iconBg="var(--dicra-risk-low-bg)"
          icon={<Check size={16} style={{ color: "var(--dicra-risk-low)" }} />}
          total={totalClassified}
        />
      </div>

      {/* Content grid: Map + Right panel */}
      <div className="flex gap-4 mb-6" style={{ minHeight: 520 }}>
        <div className="flex-1 relative overflow-hidden rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)]">
          <ChoroplethMap
            geojsonUrl="/geo/districts.json"
            features={mapFeatures}
            onFeatureClick={(f) => router.push(`/district/${f.id}`)}
          />
          <div className="absolute bottom-4 left-4">
            <MapLegend />
          </div>
        </div>
        <div className="flex flex-col gap-3" style={{ width: 320, flexShrink: 0 }}>
          <RiskDonut counts={riskCounts} total={totalClassified} />
          <div className="flex-1 overflow-auto rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
            <div className="text-[13px] font-bold mb-3" style={{ color: "var(--dicra-text-primary)" }}>
              District Rankings ({districts.length})
            </div>
            <div className="space-y-0.5">
              {districtsWithComposite.map((d, i) => (
                <Link
                  key={d.id}
                  href={`/district/${d.id}`}
                  className="flex items-center justify-between rounded-[var(--dicra-radius-sm)] px-2.5 py-1.5 text-[12px] no-underline transition-colors hover:bg-[var(--dicra-surface-muted)]"
                >
                  <span>
                    <span className="mr-2 font-mono text-[11px]" style={{ color: "var(--dicra-text-faint)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ color: "var(--dicra-text-primary)" }}>{d.name}</span>
                  </span>
                  <RiskBadge score={d.composite_score} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology banner */}
      <MethodologyBanner />

      {/* Source footer */}
      <SourceFooter />
    </div>
  );
}

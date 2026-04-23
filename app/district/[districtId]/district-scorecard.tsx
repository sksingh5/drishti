"use client";

import { InsightCard } from "@/components/insight-card";
import { ActionPanel } from "@/components/action-panel";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SourceFooter } from "@/components/source-footer";
import { TrendChart } from "@/components/charts/trend-chart";
import { Download } from "lucide-react";
import { exportToCsv } from "@/lib/export-csv";
import { getInsightsForDistrict } from "@/lib/insights";
import { evaluateActionRules } from "@/lib/action-rules";
import { classifyRisk, RISK_COLORS, RISK_BG_COLORS, RISK_LABELS, ALL_INDICATOR_KEYS } from "@/lib/indicators";
import type { IndicatorType } from "@/lib/indicators";
import { SOURCE_LIST, RELIABILITY_STYLES } from "@/lib/sources";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";

export function DistrictScorecard({ detail, history }: { detail: { district: any; latest_scores: any[] }; history: any[] }) {
  const { weights } = useWeights();
  const { district, latest_scores } = detail;

  const indicatorScores: Partial<Record<IndicatorType, number>> = {};
  const indicatorValues: Partial<Record<IndicatorType, number>> = {};
  let latestPeriod: string | null = null;

  for (const s of latest_scores) {
    indicatorScores[s.indicator_type as IndicatorType] = s.score;
    indicatorValues[s.indicator_type as IndicatorType] = s.value;
    if (s.period_start && (!latestPeriod || s.period_start > latestPeriod)) {
      latestPeriod = s.period_start;
    }
  }

  const compositeScore = computeCompositeScore(indicatorScores, weights);
  const risk = compositeScore !== null ? classifyRisk(compositeScore) : null;
  const stateName = district.states?.name || "Unknown State";

  const periodLabel = latestPeriod
    ? new Date(latestPeriod).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={[
        { label: "India", href: "/" },
        { label: stateName, href: `/state/${district.state_id}` },
        { label: district.name },
      ]} />

      {/* Hero Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Left: Name + Composite Score */}
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
             style={{ background: "var(--dicra-surface)" }}>
          <div className="text-[12px] font-semibold uppercase tracking-[0.8px] mb-1"
               style={{ color: "var(--dicra-text-muted)" }}>
            {stateName}
          </div>
          <div className="text-[22px] font-black tracking-[-0.5px] mb-4"
               style={{ color: "var(--dicra-text-primary)" }}>
            {district.name}
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] mb-1"
               style={{ color: "var(--dicra-text-muted)" }}>
            Composite Risk Score
          </div>
          <div className="flex items-end gap-3">
            <span className="leading-none font-black tracking-[-2px]"
                  style={{
                    fontSize: 48,
                    color: risk ? RISK_COLORS[risk] : "var(--dicra-text-primary)",
                  }}>
              {compositeScore ?? "—"}
            </span>
            {risk && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-[6px] mb-1.5"
                    style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}>
                {RISK_LABELS[risk]}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              const rows = ALL_INDICATOR_KEYS.map((type) => ({
                district: district.name,
                state: stateName,
                indicator: type,
                score: indicatorScores[type] ?? "N/A",
                value: indicatorValues[type] ?? "N/A",
                period: periodLabel,
              }));
              exportToCsv(
                `${district.name.replace(/\s+/g, "_")}_climate_risk.csv`,
                rows
              );
            }}
            className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-[var(--dicra-radius-sm)] border border-[var(--dicra-border)] hover:border-[var(--dicra-accent)] transition-colors"
            style={{ color: "var(--dicra-text-secondary)" }}
          >
            <Download size={13} />
            Download CSV
          </button>
        </div>

        {/* Right: Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Area", value: district.area_sq_km ? `${district.area_sq_km.toLocaleString()} km²` : "—" },
            { label: "Period", value: periodLabel },
          ].map((item) => (
            <div key={item.label}
                 className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4 flex flex-col justify-center"
                 style={{ background: "var(--dicra-surface)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.8px] mb-1"
                   style={{ color: "var(--dicra-text-muted)" }}>
                {item.label}
              </div>
              <div className="text-[18px] font-bold tracking-[-0.3px]"
                   style={{ color: "var(--dicra-text-primary)" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions (compound rules) */}
      {(() => {
        const scores: Record<string, number> = {};
        for (const [k, v] of Object.entries(indicatorScores)) {
          if (v !== undefined) scores[k] = v;
        }
        const actions = evaluateActionRules(scores);
        return actions.length > 0 ? (
          <div className="mb-6">
            <ActionPanel actions={actions} />
          </div>
        ) : null;
      })()}

      {/* 6 Indicator Insight Cards — 3x2 Grid */}
      {(() => {
        const scores: Record<string, number> = {};
        const values: Record<string, number> = {};
        for (const [k, v] of Object.entries(indicatorScores)) {
          if (v !== undefined) scores[k] = v;
        }
        for (const [k, v] of Object.entries(indicatorValues)) {
          if (v !== undefined) values[k] = v;
        }
        const insights = getInsightsForDistrict(scores, values);
        const insightMap = new Map(insights.map(i => [i.indicator, i]));

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {ALL_INDICATOR_KEYS.map((type) => (
              <InsightCard
                key={type}
                indicatorType={type}
                score={indicatorScores[type] ?? null}
                value={indicatorValues[type] ?? null}
                insight={insightMap.get(type) || null}
              />
            ))}
          </div>
        );
      })()}

      {/* Two-column: Trends + Data Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Left: Historical Trends */}
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
             style={{ background: "var(--dicra-surface)" }}>
          <div className="text-[12px] font-bold uppercase tracking-[0.8px] mb-3"
               style={{ color: "var(--dicra-text-secondary)" }}>
            Historical Trends
          </div>
          <TrendChart data={history} />
        </div>

        {/* Right: Data Sources & Reliability */}
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
             style={{ background: "var(--dicra-surface)" }}>
          <div className="text-[12px] font-bold uppercase tracking-[0.8px] mb-3"
               style={{ color: "var(--dicra-text-secondary)" }}>
            Data Sources &amp; Reliability
          </div>
          <div className="flex flex-col gap-2">
            {SOURCE_LIST.map((source) => {
              const reliabilityStyle = RELIABILITY_STYLES[source.reliability];
              return (
                <div key={source.key}
                     className="flex items-center gap-2.5 p-2.5 rounded-[var(--dicra-radius-md)] border border-[var(--dicra-border)]"
                     style={{ background: "var(--dicra-surface-muted)" }}>
                  <span className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: "var(--dicra-accent)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold"
                         style={{ color: "var(--dicra-text-secondary)" }}>
                      {source.name}
                    </div>
                    <div className="text-[10px]"
                         style={{ color: "var(--dicra-text-muted)" }}>
                      {source.resolution} &middot; {source.frequency} &middot; {source.coverage}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-[4px] flex-shrink-0"
                        style={{ background: reliabilityStyle.bg, color: reliabilityStyle.text }}>
                    {reliabilityStyle.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Footer */}
      <SourceFooter />
    </div>
  );
}

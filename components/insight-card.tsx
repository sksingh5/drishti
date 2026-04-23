"use client";

import { INDICATORS, classifyRisk, RISK_COLORS, RISK_BG_COLORS, RISK_LABELS } from "@/lib/indicators";
import type { Insight } from "@/lib/insights";

interface InsightCardProps {
  indicatorType: string;
  score: number | null;
  value: number | null;
  insight: Insight | null;
}

const SEVERITY_STYLES = {
  critical: {
    color: "var(--dicra-risk-critical)",
    bg: "var(--dicra-risk-critical-bg)",
    border: "var(--dicra-risk-critical)",
  },
  warning: {
    color: "var(--dicra-risk-high)",
    bg: "var(--dicra-risk-high-bg)",
    border: "var(--dicra-risk-high)",
  },
  info: {
    color: "var(--dicra-text-muted)",
    bg: "var(--dicra-surface-muted)",
    border: "var(--dicra-border)",
  },
} as const;

export function InsightCard({ indicatorType, score, value, insight }: InsightCardProps) {
  const meta = INDICATORS[indicatorType as keyof typeof INDICATORS];
  if (!meta) return null;

  const risk = score !== null ? classifyRisk(score) : null;
  const displayScore = score ?? 0;

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      {/* Header: indicator name + risk badge */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
          {meta.label}
        </span>
        {risk && (
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-[7px] py-[2px] rounded-[5px]"
            style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}
          >
            {RISK_LABELS[risk]}
          </span>
        )}
      </div>

      {/* Score */}
      <div
        className="text-[28px] font-black tracking-[-1px] leading-none"
        style={{ color: meta.color }}
      >
        {score !== null ? score : "\u2014"}
      </div>

      {score !== null && (
        <>
          {/* Progress bar */}
          <div
            className="mt-2 h-1 rounded-full overflow-hidden"
            style={{ background: "var(--dicra-border-subtle)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${displayScore}%`, background: meta.color }}
            />
          </div>

          {/* Raw metric value */}
          {value !== null && insight?.metric && (
            <div className="mt-1.5 text-[11px] font-medium" style={{ color: "var(--dicra-text-secondary)" }}>
              {insight.metric}
            </div>
          )}
        </>
      )}

      {/* Insight section */}
      {insight ? (
        <div className="mt-3">
          {/* Insight bar */}
          <div
            className="rounded-[var(--dicra-radius-sm)] px-3 py-2 text-[11px] leading-relaxed"
            style={{
              background: SEVERITY_STYLES[insight.severity].bg,
              color: SEVERITY_STYLES[insight.severity].color,
              borderLeft: `3px solid ${SEVERITY_STYLES[insight.severity].border}`,
            }}
          >
            {insight.insight}
          </div>

          {/* Action button */}
          <button
            type="button"
            className="mt-2 w-full rounded-[var(--dicra-radius-sm)] border px-3 py-1.5 text-[10px] font-semibold transition-colors hover:opacity-80"
            style={{
              borderColor: SEVERITY_STYLES[insight.severity].color,
              color: SEVERITY_STYLES[insight.severity].color,
              background: "transparent",
            }}
          >
            {insight.action}
          </button>
        </div>
      ) : score !== null ? (
        <div className="mt-3 text-[10px] italic" style={{ color: "var(--dicra-text-faint)" }}>
          No alerts
        </div>
      ) : (
        <div className="mt-2 text-[10px] italic" style={{ color: "var(--dicra-text-faint)" }}>
          Data pending — source not yet connected
        </div>
      )}
    </div>
  );
}

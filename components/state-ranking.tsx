"use client";

import Link from "next/link";
import { StateWithScore } from "@/lib/types";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { classifyRisk, RISK_COLORS } from "@/lib/indicators";

interface StateRankingProps {
  states: StateWithScore[];
  limit?: number;
}

const RANK_BADGE_COLORS: Record<number, string> = {
  1: "var(--dicra-risk-critical)",
  2: "var(--dicra-risk-high)",
  3: "var(--dicra-risk-moderate)",
};

export function StateRanking({ states, limit = 10 }: StateRankingProps) {
  const { weights } = useWeights();

  const ranked = states
    .map((s) => ({
      ...s,
      composite_score: computeCompositeScore(s.indicator_scores, weights),
    }))
    .filter((s) => s.composite_score !== null)
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-[13px] font-bold"
          style={{ color: "var(--dicra-text-primary)" }}
        >
          Most At-Risk
        </h3>
        <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-muted)" }}>
          Top {limit}
        </span>
      </div>

      {ranked.length === 0 ? (
        <p className="text-[12px]" style={{ color: "var(--dicra-text-muted)" }}>
          No data available
        </p>
      ) : (
        <ol className="space-y-1" style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {ranked.map((s, i) => {
            const score = s.composite_score!;
            const risk = classifyRisk(score);
            const riskColor = RISK_COLORS[risk];
            const rankBg = RANK_BADGE_COLORS[i + 1] ?? "var(--dicra-text-faint)";

            return (
              <li key={s.id}>
                <Link
                  href={`/state/${s.id}`}
                  className="flex items-center gap-2.5 rounded-[var(--dicra-radius-md)] px-2 py-[7px] no-underline transition-colors"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--dicra-surface-muted)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Rank badge */}
                  <span
                    className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[5px] text-[10px] font-bold text-white"
                    style={{ background: rankBg }}
                  >
                    {i + 1}
                  </span>

                  {/* State name */}
                  <span
                    className="flex-1 text-[12px] font-medium truncate"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {s.name}
                  </span>

                  {/* Score bar + number */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="h-[4px] rounded-full overflow-hidden"
                      style={{ width: 40, background: "var(--dicra-border-subtle)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, background: riskColor }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-bold tabular-nums"
                      style={{ color: riskColor, minWidth: 24, textAlign: "right" }}
                    >
                      {score}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

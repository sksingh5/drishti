"use client";
import Link from "next/link";
import { StateWithScore } from "@/lib/types";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";

interface StateRankingProps { states: StateWithScore[]; limit?: number; }

export function StateRanking({ states, limit = 10 }: StateRankingProps) {
  const { weights } = useWeights();
  const ranked = states
    .map(s => ({ ...s, composite_score: computeCompositeScore(s.indicator_scores, weights) }))
    .filter(s => s.composite_score !== null)
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, limit);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-neutral-700">Highest Risk States</h3>
      {ranked.length === 0 ? (
        <p className="text-sm text-neutral-400">No data available</p>
      ) : (
        <ol className="space-y-1.5">
          {ranked.map((s, i) => (
            <li key={s.id}>
              <Link href={`/state/${s.id}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100">
                <span><span className="mr-2 text-neutral-400">{i + 1}.</span>{s.name}</span>
                <RiskBadge score={s.composite_score} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

import { INDICATORS, classifyRisk, RISK_BG_COLORS, RISK_COLORS, RISK_LABELS } from "@/lib/indicators";
import type { IndicatorType } from "@/lib/indicators";

interface IndicatorCardProps {
  indicatorType: IndicatorType;
  score: number | null;
  value?: number | null;
  showExplainer?: boolean;
}

export function IndicatorCard({ indicatorType, score, value, showExplainer = true }: IndicatorCardProps) {
  const meta = INDICATORS[indicatorType];
  if (!meta) return null;

  const risk = score !== null ? classifyRisk(score) : null;
  const displayScore = score ?? 0;

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>
          {meta.label}
        </span>
        {risk && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-[7px] py-[2px] rounded-[5px]"
                style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}>
            {RISK_LABELS[risk]}
          </span>
        )}
      </div>

      <div className="text-[28px] font-black tracking-[-1px] leading-none" style={{ color: meta.color }}>
        {score !== null ? score : "\u2014"}
      </div>

      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--dicra-border-subtle)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${displayScore}%`, background: meta.color }} />
      </div>

      <div className="flex items-center gap-1.5 mt-1.5">
        <span className="h-[5px] w-[5px] rounded-full" style={{ background: "var(--dicra-accent)", boxShadow: "0 0 4px rgba(52,211,153,0.3)" }} />
        <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>
          {meta.source} &middot; {meta.frequency} &middot; {meta.resolution}
        </span>
      </div>

      {showExplainer && (
        <div className="mt-2.5 rounded-lg p-2.5 border border-[var(--dicra-border)]" style={{ background: "var(--dicra-surface-muted)" }}>
          <div className="text-[9px] font-bold uppercase tracking-[0.8px] mb-0.5" style={{ color: "var(--dicra-brand)" }}>
            &#8505; What this means
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            {meta.explainer}
          </div>
        </div>
      )}
    </div>
  );
}

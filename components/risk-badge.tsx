import { classifyRisk, RISK_COLORS, RISK_BG_COLORS, RISK_LABELS } from "@/lib/indicators";

export function RiskBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-[5px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide border border-[var(--dicra-border)]"
            style={{ color: "var(--dicra-text-muted)" }}>
        No data
      </span>
    );
  }

  const risk = classifyRisk(score);
  return (
    <span className="inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
          style={{ background: RISK_BG_COLORS[risk], color: RISK_COLORS[risk] }}>
      {score} — {RISK_LABELS[risk]}
    </span>
  );
}

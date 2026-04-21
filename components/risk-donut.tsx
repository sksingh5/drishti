import type { RiskLevel } from "@/lib/indicators";

interface RiskDonutProps {
  counts: Record<RiskLevel, number>;
  total: number;
}

export function RiskDonut({ counts, total }: RiskDonutProps) {
  const segments: { level: RiskLevel; count: number; color: string; label: string }[] = [
    { level: "critical", count: counts.critical, color: "var(--dicra-risk-critical)", label: "Critical" },
    { level: "high", count: counts.high, color: "var(--dicra-risk-high)", label: "High" },
    { level: "moderate", count: counts.moderate, color: "var(--dicra-risk-moderate)", label: "Moderate" },
    { level: "low", count: counts.low, color: "var(--dicra-risk-low)", label: "Low" },
  ];

  let cumulative = 0;
  const stops = segments.map((seg) => {
    const start = cumulative;
    const degrees = total > 0 ? (seg.count / total) * 360 : 0;
    cumulative += degrees;
    return { ...seg, start, end: cumulative };
  });

  const gradient = stops.map((s) => `${s.color} ${s.start}deg ${s.end}deg`).join(", ");

  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      <div className="text-[13px] font-bold mb-3.5" style={{ color: "var(--dicra-text-primary)" }}>
        Risk Distribution
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-[110px] h-[60px] flex-shrink-0">
          <div className="w-[110px] h-[55px] overflow-hidden">
            <div className="w-[110px] h-[110px] rounded-full"
                 style={{ background: total > 0 ? `conic-gradient(${gradient})` : "var(--dicra-border)" }}>
              <div className="absolute top-[18px] left-[18px] w-[74px] h-[74px] rounded-full bg-[var(--dicra-surface)]" />
            </div>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[22px] font-black tracking-[-1px]" style={{ color: "var(--dicra-text-primary)" }}>{total}</div>
            <div className="text-[9px] uppercase tracking-[0.5px]" style={{ color: "var(--dicra-text-muted)" }}>Total</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {segments.map((seg) => (
            <div key={seg.level} className="flex items-center gap-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: seg.color }} />
              <span className="flex-1" style={{ color: "var(--dicra-text-secondary)" }}>{seg.label}</span>
              <span className="font-bold" style={{ color: "var(--dicra-text-primary)" }}>{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

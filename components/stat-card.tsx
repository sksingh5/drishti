interface StatCardProps {
  label: string;
  value: number;
  change?: number;
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  total?: number;
}

export function StatCard({ label, value, change, accentColor, iconBg, icon, total }: StatCardProps) {
  const proportion = total ? (value / total) * 100 : 0;

  return (
    <div className="relative rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      <span className="absolute top-3.5 bottom-3.5 left-0 w-[3px] rounded-r-sm" style={{ background: accentColor }} />
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[var(--dicra-radius-md)] text-sm" style={{ background: iconBg }}>
          {icon}
        </div>
        {change !== undefined && (
          <span className="text-[10px] font-bold px-[7px] py-[3px] rounded-[var(--dicra-radius-sm)]"
                style={{
                  background: change > 0 ? "var(--dicra-risk-critical-bg)" : change < 0 ? "var(--dicra-risk-low-bg)" : "var(--dicra-surface-muted)",
                  color: change > 0 ? "var(--dicra-risk-critical)" : change < 0 ? "var(--dicra-risk-low)" : "var(--dicra-text-muted)",
                }}>
            {change > 0 ? `▲ ${change}` : change < 0 ? `▼ ${Math.abs(change)}` : "— 0"}
          </span>
        )}
      </div>
      <div className="text-[32px] font-black tracking-[-1.5px] leading-none" style={{ color: "var(--dicra-text-primary)" }}>{value}</div>
      <div className="text-[11px] font-medium mt-1" style={{ color: "var(--dicra-text-muted)" }}>{label}</div>
      {total ? (
        <div className="mt-2.5 h-[3px] rounded-full overflow-hidden" style={{ background: "var(--dicra-border-subtle)" }}>
          <div className="h-full rounded-full" style={{ width: `${proportion}%`, background: accentColor }} />
        </div>
      ) : null}
    </div>
  );
}

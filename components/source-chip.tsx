interface SourceChipProps {
  name: string;
  status: "ok" | "stale" | "error" | "pending";
  lastFetched?: string | null;
}

export function SourceChip({ name, status, lastFetched }: SourceChipProps) {
  const dotColor = {
    ok: "var(--dicra-accent)",
    stale: "var(--dicra-risk-moderate)",
    error: "var(--dicra-risk-critical)",
    pending: "var(--dicra-text-faint)",
  }[status];

  const timeAgo = lastFetched ? formatTimeAgo(lastFetched) : "No data";

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[var(--dicra-border)] bg-[var(--dicra-surface)] px-3 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{
        background: dotColor,
        boxShadow: status === "ok" ? "0 0 5px rgba(52,211,153,0.3)" : undefined,
      }} />
      <span className="text-[10px] font-semibold" style={{ color: "var(--dicra-text-secondary)" }}>{name}</span>
      <span className="text-[10px]" style={{ color: "var(--dicra-text-faint)" }}>{timeAgo}</span>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffH / 24);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  return `${diffD}d ago`;
}

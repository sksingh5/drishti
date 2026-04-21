export function MapLegend() {
  const items = [
    { label: "Low", color: "var(--dicra-risk-low)" },
    { label: "Moderate", color: "var(--dicra-risk-moderate)" },
    { label: "High", color: "var(--dicra-risk-high)" },
    { label: "Critical", color: "var(--dicra-risk-critical)" },
  ];

  return (
    <div
      className="flex items-center gap-3 rounded-full px-4 py-2 text-[11px] font-medium"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid var(--dicra-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span style={{ color: "var(--dicra-text-secondary)" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

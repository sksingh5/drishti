import { RISK_COLORS } from "@/lib/types";

export function MapLegend() {
  const items = [
    { label: "Low (0-25)", color: RISK_COLORS.low },
    { label: "Moderate (26-50)", color: RISK_COLORS.moderate },
    { label: "High (51-75)", color: RISK_COLORS.high },
    { label: "Critical (76-100)", color: RISK_COLORS.critical },
  ];
  return (
    <div className="flex items-center gap-4 rounded-md bg-white/90 px-3 py-2 text-xs shadow-sm">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-neutral-600">{label}</span>
        </div>
      ))}
    </div>
  );
}

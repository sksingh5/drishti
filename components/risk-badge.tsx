import { classifyRisk, RISK_COLORS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function RiskBadge({ score }: { score: number | null }) {
  if (score === null) return <Badge variant="outline">No data</Badge>;
  const category = classifyRisk(score);
  const color = RISK_COLORS[category];
  return (
    <Badge style={{ backgroundColor: color, color: category === "low" ? "#000" : "#fff" }}>
      {score} — {category}
    </Badge>
  );
}

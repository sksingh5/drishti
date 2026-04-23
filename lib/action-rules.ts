export interface ActionRule {
  id: string;
  name: string;
  conditions: { indicator: string; operator: ">" | "<"; threshold: number }[];
  action: string;
  severity: "critical" | "warning";
  audience: "banker" | "planner" | "both";
}

export interface TriggeredAction {
  id: string;
  name: string;
  action: string;
  severity: "critical" | "warning";
  audience: "banker" | "planner" | "both";
  triggeredIndicators: string[];
}

const ACTION_RULES: ActionRule[] = [
  {
    id: "drought-soil",
    name: "Drought + Low Soil Moisture",
    conditions: [
      { indicator: "drought_index", operator: ">", threshold: 60 },
      { indicator: "soil_moisture", operator: ">", threshold: 60 },
    ],
    action: "Recommend loan restructuring for rainfed clusters",
    severity: "critical",
    audience: "banker",
  },
  {
    id: "flood-rainfall",
    name: "Flood Risk + Extreme Rainfall",
    conditions: [
      { indicator: "flood_risk", operator: ">", threshold: 60 },
      { indicator: "rainfall_anomaly", operator: ">", threshold: 60 },
    ],
    action: "Activate crop insurance fast-track",
    severity: "critical",
    audience: "banker",
  },
  {
    id: "heat-vegetation",
    name: "Heat Stress + Vegetation Stress",
    conditions: [
      { indicator: "heat_stress", operator: ">", threshold: 50 },
      { indicator: "vegetation_health", operator: ">", threshold: 50 },
    ],
    action: "Issue heat advisory for outdoor labor",
    severity: "warning",
    audience: "planner",
  },
  {
    id: "drought-vegetation",
    name: "Drought + Vegetation Stress",
    conditions: [
      { indicator: "drought_index", operator: ">", threshold: 50 },
      { indicator: "vegetation_health", operator: ">", threshold: 50 },
    ],
    action: "Deploy emergency irrigation advisory",
    severity: "critical",
    audience: "planner",
  },
  {
    id: "all-moderate",
    name: "All Indicators Moderate+",
    conditions: [
      { indicator: "rainfall_anomaly", operator: ">", threshold: 40 },
      { indicator: "heat_stress", operator: ">", threshold: 40 },
      { indicator: "drought_index", operator: ">", threshold: 40 },
      { indicator: "vegetation_health", operator: ">", threshold: 40 },
      { indicator: "flood_risk", operator: ">", threshold: 40 },
      { indicator: "soil_moisture", operator: ">", threshold: 40 },
    ],
    action: "Flag district for priority NABARD review",
    severity: "warning",
    audience: "both",
  },
  {
    id: "flood-saturation",
    name: "Flood + Soil Saturation",
    conditions: [
      { indicator: "flood_risk", operator: ">", threshold: 65 },
      { indicator: "soil_moisture", operator: "<", threshold: 25 },
    ],
    action: "Pre-position disaster relief funds",
    severity: "critical",
    audience: "planner",
  },
  {
    id: "heat-drought-compound",
    name: "Heat + Drought Compound Stress",
    conditions: [
      { indicator: "heat_stress", operator: ">", threshold: 65 },
      { indicator: "drought_index", operator: ">", threshold: 65 },
    ],
    action: "Escalate to state-level drought monitoring cell",
    severity: "critical",
    audience: "both",
  },
  {
    id: "rainfall-flood-vegetation",
    name: "Triple Risk: Rainfall + Flood + Vegetation",
    conditions: [
      { indicator: "rainfall_anomaly", operator: ">", threshold: 55 },
      { indicator: "flood_risk", operator: ">", threshold: 55 },
      { indicator: "vegetation_health", operator: ">", threshold: 55 },
    ],
    action: "Initiate multi-hazard damage assessment",
    severity: "critical",
    audience: "both",
  },
];

function evaluateCondition(
  score: number | undefined,
  operator: ">" | "<",
  threshold: number,
): boolean {
  if (score === undefined || score === null) return false;
  return operator === ">" ? score > threshold : score < threshold;
}

/**
 * Evaluate all compound action rules against a district's scores.
 * Returns triggered actions sorted by severity (critical first).
 */
export function evaluateActionRules(
  scores: Record<string, number>,
): TriggeredAction[] {
  const triggered: TriggeredAction[] = [];

  for (const rule of ACTION_RULES) {
    const allMet = rule.conditions.every((c) =>
      evaluateCondition(scores[c.indicator], c.operator, c.threshold),
    );

    if (allMet) {
      triggered.push({
        id: rule.id,
        name: rule.name,
        action: rule.action,
        severity: rule.severity,
        audience: rule.audience,
        triggeredIndicators: rule.conditions.map((c) => c.indicator),
      });
    }
  }

  return triggered.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "critical" ? -1 : 1;
  });
}

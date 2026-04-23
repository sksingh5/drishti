export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
  indicator: string;
  severity: InsightSeverity;
  insight: string;
  action: string;
  metric?: string;
}

interface InsightRule {
  indicator: string;
  condition: (score: number) => boolean;
  severity: InsightSeverity;
  insight: string;
  action: string;
  metricFn?: (value: number) => string;
}

const INSIGHT_RULES: InsightRule[] = [
  // rainfall_anomaly
  {
    indicator: "rainfall_anomaly",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "Extreme rainfall deviation — flood/drought risk elevated",
    action: "Activate crop insurance fast-track processing",
    metricFn: (v) => `${Math.round(v)}mm monthly rainfall`,
  },
  {
    indicator: "rainfall_anomaly",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Significant rainfall anomaly detected",
    action: "Review agricultural loan portfolios in affected clusters",
    metricFn: (v) => `${Math.round(v)}mm monthly rainfall`,
  },
  {
    indicator: "rainfall_anomaly",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Moderate rainfall variation from baseline",
    action: "Monitor rainfall trends for next 30 days",
    metricFn: (v) => `${Math.round(v)}mm monthly rainfall`,
  },

  // heat_stress
  {
    indicator: "heat_stress",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "Severe heat stress — labor productivity may drop 15-20%",
    action: "Trigger MGNREGA work-hour adjustments",
    metricFn: (v) => `${v.toFixed(1)}°C mean max temperature`,
  },
  {
    indicator: "heat_stress",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Elevated heat conditions affecting crop yields",
    action: "Issue heat advisory for outdoor labor programs",
    metricFn: (v) => `${v.toFixed(1)}°C mean max temperature`,
  },
  {
    indicator: "heat_stress",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Above-average temperatures recorded",
    action: "Track heat index for vulnerable populations",
    metricFn: (v) => `${v.toFixed(1)}°C mean max temperature`,
  },

  // drought_index
  {
    indicator: "drought_index",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "Severe drought conditions — SPI indicates prolonged deficit",
    action: "Recommend loan restructuring for rainfed agriculture clusters",
    metricFn: (v) => `SPI: ${v.toFixed(2)}`,
  },
  {
    indicator: "drought_index",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Moderate drought stress developing",
    action: "Assess irrigation infrastructure adequacy",
    metricFn: (v) => `SPI: ${v.toFixed(2)}`,
  },
  {
    indicator: "drought_index",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Early signs of rainfall deficit",
    action: "Pre-position drought relief resources",
    metricFn: (v) => `SPI: ${v.toFixed(2)}`,
  },

  // vegetation_health
  {
    indicator: "vegetation_health",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "Severe vegetation stress — crop failure risk high",
    action: "Deploy ground-truth assessment teams",
  },
  {
    indicator: "vegetation_health",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Below-normal vegetation health detected",
    action: "Review crop insurance claim preparedness",
  },
  {
    indicator: "vegetation_health",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Mild vegetation stress observed",
    action: "Schedule satellite-based crop cutting experiments",
  },

  // flood_risk
  {
    indicator: "flood_risk",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "High flood risk — soil saturated, rainfall excessive",
    action: "Activate flood contingency funds",
  },
  {
    indicator: "flood_risk",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Elevated flood probability",
    action: "Review flood-exposed loan portfolios",
  },
  {
    indicator: "flood_risk",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Moderate flood susceptibility",
    action: "Verify drainage infrastructure status",
  },

  // soil_moisture
  {
    indicator: "soil_moisture",
    condition: (s) => s > 75,
    severity: "critical",
    insight: "Critical soil moisture deficit — agricultural drought imminent",
    action: "Fast-track drought declaration process",
  },
  {
    indicator: "soil_moisture",
    condition: (s) => s > 50,
    severity: "warning",
    insight: "Below-optimal soil moisture for crop growth",
    action: "Recommend supplemental irrigation advisory",
  },
  {
    indicator: "soil_moisture",
    condition: (s) => s > 25,
    severity: "info",
    insight: "Soil moisture trending below seasonal norms",
    action: "Monitor soil conditions through next rainfall event",
  },
];

const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/**
 * Evaluate all insight rules against a district's scores.
 * Returns triggered insights sorted by severity (critical first).
 * Only the highest-severity rule per indicator fires.
 */
export function getInsightsForDistrict(
  scores: Record<string, number>,
  values: Record<string, number>,
): Insight[] {
  const insights: Insight[] = [];
  const matched = new Set<string>();

  // Rules are ordered by severity (critical first) within each indicator,
  // so the first match per indicator is the highest severity.
  for (const rule of INSIGHT_RULES) {
    if (matched.has(rule.indicator)) continue;

    const score = scores[rule.indicator];
    if (score === undefined || score === null) continue;

    if (rule.condition(score)) {
      matched.add(rule.indicator);
      const value = values[rule.indicator];
      insights.push({
        indicator: rule.indicator,
        severity: rule.severity,
        insight: rule.insight,
        action: rule.action,
        metric: rule.metricFn && value !== undefined ? rule.metricFn(value) : undefined,
      });
    }
  }

  return insights.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

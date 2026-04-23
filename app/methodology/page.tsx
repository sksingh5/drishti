import { INDICATOR_LIST, RISK_COLORS, RISK_BG_COLORS } from "@/lib/indicators";
import { SOURCE_LIST, RELIABILITY_STYLES } from "@/lib/sources";
import type { RiskLevel } from "@/lib/indicators";
import type { ReliabilityLevel } from "@/lib/sources";

const RISK_CATEGORIES: { level: RiskLevel; range: string; description: string }[] = [
  { level: "low", range: "0 – 25", description: "Minimal climate risk" },
  { level: "moderate", range: "26 – 50", description: "Some indicators elevated" },
  { level: "high", range: "51 – 75", description: "Significant risk, monitoring needed" },
  { level: "critical", range: "76 – 100", description: "Severe conditions, action required" },
];

function ReliabilityBadge({ level }: { level: ReliabilityLevel }) {
  const style = RELIABILITY_STYLES[level];
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function RiskBadge({ level, range, description }: { level: RiskLevel; range: string; description: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: RISK_BG_COLORS[level], color: RISK_COLORS[level] }}
      >
        {level}
      </span>
      <span className="text-[13px] font-semibold" style={{ color: "var(--dicra-text-primary)" }}>
        {range}
      </span>
      <span className="text-[13px]" style={{ color: "var(--dicra-text-secondary)" }}>
        — {description}
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-6">
      <h2 className="text-[18px] font-bold mb-3" style={{ color: "var(--dicra-text-primary)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Page header */}
      <div className="mb-6">
        <h1
          className="text-[22px] font-extrabold tracking-tight"
          style={{ color: "var(--dicra-text-primary)" }}
        >
          Methodology
        </h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--dicra-text-muted)" }}>
          How DRISHTI computes climate risk scores — data sources, scoring, and limitations
        </p>
      </div>

      {/* Financial use disclaimer */}
      <div className="rounded-[var(--dicra-radius-lg)] p-5 mb-6"
           style={{ background: "var(--dicra-risk-moderate-bg)", border: "1px solid var(--dicra-risk-moderate)" }}>
        <div className="text-[13px] font-bold mb-1" style={{ color: "var(--dicra-risk-moderate)" }}>
          Important: Scientific Limitations
        </div>
        <div className="text-[12px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
          DRISHTI provides relative risk rankings for comparative analysis across districts. Scores represent percentile positions, not absolute thresholds. This platform should complement — not replace — domain expertise, ground-truth validation, and institutional risk frameworks. All methodologies, data sources, and known limitations are documented transparently below.
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* 1. Scoring System */}
        <SectionCard title="Scoring System">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--dicra-text-secondary)" }}>
            All indicators are converted to a 0–100 percentile scale where higher scores indicate greater
            climate risk. Raw values are ranked against the full district distribution for the given time
            period, then mapped to a percentile. The resulting score falls into one of four risk categories:
          </p>
          <div className="flex flex-col gap-2">
            {RISK_CATEGORIES.map((cat) => (
              <RiskBadge key={cat.level} level={cat.level} range={cat.range} description={cat.description} />
            ))}
          </div>
        </SectionCard>

        {/* 2. Indicator Definitions */}
        <SectionCard title="Indicator Definitions">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--dicra-text-secondary)" }}>
            DRISHTI tracks seven climate risk indicators. Each is independently scored and can be combined into
            a weighted composite.
          </p>
          <div className="grid gap-3">
            {INDICATOR_LIST.map((ind) => (
              <div
                key={ind.key}
                className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4"
                style={{ backgroundColor: "var(--dicra-bg)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ind.color }}
                  />
                  <span className="text-[14px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>
                    {ind.label}
                  </span>
                  <ReliabilityBadge level={ind.reliability} />
                </div>
                <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--dicra-text-secondary)" }}>
                  {ind.methodology}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]" style={{ color: "var(--dicra-text-muted)" }}>
                  <span>Source: {ind.source}</span>
                  <span>Resolution: {ind.resolution}</span>
                  <span>Frequency: {ind.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 3. Data Sources */}
        <SectionCard title="Data Sources">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--dicra-text-secondary)" }}>
            Underlying datasets powering DRISHTI indicators, with their spatial and temporal characteristics.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wider border-b border-[var(--dicra-border)]"
                  style={{ color: "var(--dicra-text-muted)" }}
                >
                  <th className="pb-2 pr-4">Source</th>
                  <th className="pb-2 pr-4">Resolution</th>
                  <th className="pb-2 pr-4">Frequency</th>
                  <th className="pb-2 pr-4">Coverage</th>
                  <th className="pb-2">Reliability</th>
                </tr>
              </thead>
              <tbody>
                {SOURCE_LIST.map((src) => (
                  <tr
                    key={src.key}
                    className="border-b border-[var(--dicra-border)] last:border-b-0"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    <td className="py-2 pr-4 font-medium" style={{ color: "var(--dicra-text-primary)" }}>
                      {src.name}
                    </td>
                    <td className="py-2 pr-4">{src.resolution}</td>
                    <td className="py-2 pr-4">{src.frequency}</td>
                    <td className="py-2 pr-4">{src.coverage}</td>
                    <td className="py-2">
                      <ReliabilityBadge level={src.reliability} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* 4. Weight System */}
        <SectionCard title="Weight System">
          <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--dicra-text-secondary)" }}>
            The composite climate risk score is a weighted average of all seven indicators. By default,
            rainfall anomaly and drought index each receive 18% weight (water-related stress dominates
            India&apos;s risk profile), vegetation health, heat stress, flood risk, and soil moisture each
            receive 13%, and the vulnerability index receives 12%. Weights are fully adjustable.
          </p>
          <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--dicra-text-secondary)" }}>
            Several presets are available for common use cases. You can also set fully custom weights.
          </p>
          <p className="text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            Configure weights on the{" "}
            <a
              href="/weights"
              className="underline font-medium"
              style={{ color: "var(--dicra-text-primary)" }}
            >
              Weights page
            </a>
            .
          </p>
        </SectionCard>

        {/* 5. Limitations */}
        <SectionCard title="Limitations">
          <ul className="list-disc pl-5 flex flex-col gap-2 text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Data freshness varies by source:</strong>{" "}
              IMD data typically lags ~1 month; ERA5-Land ~2 months; MODIS NDVI ~1 month. Displayed scores
              reflect the most recently ingested data, which may not represent current conditions.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Spatial resolution:</strong> IMD rainfall
              is at 0.25° (~25 km); temperature at 1°; ERA5 at 0.1°. Sub-district variation is not captured
              for any indicator.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Short climatological baseline:</strong>{" "}
              Rainfall anomaly uses a 5-year baseline (2019–2023). WMO recommends 30-year normals for
              climatological comparisons. The short baseline means anomaly scores may be dominated by recent
              weather rather than true long-run patterns.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Drought index method:</strong>{" "}
              Drought index uses 3-month accumulated rainfall ranked as a cross-district percentile, not a
              gamma-fitted SPI. Proper gamma SPI requires 10+ years of same-month history per district (WMO
              guideline). The current method can conflate inter-district differences with actual drought
              severity.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>MODIS NDVI:</strong> Affected by cloud
              contamination in monsoon months; compositing reduces but does not eliminate this artefact.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Flood risk:</strong> Uses a placeholder
              elevation factor (fixed at 50 — neutral). Real topographic data from SRTM DEM will replace this
              in a future update, and composite weights (40/40/20) need validation against observed flood
              events before use in resource allocation.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Scores are relative:</strong>{" "}
              Percentile-based, not absolute thresholds. A score of 75 means the district ranks in the 75th
              percentile of risk among all monitored districts — it does not represent a fixed danger level.
              Small differences (&plusmn;5 points) should not be treated as significant.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Heat stress:</strong>{" "}
              Uses daily maximum temperature only. Does not account for humidity (which amplifies heat
              impact), nighttime temperatures, or multi-day heat spell duration. For occupational or
              agricultural heat stress assessment, WBGT (Wet Bulb Globe Temperature) thresholds are
              preferred.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

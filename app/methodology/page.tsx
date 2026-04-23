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
          How DRISHTI computes climate risk scores, generates crop advisories, and delivers plot-level satellite intelligence
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

        {/* 5. Crop Advisory System */}
        <SectionCard title="Crop Advisory System">
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--dicra-text-secondary)" }}>
            DRISHTI generates crop-specific alerts and agronomic guidance for each district by combining
            climate indicator scores with agricultural knowledge. The system operates in three layers:
          </p>

          <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4 mb-4" style={{ background: "var(--dicra-bg)" }}>
            <h3 className="text-[14px] font-bold mb-2" style={{ color: "var(--dicra-text-primary)" }}>
              Layer 1: Agro-Climatic Zone Mapping
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
              India is divided into 15 agro-climatic zones based on the Planning Commission classification.
              Each zone has 3–4 dominant crops identified from ICAR data. Every district is mapped to one zone
              based on its state. For example, districts in Maharashtra map to the &ldquo;Western Plateau &amp; Hills&rdquo;
              zone with dominant crops Cotton, Soybean, Pigeon Pea, and Sorghum. This mapping is static and
              updated annually. It determines which crops appear in a district&apos;s advisory.
            </p>
          </div>

          <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4 mb-4" style={{ background: "var(--dicra-bg)" }}>
            <h3 className="text-[14px] font-bold mb-2" style={{ color: "var(--dicra-text-primary)" }}>
              Layer 2: Crop-Specific Alert Rules
            </h3>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
              Each crop has threshold rules that map climate indicator scores to specific warnings. When a
              district&apos;s indicator score crosses a crop-specific threshold, an alert fires. For example:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider border-b border-[var(--dicra-border)]"
                      style={{ color: "var(--dicra-text-muted)" }}>
                    <th className="pb-2 pr-3">Crop</th>
                    <th className="pb-2 pr-3">Indicator</th>
                    <th className="pb-2 pr-3">Threshold</th>
                    <th className="pb-2">Alert</th>
                  </tr>
                </thead>
                <tbody style={{ color: "var(--dicra-text-secondary)" }}>
                  <tr className="border-b border-[var(--dicra-border)]">
                    <td className="py-2 pr-3 font-medium">Cotton</td>
                    <td className="py-2 pr-3">Heat Stress</td>
                    <td className="py-2 pr-3">&ge; 60</td>
                    <td className="py-2">High temperatures may affect boll development and fiber quality</td>
                  </tr>
                  <tr className="border-b border-[var(--dicra-border)]">
                    <td className="py-2 pr-3 font-medium">Rice</td>
                    <td className="py-2 pr-3">Soil Moisture</td>
                    <td className="py-2 pr-3">&ge; 60</td>
                    <td className="py-2">Low soil moisture is critical for paddy — ensure irrigation availability</td>
                  </tr>
                  <tr className="border-b border-[var(--dicra-border)]">
                    <td className="py-2 pr-3 font-medium">Wheat</td>
                    <td className="py-2 pr-3">Heat Stress</td>
                    <td className="py-2 pr-3">&ge; 55</td>
                    <td className="py-2">Terminal heat can reduce wheat yield — consider heat-tolerant varieties</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-medium">Maize</td>
                    <td className="py-2 pr-3">Flood Risk</td>
                    <td className="py-2 pr-3">&ge; 55</td>
                    <td className="py-2">Maize cannot tolerate waterlogging — ensure raised bed planting</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[12px] mt-3 italic" style={{ color: "var(--dicra-text-muted)" }}>
              The system currently has 32 alert rules across 12 crops and 6 indicators. Thresholds are
              derived from agricultural literature and ICAR crop-specific guidelines. Note that &ldquo;Soil Moisture
              score &ge; 60&rdquo; means the soil is unusually <em>dry</em> (inverted percentile scoring — higher score = higher risk = drier soil).
            </p>
          </div>

          <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4" style={{ background: "var(--dicra-bg)" }}>
            <h3 className="text-[14px] font-bold mb-2" style={{ color: "var(--dicra-text-primary)" }}>
              Layer 3: General Guidance (ICAR/KVK Recommendations)
            </h3>
            <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
              When alert conditions are met, the system also displays curated agronomic guidance drawn from
              ICAR (Indian Council of Agricultural Research) and KVK (Krishi Vigyan Kendra) recommendations.
              These are standard best-practice advisories for each crop under specific climate stress
              conditions — for example:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-[12px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
              <li>Cotton under heat stress: &ldquo;Apply kaolin spray (5%) to reflect sunlight and reduce leaf temperature&rdquo;</li>
              <li>Rice under drought: &ldquo;Switch to System of Rice Intensification (SRI) to reduce water requirement by 30–40%&rdquo;</li>
              <li>Wheat under low soil moisture: &ldquo;Ensure irrigation at 4 critical stages: CRI, tillering, flowering, grain filling&rdquo;</li>
              <li>Maize under heat stress: &ldquo;Irrigate during tasseling — maize is most heat-sensitive at pollination&rdquo;</li>
            </ul>
            <p className="text-[12px] mt-3 italic" style={{ color: "var(--dicra-text-muted)" }}>
              Guidance is clearly labelled as &ldquo;General Guidance&rdquo; on the platform. These are standard
              recommendations, not location-specific predictions. Farmers should consult their local KVK
              for situation-specific advice.
            </p>
          </div>
        </SectionCard>

        {/* 6. Plot-Level Point Queries */}
        <SectionCard title="Plot-Level Point Queries">
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
            DRISHTI allows users to query satellite data at any point in India by clicking on the map.
            The system calls Google Earth Engine in real-time to extract the latest available pixel values
            at the clicked location. This provides sub-district, plot-level data without pre-aggregation.
          </p>
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
            <strong style={{ color: "var(--dicra-text-primary)" }}>Datasets queried:</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider border-b border-[var(--dicra-border)]"
                    style={{ color: "var(--dicra-text-muted)" }}>
                  <th className="pb-2 pr-3">Parameter</th>
                  <th className="pb-2 pr-3">GEE Dataset</th>
                  <th className="pb-2 pr-3">Resolution</th>
                  <th className="pb-2">Update Cycle</th>
                </tr>
              </thead>
              <tbody style={{ color: "var(--dicra-text-secondary)" }}>
                <tr className="border-b border-[var(--dicra-border)]">
                  <td className="py-2 pr-3 font-medium">NDVI</td>
                  <td className="py-2 pr-3">MODIS MOD13Q1</td>
                  <td className="py-2 pr-3">250m</td>
                  <td className="py-2">16-day composite</td>
                </tr>
                <tr className="border-b border-[var(--dicra-border)]">
                  <td className="py-2 pr-3 font-medium">EVI</td>
                  <td className="py-2 pr-3">MODIS MOD13Q1</td>
                  <td className="py-2 pr-3">250m</td>
                  <td className="py-2">16-day composite</td>
                </tr>
                <tr className="border-b border-[var(--dicra-border)]">
                  <td className="py-2 pr-3 font-medium">Land Surface Temp</td>
                  <td className="py-2 pr-3">MODIS MOD11A2</td>
                  <td className="py-2 pr-3">1 km</td>
                  <td className="py-2">8-day composite</td>
                </tr>
                <tr className="border-b border-[var(--dicra-border)]">
                  <td className="py-2 pr-3 font-medium">Soil Moisture</td>
                  <td className="py-2 pr-3">ERA5-Land Monthly</td>
                  <td className="py-2 pr-3">~11 km</td>
                  <td className="py-2">Monthly</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Precipitation</td>
                  <td className="py-2 pr-3">CHIRPS Daily</td>
                  <td className="py-2 pr-3">~5.5 km</td>
                  <td className="py-2">Daily (summed over 45 days)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[12px] mt-3 italic" style={{ color: "var(--dicra-text-muted)" }}>
            Point queries return raw physical values (not risk scores) from the most recent satellite pass.
            Response time is typically 3–5 seconds, limited by GEE server-side computation. The 45-day
            lookback window ensures data availability even when the latest composite is still processing.
          </p>
        </SectionCard>

        {/* 7. Automated Pipeline */}
        <SectionCard title="Automated Data Pipeline">
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--dicra-text-secondary)" }}>
            DRISHTI&apos;s data pipeline runs automatically on the 5th of each month via GitHub Actions. It
            executes 8 stages in sequence:
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-1 text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            <li><strong>IMD Rainfall</strong> — downloads 0.25° gridded daily rainfall, aggregates to monthly district totals</li>
            <li><strong>IMD Temperature</strong> — downloads 1° gridded daily Tmax, computes monthly district means</li>
            <li><strong>ERA5 Soil Moisture</strong> — fetches monthly volumetric soil water from Copernicus CDS</li>
            <li><strong>MODIS NDVI</strong> — queries Google Earth Engine for district-level NDVI zonal statistics</li>
            <li><strong>Drought Index</strong> — computes 3-month accumulated rainfall percentile ranking</li>
            <li><strong>Flood Risk</strong> — computes weighted composite of rainfall, soil moisture, and elevation</li>
            <li><strong>Vulnerability</strong> — computes mean of rainfall anomaly and vegetation health scores</li>
            <li><strong>Alert Check</strong> — evaluates alert thresholds and creates alert events</li>
          </ol>
          <p className="text-[13px] mt-3 leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
            Each stage writes scored indicator data to the database. The pipeline runs on the 5th to allow
            data sources time to publish the previous month&apos;s data (IMD ~1 month lag, ERA5 ~2 months,
            MODIS ~1 month). The pipeline can also be triggered manually for any specific year/month.
          </p>
        </SectionCard>

        {/* 8. Limitations */}
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
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Crop zone mapping is state-level:</strong>{" "}
              Districts are assigned to agro-climatic zones based on their state. Some states span multiple
              zones (e.g., Uttar Pradesh covers both plains and plateau). Sub-state zone assignments would
              improve accuracy but require district-level agro-climatic classification data.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Crop advisory uses static rules, not models:</strong>{" "}
              Alerts fire when indicator scores cross fixed thresholds. This does not account for crop growth
              stage, sowing date, variety-specific tolerances, or cumulative stress. The guidance is drawn from
              general ICAR/KVK recommendations and should not replace local extension advice.
            </li>
            <li>
              <strong style={{ color: "var(--dicra-text-primary)" }}>Point queries return raw values, not risk scores:</strong>{" "}
              Plot-level satellite data is not percentile-scored or compared against baselines. The values are
              useful for understanding local conditions but are not directly comparable to the district-level
              risk scores shown on the dashboard.
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

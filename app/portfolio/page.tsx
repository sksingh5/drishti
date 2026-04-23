import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Briefcase,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// Sample portfolio data for demonstration
const SAMPLE_DISTRICTS = [
  { name: "Bhuj", state: "Gujarat", exposure: "12.4 Cr", loans: 842, drought: 87, heat: 72, flood: 23, composite: 78, risk: "critical" as const },
  { name: "Anantapur", state: "Andhra Pradesh", exposure: "8.7 Cr", loans: 634, drought: 82, heat: 68, flood: 31, composite: 71, risk: "high" as const },
  { name: "Barmer", state: "Rajasthan", exposure: "6.2 Cr", loans: 451, drought: 79, heat: 91, flood: 15, composite: 74, risk: "high" as const },
  { name: "Kalahandi", state: "Odisha", exposure: "9.1 Cr", loans: 723, drought: 45, heat: 52, flood: 78, composite: 62, risk: "high" as const },
  { name: "Guntur", state: "Andhra Pradesh", exposure: "15.3 Cr", loans: 1104, drought: 38, heat: 55, flood: 42, composite: 44, risk: "moderate" as const },
  { name: "Shimoga", state: "Karnataka", exposure: "4.8 Cr", loans: 312, drought: 22, heat: 35, flood: 28, composite: 28, risk: "moderate" as const },
];

const RISK_STYLES = {
  critical: { bg: "var(--dicra-risk-critical-bg)", color: "var(--dicra-risk-critical)", label: "CRITICAL" },
  high: { bg: "var(--dicra-risk-high-bg)", color: "var(--dicra-risk-high)", label: "HIGH" },
  moderate: { bg: "var(--dicra-risk-moderate-bg)", color: "var(--dicra-risk-moderate)", label: "MODERATE" },
  low: { bg: "var(--dicra-risk-low-bg)", color: "var(--dicra-risk-low)", label: "LOW" },
};

export default function PortfolioPage() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <ScrollReveal>
        <div className="flex items-start gap-4 mb-2">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0"
            style={{ background: "var(--dicra-accent-subtle)" }}
          >
            <Briefcase size={24} style={{ color: "var(--dicra-accent)" }} />
          </div>
          <div>
            <h1
              className="text-[28px] font-black tracking-[-0.5px]"
              style={{ color: "var(--dicra-text-primary)" }}
            >
              Climate Risk Portfolio Analysis
            </h1>
            <p
              className="text-[15px] mt-1 leading-relaxed max-w-[600px]"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Overlay your lending portfolio with real-time climate risk data.
              Identify exposure concentrations in climate-vulnerable districts
              before they become NPAs.
            </p>
          </div>
        </div>

        <div
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold"
          style={{ background: "rgba(251,191,36,0.1)", color: "#D97706" }}
        >
          <AlertTriangle size={14} />
          Module in Development — Sample Analysis Below
        </div>
      </ScrollReveal>

      {/* ── Sample Analysis ── */}
      <ScrollReveal delay={100}>
        <div
          className="mt-10 rounded-2xl border overflow-hidden"
          style={{ borderColor: "var(--dicra-border)", background: "var(--dicra-surface)" }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--dicra-border)" }}
          >
            <div>
              <h2
                className="text-[16px] font-bold"
                style={{ color: "var(--dicra-text-primary)" }}
              >
                Sample: Agricultural Loan Portfolio — Climate Stress View
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--dicra-text-muted)" }}>
                Illustrative data · 6 districts · Showing how climate risk overlays loan exposure
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-3 py-1.5 rounded-md"
              style={{ background: "var(--dicra-surface-muted)", color: "var(--dicra-text-muted)" }}
            >
              SAMPLE DATA
            </span>
          </div>

          {/* Summary stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px"
            style={{ background: "var(--dicra-border)" }}
          >
            {[
              { label: "Total Exposure", value: "56.5 Cr", sub: "across 6 districts" },
              { label: "Loans at Risk", value: "2,650", sub: "in high/critical zones" },
              { label: "Critical Districts", value: "1", sub: "immediate review needed" },
              { label: "Avg. Climate Score", value: "59.5", sub: "elevated risk" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5"
                style={{ background: "var(--dicra-surface)" }}
              >
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.8px]"
                  style={{ color: "var(--dicra-text-muted)" }}
                >
                  {stat.label}
                </div>
                <div
                  className="text-[22px] font-black tracking-[-0.5px] mt-1"
                  style={{ color: "var(--dicra-text-primary)" }}
                >
                  {stat.value}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "var(--dicra-text-faint)" }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          {/* District table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--dicra-border)" }}>
                  {["District", "State", "Exposure", "Loans", "Drought", "Heat", "Flood", "Composite", "Risk"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.8px]"
                      style={{ color: "var(--dicra-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_DISTRICTS.map((d) => {
                  const style = RISK_STYLES[d.risk];
                  return (
                    <tr
                      key={d.name}
                      style={{ borderBottom: "1px solid var(--dicra-border-subtle)" }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--dicra-text-primary)" }}>
                        {d.name}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--dicra-text-secondary)" }}>
                        {d.state}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--dicra-text-primary)" }}>
                        {d.exposure}
                      </td>
                      <td className="px-4 py-3" style={{ color: "var(--dicra-text-secondary)" }}>
                        {d.loans.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell value={d.drought} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell value={d.heat} />
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCell value={d.flood} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold" style={{ color: style.color }}>
                          {d.composite}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded"
                          style={{ background: style.bg, color: style.color }}
                        >
                          {style.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Insight callout */}
          <div
            className="mx-5 mb-5 mt-3 rounded-xl p-4 flex items-start gap-3"
            style={{ background: "var(--dicra-risk-critical-bg)" }}
          >
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "var(--dicra-risk-critical)" }} />
            <div>
              <p className="text-[13px] font-bold" style={{ color: "var(--dicra-risk-critical)" }}>
                Action Required: Bhuj District
              </p>
              <p className="text-[12px] mt-1 leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
                12.4 Cr exposure across 842 agricultural loans in a district scoring 87 on drought index.
                SPI-3 indicates severe rainfall deficit over the past 3 months. Recommend: review rainfed
                crop loan portfolio, assess irrigation dependency, consider restructuring timeline ahead
                of kharif season.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── How We're Building This ── */}
      <ScrollReveal delay={150}>
        <div className="mt-12">
          <h2
            className="text-[22px] font-black tracking-[-0.3px] mb-6"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            How This Module Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: Technical approach */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--dicra-surface)", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
            >
              <h3
                className="text-[14px] font-bold mb-4 flex items-center gap-2"
                style={{ color: "var(--dicra-text-primary)" }}
              >
                <Shield size={16} style={{ color: "var(--dicra-accent)" }} />
                Technical Approach
              </h3>
              <div className="flex flex-col gap-4 text-[13px] leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--dicra-accent-subtle)", color: "var(--dicra-accent)" }}>1</span>
                  <p><strong>Portfolio Upload:</strong> Financial institutions upload district-wise loan exposure data (CSV format — district name, loan count, total exposure, crop type). No borrower-level PII required.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--dicra-accent-subtle)", color: "var(--dicra-accent)" }}>2</span>
                  <p><strong>District Matching:</strong> Each row is matched to DRISHTI's district database using LGD codes or fuzzy name matching. Unmatched districts are flagged for manual review.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--dicra-accent-subtle)", color: "var(--dicra-accent)" }}>3</span>
                  <p><strong>Climate Overlay:</strong> Real-time climate risk scores (drought, flood, heat, vegetation stress) from IMD, ERA5, and MODIS are joined to each district's loan exposure.</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: "var(--dicra-accent-subtle)", color: "var(--dicra-accent)" }}>4</span>
                  <p><strong>Risk Report:</strong> Districts are ranked by combined financial exposure + climate risk. Actionable alerts highlight where loan restructuring, insurance activation, or field verification is recommended.</p>
                </div>
              </div>
            </div>

            {/* Right: What it enables */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--dicra-surface)", boxShadow: "0 2px 20px rgba(0,0,0,0.04)" }}
            >
              <h3
                className="text-[14px] font-bold mb-4 flex items-center gap-2"
                style={{ color: "var(--dicra-text-primary)" }}
              >
                <BarChart3 size={16} style={{ color: "var(--dicra-accent)" }} />
                Use Cases
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  {
                    title: "NABARD & Development Banks",
                    desc: "Monitor refinance portfolio exposure across climate-vulnerable districts. Prioritize climate-adaptive lending programs.",
                  },
                  {
                    title: "Commercial & Cooperative Banks",
                    desc: "Stress-test agricultural loan books against drought, flood, and heat scenarios. Proactive NPA identification.",
                  },
                  {
                    title: "Microfinance Institutions",
                    desc: "Map group lending clusters against climate risk zones. Identify JLG/SHG portfolios in high-risk geographies.",
                  },
                  {
                    title: "Insurance Companies",
                    desc: "Cross-reference crop insurance claims with satellite-derived indices. Validate PMFBY claims against actual climate conditions.",
                  },
                ].map((uc) => (
                  <div key={uc.title} className="flex gap-3">
                    <CheckCircle size={16} className="flex-shrink-0 mt-1" style={{ color: "var(--dicra-accent)" }} />
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--dicra-text-primary)" }}>
                        {uc.title}
                      </p>
                      <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--dicra-text-secondary)" }}>
                        {uc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Development Status ── */}
      <ScrollReveal delay={200}>
        <div
          className="mt-10 rounded-2xl p-6 text-center"
          style={{
            background: "linear-gradient(135deg, var(--dicra-brand) 0%, #0A2E1A 100%)",
          }}
        >
          <p className="text-[14px] text-white opacity-90 max-w-[500px] mx-auto leading-relaxed">
            This module is under active development. The climate risk engine (7 indicators, 784 districts, 6 months of history) is fully operational.
            Portfolio upload and overlay functionality is next.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wide">
              Interested in early access?
            </span>
            <a
              href="mailto:contact@climateiq.in"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-[12px] font-bold transition-all hover:scale-105"
              style={{ background: "var(--dicra-accent)", color: "var(--dicra-brand)" }}
            >
              Get in Touch
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function ScoreCell({ value }: { value: number }) {
  const color =
    value >= 76
      ? "var(--dicra-risk-critical)"
      : value >= 51
        ? "var(--dicra-risk-high)"
        : value >= 26
          ? "var(--dicra-risk-moderate)"
          : "var(--dicra-risk-low)";
  return (
    <span className="text-[12px] font-semibold" style={{ color }}>
      {value}
    </span>
  );
}

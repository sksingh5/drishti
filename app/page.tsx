import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

// Revalidate landing page every hour (data only changes monthly)
export const revalidate = 3600;
import { INDICATOR_LIST } from "@/lib/indicators";
import { getIndicatorStatus } from "@/lib/queries";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  BarChart3,
  Map,
  Briefcase,
} from "lucide-react";
import { Logo } from "@/components/logo";

export default async function LandingPage() {
  const supabase = await createClient();
  const { count: districtCount } = await supabase
    .from("districts")
    .select("id", { count: "exact", head: true });
  const { count: stateCount } = await supabase
    .from("states")
    .select("id", { count: "exact", head: true });
  const indicatorStatus = await getIndicatorStatus();

  return (
    <div className="min-h-screen" style={{ background: "var(--dicra-bg)" }}>
      {/* ── Sticky Nav ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(246,245,241,0.85)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span
              className="text-[15px] font-bold tracking-wide"
              style={{ color: "var(--dicra-text-primary)" }}
            >
              DRISHTI
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/about"
              className="text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--dicra-text-muted)" }}
            >
              About
            </Link>
            <Link
              href="/portfolio"
              className="text-[13px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--dicra-text-muted)" }}
            >
              Portfolio
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-all hover:scale-105"
              style={{ background: "var(--dicra-brand)" }}
            >
              Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HERO (Full-Bleed Photo)
          Key Message A: Comprehensive District-Level Climate Analysis
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ height: "min(90vh, 800px)" }}>
        <Image
          src="/images/hero-aerial.jpg"
          alt="Aerial view of Indian agricultural landscape"
          fill
          priority
          className="object-cover"
          style={{ filter: "brightness(0.3)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p
            className="text-[11px] font-semibold uppercase tracking-[4px] mb-5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            District Risk Intelligence System for Hazard Tracking in India
          </p>
          <h1
            className="font-black leading-[1.05] tracking-[-1.5px] text-white max-w-[800px]"
            style={{ fontSize: "clamp(32px, 5vw, 56px)" }}
          >
            Comprehensive District-Level Climate Analysis for India
          </h1>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold transition-all hover:scale-105"
            style={{
              background: "var(--dicra-accent)",
              color: "var(--dicra-brand)",
            }}
          >
            Explore Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — DATA PROVENANCE & TRUST
          Key Message B: Built on reliable data sources and public API
         ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-28 md:py-36"
        style={{ background: "var(--dicra-surface)" }}
      >
        <div className="max-w-[1100px] mx-auto px-8">
          <ScrollReveal>
            <p
              className="text-[12px] font-semibold uppercase tracking-[3px] text-center mb-4"
              style={{ color: "var(--dicra-accent)" }}
            >
              Data Provenance
            </p>
            <h2
              className="text-center font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              Built on Reliable, Public Data Sources
            </h2>
            <p
              className="text-center mt-4 text-[16px] max-w-[520px] mx-auto leading-relaxed"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Every indicator traces to a published government or institutional
              dataset. No black boxes. No estimates. Full provenance.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: "IMD Pune",
                provides: "Rainfall & Temperature",
                resolution: "0.25° gridded daily",
                delay: 0,
              },
              {
                name: "Copernicus ERA5",
                provides: "Soil Moisture",
                resolution: "0.1° monthly reanalysis",
                delay: 100,
              },
              {
                name: "NASA MODIS",
                provides: "Vegetation Health (NDVI)",
                resolution: "1km monthly composite",
                delay: 200,
              },
              {
                name: "Google Earth Engine",
                provides: "Satellite Processing",
                resolution: "Public compute API",
                delay: 300,
              },
            ].map((src) => (
              <ScrollReveal key={src.name} delay={src.delay}>
                <div
                  className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    background: "var(--dicra-bg)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-black mb-4"
                    style={{
                      background: "var(--dicra-accent-subtle)",
                      color: "var(--dicra-accent)",
                    }}
                  >
                    {src.name.charAt(0)}
                  </div>
                  <h3
                    className="font-bold text-[15px]"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {src.name}
                  </h3>
                  <p
                    className="text-[13px] mt-1"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {src.provides}
                  </p>
                  <p
                    className="text-[11px] mt-3 font-medium"
                    style={{ color: "var(--dicra-text-muted)" }}
                  >
                    {src.resolution}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — DECISION-MAKING MODULES
          Key Message C: Modules for different decision making use cases
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1100px] mx-auto px-8">
          <ScrollReveal>
            <p
              className="text-[12px] font-semibold uppercase tracking-[3px] text-center mb-4"
              style={{ color: "var(--dicra-accent)" }}
            >
              Platform Modules
            </p>
            <h2
              className="text-center font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              Modules for Every Decision Maker
            </h2>
            <p
              className="text-center mt-4 text-[16px] max-w-[520px] mx-auto leading-relaxed"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              From national oversight to district-level scorecards to portfolio
              stress testing — one platform, multiple use cases.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "National Overview",
                desc: "State-level risk heatmap with interactive choropleth map, composite scoring, and district rankings across all indicators.",
                status: "live" as const,
                href: "/dashboard",
                delay: 0,
              },
              {
                icon: Map,
                title: "District Scorecard",
                desc: "7-indicator risk profile with actionable insights, trend charts, policy recommendations, and CSV export for any district.",
                status: "live" as const,
                href: "/dashboard",
                delay: 120,
              },
              {
                icon: Briefcase,
                title: "Climate Risk Portfolio Analysis",
                desc: "Overlay lending portfolio exposure with real-time climate risk data. Identify vulnerable districts before they become NPAs.",
                status: "soon" as const,
                href: "/portfolio",
                delay: 240,
              },
            ].map((mod) => (
              <ScrollReveal key={mod.title} delay={mod.delay}>
                <Link
                  href={mod.href}
                  className="block rounded-2xl p-8 transition-all hover:-translate-y-1 h-full"
                  style={{
                    background: "var(--dicra-surface)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background:
                        mod.status === "live"
                          ? "var(--dicra-accent-subtle)"
                          : "rgba(251,191,36,0.1)",
                    }}
                  >
                    <mod.icon
                      size={22}
                      style={{
                        color:
                          mod.status === "live"
                            ? "var(--dicra-accent)"
                            : "#F59E0B",
                      }}
                    />
                  </div>
                  <h3
                    className="font-bold text-[18px] tracking-[-0.3px]"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {mod.title}
                  </h3>
                  <p
                    className="mt-3 text-[14px] leading-relaxed"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {mod.desc}
                  </p>
                  <div className="mt-5">
                    {mod.status === "live" ? (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--dicra-risk-low)" }}
                      >
                        <CheckCircle size={14} /> Live
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "#D97706" }}
                      >
                        <Lock size={14} /> Coming Soon
                      </span>
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — INDICATORS
         ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-28 md:py-36"
        style={{ background: "var(--dicra-surface)" }}
      >
        <div className="max-w-[1100px] mx-auto px-8">
          <ScrollReveal>
            <p
              className="text-[12px] font-semibold uppercase tracking-[3px] text-center mb-4"
              style={{ color: "var(--dicra-accent)" }}
            >
              Indicators
            </p>
            <h2
              className="text-center font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              Seven Indicators, One Composite Score
            </h2>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDICATOR_LIST.map((ind, i) => (
              <ScrollReveal key={ind.key} delay={i * 60}>
                <div
                  className="rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{
                    background: "var(--dicra-bg)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: ind.color }}
                    />
                    <h3
                      className="font-bold text-[15px]"
                      style={{ color: "var(--dicra-text-primary)" }}
                    >
                      {ind.label}
                    </h3>
                  </div>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {ind.explainer}
                  </p>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded-md"
                      style={{
                        background: "var(--dicra-surface)",
                        color: "var(--dicra-text-muted)",
                      }}
                    >
                      {ind.source}
                    </span>
                    <span
                      className="text-[10px] px-2 py-1 rounded-md"
                      style={{
                        background: "var(--dicra-surface)",
                        color: "var(--dicra-text-muted)",
                      }}
                    >
                      {ind.resolution} · {ind.frequency}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — PLATFORM STATUS
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[900px] mx-auto px-8">
          <ScrollReveal>
            <p
              className="text-[12px] font-semibold uppercase tracking-[3px] text-center mb-4"
              style={{ color: "var(--dicra-accent)" }}
            >
              Status
            </p>
            <h2
              className="text-center font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              What&apos;s Live
            </h2>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDICATOR_LIST.map((ind, i) => {
              const status = indicatorStatus.find(
                (s) => s.indicator_type === ind.key,
              );
              const isLive = !!status && status.district_count > 0;
              return (
                <ScrollReveal key={ind.key} delay={i * 50}>
                  <div
                    className="flex items-start gap-3 p-5 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{
                      background: "var(--dicra-surface)",
                      boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ background: ind.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-[14px]"
                          style={{ color: "var(--dicra-text-primary)" }}
                        >
                          {ind.label}
                        </span>
                        {isLive ? (
                          <CheckCircle
                            size={14}
                            className="flex-shrink-0"
                            style={{ color: "var(--dicra-risk-low)" }}
                          />
                        ) : (
                          <Clock
                            size={14}
                            className="flex-shrink-0"
                            style={{ color: "var(--dicra-text-faint)" }}
                          />
                        )}
                      </div>
                      <div
                        className="text-[12px] mt-1"
                        style={{ color: "var(--dicra-text-muted)" }}
                      >
                        {ind.source} · {ind.resolution} · {ind.frequency}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — CTA
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 md:py-40">
        <Image
          src="/images/cta-drought.jpg"
          alt="Cracked earth symbolizing climate change impact"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.25)" }}
        />
        <div className="relative z-10 text-center px-6">
          <ScrollReveal>
            <h2
              className="font-black text-white tracking-[-1px] leading-tight max-w-[600px] mx-auto"
              style={{ fontSize: "clamp(28px, 4vw, 42px)" }}
            >
              Start Exploring District-Level Climate Intelligence
            </h2>
            <p
              className="mt-5 text-[16px] max-w-[480px] mx-auto"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Transparent data. Actionable insights. Every district in India.
            </p>
            <Link
              href="/dashboard"
              className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold transition-all hover:scale-105"
              style={{
                background: "var(--dicra-accent)",
                color: "var(--dicra-brand)",
              }}
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — FOOTER
         ══════════════════════════════════════════════════════════════ */}
      <footer
        className="py-10 border-t"
        style={{
          background: "var(--dicra-surface)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <div
          className="max-w-[1100px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px]"
          style={{ color: "var(--dicra-text-muted)" }}
        >
          <div className="flex items-center gap-2">
            <Logo size={24} />
            <span><span className="font-bold tracking-wide">DRISHTI</span> · District Risk Intelligence System for Hazard Tracking in India</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="hover:opacity-70 transition-opacity"
              style={{ color: "var(--dicra-text-muted)" }}
            >
              About
            </Link>
            <span style={{ color: "var(--dicra-text-faint)" }}>Built by</span>
            <a
              href="https://www.intellecap.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <img src="/images/intellecap-logo.png" alt="Intellecap" className="h-5 object-contain" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

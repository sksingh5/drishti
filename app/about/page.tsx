/**
 * DRAFT — Copy pending user review/approval before going live.
 */

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Eye, Globe, BarChart3, Users, ArrowRight } from "lucide-react";

export const metadata = { title: "About — DRISHTI" };

// ── DRAFT COPY ────────────────────────────────────────────────────────────────
// All text below is DRAFT. Review and approve before publishing.
// ─────────────────────────────────────────────────────────────────────────────

const KEY_MESSAGES = [
  {
    icon: Eye,
    heading: "Every district deserves transparent climate intelligence",
    body: "India's 784 districts face wildly different climate futures — yet most planning decisions are made with coarse, national-level data that masks hyper-local risk. DRISHTI was built on the belief that every district administrator, every agricultural lender, and every community leader deserves access to the same quality of climate intelligence that global institutions take for granted.",
    delay: 0,
  },
  {
    icon: Globe,
    heading: "Climate risk is hyper-local, but data has been fragmented",
    body: "A district that receives average rainfall may still face catastrophic drought if that rain arrives in a single week. Soil moisture, vegetation health, heat stress, and flood exposure all interact in ways that aggregate statistics miss entirely. For decades, this data existed — scattered across satellite archives, government observatories, and reanalysis models — but was never unified into a single, district-level picture. DRISHTI changes that.",
    delay: 100,
  },
  {
    icon: BarChart3,
    heading: "Satellite + ground station + reanalysis = one defensible risk score",
    body: "Seven indicators — rainfall anomaly, heat stress, drought severity, vegetation health, flood exposure, soil moisture, and social vulnerability — are computed from authoritative public sources: IMD Pune, Copernicus ERA5, and NASA MODIS. Each indicator is normalised to a 0–100 scale against a five-year climatological baseline, then combined into a single composite risk score. Every step is documented, peer-reviewable, and traceable to a published dataset. No black boxes.",
    delay: 200,
  },
  {
    icon: Users,
    heading: "Built for planners, lenders, researchers — and communities",
    body: "State disaster management authorities use DRISHTI to prioritise pre-monsoon resource allocation. Agricultural lenders use it to stress-test portfolio exposure before rabi season. Researchers use it as a validated baseline for climate attribution studies. And through open API access, civil society organisations can bring the same intelligence directly to the farming communities most exposed to risk. One platform, many missions.",
    delay: 300,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
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
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg font-black text-sm text-white"
              style={{
                background: "linear-gradient(135deg, var(--dicra-accent), #059669)",
                boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
              }}
            >
              D
            </span>
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
              style={{ color: "var(--dicra-accent)" }}
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
          HERO — Full-bleed photo
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative" style={{ height: "min(60vh, 520px)" }}>
        <Image
          src="/images/cta-drought.jpg"
          alt="Cracked earth symbolising climate stress across India"
          fill
          priority
          className="object-cover"
          style={{ filter: "brightness(0.25)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p
            className="text-[11px] font-semibold uppercase tracking-[4px] mb-5"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            District Risk Intelligence System for Hazard Tracking in India
          </p>
          <h1
            className="font-black leading-[1.05] tracking-[-1.5px] text-white max-w-[720px]"
            style={{ fontSize: "clamp(32px, 5vw, 52px)" }}
          >
            About DRISHTI
          </h1>
          <p
            className="mt-5 text-[16px] max-w-[520px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            A public-interest platform delivering open, peer-reviewable climate
            risk intelligence for every district in India.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          KEY MESSAGES — 2×2 card grid
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 md:py-36" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1100px] mx-auto px-8">
          <ScrollReveal>
            <p
              className="text-[12px] font-semibold uppercase tracking-[3px] text-center mb-4"
              style={{ color: "var(--dicra-accent)" }}
            >
              Our Vision
            </p>
            <h2
              className="text-center font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              Why DRISHTI Exists
            </h2>
            <p
              className="text-center mt-4 text-[16px] max-w-[540px] mx-auto leading-relaxed"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Four ideas that shape everything we build.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {KEY_MESSAGES.map((card) => (
              <ScrollReveal key={card.heading} delay={card.delay}>
                <div
                  className="rounded-2xl p-8 h-full transition-all hover:-translate-y-1"
                  style={{
                    background: "var(--dicra-surface)",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
                    border: "1px solid var(--dicra-border)",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "var(--dicra-accent-subtle)" }}
                  >
                    <card.icon size={22} style={{ color: "var(--dicra-accent)" }} />
                  </div>

                  {/* Heading */}
                  <h3
                    className="font-bold text-[18px] tracking-[-0.3px] leading-snug mb-3"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {card.heading}
                  </h3>

                  {/* Body */}
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {card.body}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS STRIP
         ══════════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{
          background: "var(--dicra-brand)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "784", label: "Districts covered" },
              { value: "36", label: "States & Union Territories" },
              { value: "7", label: "Climate indicators" },
              { value: "5-yr", label: "Climatological baseline" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="font-black tracking-tight"
                  style={{
                    fontSize: "clamp(28px, 4vw, 44px)",
                    color: "var(--dicra-accent)",
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="mt-1 text-[13px] font-medium"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          DATA SOURCES
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
                fontSize: "clamp(26px, 4vw, 40px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              Open, Authoritative Sources Only
            </h2>
            <p
              className="text-center mt-4 text-[16px] max-w-[560px] mx-auto leading-relaxed"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Every indicator traces to a published government or institutional
              dataset. No proprietary estimates. No black boxes. Full lineage
              available in the methodology documentation.
            </p>
          </ScrollReveal>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                resolution: "1 km monthly composite",
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
                    border: "1px solid var(--dicra-border)",
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
          CTA
         ══════════════════════════════════════════════════════════════ */}
      <section className="py-24" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[600px] mx-auto px-8 text-center">
          <ScrollReveal>
            <h2
              className="font-black tracking-[-1px] leading-tight"
              style={{
                fontSize: "clamp(26px, 4vw, 38px)",
                color: "var(--dicra-text-primary)",
              }}
            >
              See the intelligence in action
            </h2>
            <p
              className="mt-4 text-[16px] leading-relaxed"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Explore district-level climate risk scores, trend charts, and
              indicator breakdowns across all 784 districts.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-bold transition-all hover:scale-105"
              style={{
                background: "var(--dicra-brand)",
                color: "#fff",
              }}
            >
              Open Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
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
            <span
              className="flex h-6 w-6 items-center justify-center rounded font-black text-[10px] text-white"
              style={{
                background: "linear-gradient(135deg, var(--dicra-accent), #059669)",
              }}
            >
              D
            </span>
            <span>
              <span className="font-bold tracking-wide">DRISHTI</span> · District
              Risk Intelligence System for Hazard Tracking in India
            </span>
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
              <img
                src="https://www.intellecap.com/wp-content/uploads/2020/05/Intellecap-Logo.png"
                alt="Intellecap"
                className="h-5 object-contain"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

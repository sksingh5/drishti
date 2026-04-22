import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { INDICATOR_LIST } from "@/lib/indicators";
import { SOURCE_LIST, RELIABILITY_STYLES } from "@/lib/sources";
import { getIndicatorStatus } from "@/lib/queries";
import {
  BarChart3,
  Database,
  MapPin,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default async function LandingPage() {
  const supabase = await createClient();
  const { count: districtCount } = await supabase.from("districts").select("id", { count: "exact", head: true });
  const { count: stateCount } = await supabase.from("states").select("id", { count: "exact", head: true });
  const indicatorStatus = await getIndicatorStatus();

  return (
    <div className="min-h-screen" style={{ background: "var(--dicra-bg)" }}>
      {/* ── Navigation Bar ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: "var(--dicra-surface)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "var(--dicra-brand)" }}
            >
              D
            </div>
            <div>
              <span
                className="font-bold text-lg"
                style={{ color: "var(--dicra-text-primary)" }}
              >
                DiCRA
              </span>
              <span
                className="block text-xs -mt-1"
                style={{ color: "var(--dicra-text-muted)" }}
              >
                Climate Risk Analytics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/methodology"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              Methodology
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--dicra-brand)" }}
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-16 pb-20" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1200px] mx-auto px-8 text-center">
          <h1
            className="font-extrabold leading-tight"
            style={{
              fontSize: "40px",
              color: "var(--dicra-text-primary)",
            }}
          >
            District-level climate risk intelligence for India
          </h1>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: "var(--dicra-text-secondary)" }}
          >
            Transparent, peer-reviewed indicators across {districtCount ?? 784} districts — built
            for policy makers, disaster management authorities, and climate
            researchers.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--dicra-brand)" }}
            >
              Explore Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold border-2 transition-opacity hover:opacity-80"
              style={{
                borderColor: "var(--dicra-brand)",
                color: "var(--dicra-brand)",
              }}
            >
              <BookOpen className="w-5 h-5" />
              Read Methodology
            </Link>
          </div>

          {/* Credibility strip */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: BarChart3, label: `${INDICATOR_LIST.length} Indicators` },
              { icon: MapPin, label: `${districtCount ?? 784} Districts` },
              { icon: Shield, label: "Peer-Reviewed" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: "var(--dicra-text-muted)" }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="py-20" style={{ background: "var(--dicra-surface)" }}>
        <div className="max-w-[1200px] mx-auto px-8">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            Why district-level climate risk matters
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Climate Vulnerability",
                accent: "var(--dicra-risk-critical)",
                text: "India ranks among the most climate-vulnerable nations. Extreme weather events \u2014 droughts, floods, heat waves \u2014 have intensified over the past decade, disproportionately impacting rural districts with limited adaptive capacity.",
              },
              {
                title: "Data Fragmentation",
                accent: "var(--dicra-ind-rainfall)",
                text: "IMD, ISRO, ECMWF, and NASA publish climate data independently in different formats, resolutions, and timelines. No unified, district-level risk view exists for state and district administrators.",
              },
              {
                title: "The Decision Gap",
                accent: "var(--dicra-risk-moderate)",
                text: "Policy makers allocate disaster preparedness resources based on national or state averages. District-level granularity is essential for targeted intervention \u2014 the difference between effective response and wasted budgets.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-[var(--dicra-radius-lg)] border overflow-hidden"
                style={{
                  borderColor: "var(--dicra-border)",
                  background: "var(--dicra-surface)",
                }}
              >
                <div className="h-1" style={{ background: card.accent }} />
                <div className="p-6">
                  <h3
                    className="font-semibold text-lg"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What DiCRA Provides ── */}
      <section className="py-20" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1200px] mx-auto px-8">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            Six indicators, one composite risk score
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDICATOR_LIST.map((ind) => (
              <div
                key={ind.key}
                className="rounded-[var(--dicra-radius-lg)] border p-6"
                style={{
                  borderColor: "var(--dicra-border)",
                  background: "var(--dicra-surface)",
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: ind.color }}
                  />
                  <h3
                    className="font-semibold"
                    style={{ color: "var(--dicra-text-primary)" }}
                  >
                    {ind.label}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--dicra-text-secondary)" }}
                >
                  {ind.explainer.split(". ")[0]}.
                </p>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-block text-xs px-2 py-1 rounded font-medium"
                    style={{
                      background: "var(--dicra-surface-muted)",
                      color: "var(--dicra-text-muted)",
                    }}
                  >
                    {ind.source}
                  </span>
                  <span
                    className="inline-block text-xs px-2 py-1 rounded"
                    style={{
                      background: "var(--dicra-surface-muted)",
                      color: "var(--dicra-text-muted)",
                    }}
                  >
                    {ind.resolution} &middot; {ind.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data Sources & Trust ── */}
      <section className="py-20" style={{ background: "var(--dicra-surface)" }}>
        <div className="max-w-[1200px] mx-auto px-8">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            Every number traces to a real source
          </h2>

          {/* Trust banner */}
          <div
            className="mt-8 rounded-[var(--dicra-radius-lg)] p-6 text-white text-sm leading-relaxed text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--dicra-brand), var(--dicra-brand-mid))",
            }}
          >
            <Database className="w-6 h-6 mx-auto mb-3 opacity-90" />
            <strong>Transparency guarantee:</strong> DiCRA does not generate or
            estimate data. All scores are computed from published government and
            institutional datasets using transparent, peer-reviewed
            methodologies. Every indicator links to its source dataset with full
            provenance.
          </div>

          {/* Source cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOURCE_LIST.map((src) => {
              const style = RELIABILITY_STYLES[src.reliability];
              return (
                <div
                  key={src.key}
                  className="rounded-[var(--dicra-radius-lg)] border p-6"
                  style={{
                    borderColor: "var(--dicra-border)",
                    background: "var(--dicra-bg)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                      className="font-semibold text-sm"
                      style={{ color: "var(--dicra-text-primary)" }}
                    >
                      {src.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap"
                      style={{ background: style.bg, color: style.text }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {src.description}
                  </p>
                  <div
                    className="mt-3 text-xs"
                    style={{ color: "var(--dicra-text-muted)" }}
                  >
                    {src.resolution} &middot; {src.frequency} &middot;{" "}
                    {src.coverage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Platform Status ── */}
      <section className="py-20" style={{ background: "var(--dicra-bg)" }}>
        <div className="max-w-[1200px] mx-auto px-8">
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            Platform Status &mdash; What&apos;s Live
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INDICATOR_LIST.map((ind) => {
              const status = indicatorStatus.find(
                (s) => s.indicator_type === ind.key,
              );
              const isLive = !!status && status.district_count > 0;

              return (
                <div
                  key={ind.key}
                  className="rounded-[var(--dicra-radius-lg)] border p-5 flex items-start gap-4"
                  style={{
                    borderColor: "var(--dicra-border)",
                    background: "var(--dicra-surface)",
                  }}
                >
                  {isLive ? (
                    <CheckCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--dicra-risk-low)" }}
                    />
                  ) : (
                    <Clock
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--dicra-text-muted)" }}
                    />
                  )}
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--dicra-text-primary)" }}
                    >
                      {ind.label}
                    </p>
                    {isLive ? (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--dicra-text-secondary)" }}
                      >
                        Live &mdash; {status.district_count} districts &middot;{" "}
                        {new Date(status.latest_period).toLocaleDateString(
                          "en-IN",
                          { month: "long", year: "numeric" },
                        )}
                      </p>
                    ) : (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--dicra-text-muted)" }}
                      >
                        Coming Soon
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="py-20" style={{ background: "var(--dicra-surface)" }}>
        <div className="max-w-[1200px] mx-auto px-8 text-center">
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            Ready to explore?
          </h2>
          <p
            className="mt-3 text-base"
            style={{ color: "var(--dicra-text-secondary)" }}
          >
            Dive into district-level climate risk data for all of India.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-lg text-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--dicra-brand)" }}
          >
            Open Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="border-t py-8"
        style={{
          background: "var(--dicra-bg)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <div
          className="max-w-[1200px] mx-auto px-8 text-center text-xs"
          style={{ color: "var(--dicra-text-muted)" }}
        >
          <p>DiCRA v2.0 &middot; District Climate Risk Analytics</p>
          <p className="mt-1">
            Data sources: IMD Pune, Copernicus ERA5-Land, NASA MODIS, ECMWF
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { INDICATORS } from "@/lib/indicators";
import type { IndicatorType } from "@/lib/indicators";

// Local type definitions — will be deduped once lib/crop-data.ts is stable
export interface CropAlert {
  indicator: string;
  score: number;
  alert: string;
}

export interface CropAdvisory {
  crop: string;
  zone: string;
  alerts: CropAlert[];
  guidance: string[];
}

const CROP_EMOJI: Record<string, string> = {
  Rice: "🌾",
  Wheat: "🌾",
  "Pearl Millet": "🌾",
  Sorghum: "🌾",
  Cotton: "🏵️",
  Sugarcane: "🎋",
  Soybean: "🫘",
  "Pigeon Pea": "🫘",
  Groundnut: "🥜",
  Maize: "🌽",
  Potato: "🥔",
  Tea: "🍵",
  Coconut: "🥥",
  Mustard: "🌼",
  Apple: "🍎",
};

function getCropEmoji(crop: string): string {
  return CROP_EMOJI[crop] ?? "🌱";
}

function getIndicatorShortLabel(indicatorKey: string): string {
  const meta = INDICATORS[indicatorKey as IndicatorType];
  return meta?.shortLabel ?? indicatorKey;
}

interface CropAdvisoryCardProps {
  advisory: CropAdvisory;
}

export function CropAdvisoryCard({ advisory }: CropAdvisoryCardProps) {
  const { crop, zone, alerts, guidance } = advisory;
  const hasAlerts = alerts.length > 0;

  return (
    <div
      className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none" aria-hidden="true">
          {getCropEmoji(crop)}
        </span>
        <div className="flex flex-col min-w-0">
          <span
            className="text-[15px] font-bold leading-tight truncate"
            style={{ color: "var(--dicra-text-primary)" }}
          >
            {crop}
          </span>
          <span
            className="text-[10px] uppercase tracking-wide font-medium truncate"
            style={{ color: "var(--dicra-text-muted)" }}
          >
            {zone}
          </span>
        </div>
      </div>

      {/* Alerts section */}
      <div className="flex flex-col gap-2">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.8px]"
          style={{ color: "var(--dicra-text-secondary)" }}
        >
          Alerts
        </div>

        {hasAlerts ? (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 rounded-lg px-3 py-2 border border-[var(--dicra-border)]"
                style={{ background: "var(--dicra-surface-muted)" }}
              >
                <AlertTriangle
                  size={13}
                  className="mt-[1px] shrink-0"
                  style={{ color: "var(--dicra-risk-high)" }}
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--dicra-risk-high)" }}
                    >
                      {getIndicatorShortLabel(alert.indicator)}
                    </span>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: "var(--dicra-text-primary)" }}
                    >
                      {alert.score}
                    </span>
                  </div>
                  <span
                    className="text-[11px] leading-snug"
                    style={{ color: "var(--dicra-text-secondary)" }}
                  >
                    {alert.alert}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 border border-[var(--dicra-border)]"
            style={{ background: "var(--dicra-surface-muted)" }}
          >
            <CheckCircle
              size={13}
              className="shrink-0"
              style={{ color: "var(--dicra-risk-low)" }}
            />
            <span
              className="text-[11px]"
              style={{ color: "var(--dicra-text-secondary)" }}
            >
              No active alerts for {crop}
            </span>
          </div>
        )}
      </div>

      {/* General Guidance section */}
      {guidance.length > 0 && (
        <div className="flex flex-col gap-2">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.8px]"
            style={{ color: "var(--dicra-text-secondary)" }}
          >
            General Guidance
          </div>
          <ul className="flex flex-col gap-2">
            {guidance.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Lightbulb
                  size={13}
                  className="mt-[1px] shrink-0"
                  style={{ color: "var(--dicra-accent)" }}
                />
                <span
                  className="text-[11px] leading-snug"
                  style={{ color: "var(--dicra-text-secondary)" }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

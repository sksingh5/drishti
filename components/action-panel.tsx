"use client";

import { AlertTriangle, AlertCircle } from "lucide-react";
import { INDICATORS } from "@/lib/indicators";
import type { TriggeredAction } from "@/lib/action-rules";

interface ActionPanelProps {
  actions: TriggeredAction[];
}

const AUDIENCE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  banker: { label: "Banker", color: "var(--dicra-ind-rainfall)", bg: "rgba(59,130,246,0.1)" },
  planner: { label: "Planner", color: "var(--dicra-ind-vegetation)", bg: "rgba(34,197,94,0.1)" },
  both: { label: "All", color: "var(--dicra-text-muted)", bg: "var(--dicra-surface-muted)" },
};

export function ActionPanel({ actions }: ActionPanelProps) {
  return (
    <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[13px] font-bold" style={{ color: "var(--dicra-text-primary)" }}>
          Recommended Actions
        </span>
        {actions.length > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{
              background: "var(--dicra-risk-critical-bg)",
              color: "var(--dicra-risk-critical)",
            }}
          >
            {actions.length}
          </span>
        )}
      </div>

      {actions.length === 0 ? (
        <div className="text-[11px] italic py-2" style={{ color: "var(--dicra-text-faint)" }}>
          No compound alerts triggered
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {actions.map((action) => {
            const isCritical = action.severity === "critical";
            return (
              <div
                key={action.id}
                className="rounded-[var(--dicra-radius-sm)] border p-3"
                style={{
                  borderColor: isCritical ? "var(--dicra-risk-critical)" : "var(--dicra-risk-high)",
                  background: isCritical ? "var(--dicra-risk-critical-bg)" : "var(--dicra-risk-high-bg)",
                }}
              >
                {/* Severity icon + action text */}
                <div className="flex items-start gap-2">
                  {isCritical ? (
                    <AlertTriangle
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--dicra-risk-critical)" }}
                    />
                  ) : (
                    <AlertCircle
                      size={14}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "var(--dicra-risk-high)" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[12px] font-semibold leading-snug"
                      style={{
                        color: isCritical ? "var(--dicra-risk-critical)" : "var(--dicra-risk-high)",
                      }}
                    >
                      {action.action}
                    </div>

                    {/* Indicator chips */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {action.triggeredIndicators.map((ind) => {
                        const meta = INDICATORS[ind as keyof typeof INDICATORS];
                        const label = meta?.shortLabel ?? ind;
                        return (
                          <span
                            key={ind}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{
                              background: "var(--dicra-surface)",
                              color: "var(--dicra-text-secondary)",
                              border: "1px solid var(--dicra-border)",
                            }}
                          >
                            {label}
                          </span>
                        );
                      })}

                      {/* Audience badge */}
                      {(() => {
                        const aud = AUDIENCE_LABELS[action.audience] ?? AUDIENCE_LABELS.both;
                        return (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                            style={{ background: aud.bg, color: aud.color }}
                          >
                            {aud.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { AlertTriangle, Bell, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/stat-card";
import { SourceFooter } from "@/components/source-footer";
import { INDICATORS, IndicatorType } from "@/lib/indicators";

export function AlertsDashboard({ alerts: rawAlerts }: { alerts: any[] }) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const alerts = rawAlerts.map((a: any) => ({
    id: a.id,
    district_name: a.districts?.name || "Unknown",
    state_name: a.districts?.states?.name || "Unknown",
    indicator_type: a.alert_thresholds?.indicator_type as IndicatorType,
    threshold_value: a.alert_thresholds?.threshold_value,
    severity: a.alert_thresholds?.severity as "warning" | "critical",
    current_value: a.current_value,
    triggered_at: a.triggered_at,
  }));

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;
  const filtered = severityFilter === "all" ? alerts : alerts.filter((a: any) => a.severity === severityFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6" style={{ background: "var(--dicra-bg)" }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--dicra-text-primary)" }}>Active Alerts</h1>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Active Alerts"
          value={alerts.length}
          accentColor="var(--dicra-brand)"
          iconBg="var(--dicra-surface-muted)"
          icon={<Bell size={16} style={{ color: "var(--dicra-brand)" }} />}
        />
        <StatCard
          label="Critical Alerts"
          value={criticalCount}
          accentColor="var(--dicra-risk-critical)"
          iconBg="var(--dicra-risk-critical-bg)"
          icon={<AlertTriangle size={16} style={{ color: "var(--dicra-risk-critical)" }} />}
          total={alerts.length}
        />
        <StatCard
          label="Warning Alerts"
          value={warningCount}
          accentColor="var(--dicra-risk-high)"
          iconBg="var(--dicra-risk-high-bg)"
          icon={<TrendingUp size={16} style={{ color: "var(--dicra-risk-high)" }} />}
          total={alerts.length}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center" style={{ color: "var(--dicra-text-faint)" }}>No active alerts</p>
      ) : (
        <div className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] bg-[var(--dicra-surface)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow style={{ background: "var(--dicra-surface-muted)" }}>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>District</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>State</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>Indicator</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>Score</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>Threshold</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>Severity</TableHead>
                <TableHead style={{ color: "var(--dicra-text-secondary)" }}>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert: any) => (
                <TableRow
                  key={alert.id}
                  className="relative"
                  style={{ borderLeft: `3px solid ${alert.severity === "critical" ? "var(--dicra-risk-critical)" : "var(--dicra-risk-high)"}` }}
                >
                  <TableCell className="font-medium" style={{ color: "var(--dicra-text-primary)" }}>{alert.district_name}</TableCell>
                  <TableCell style={{ color: "var(--dicra-text-secondary)" }}>{alert.state_name}</TableCell>
                  <TableCell style={{ color: "var(--dicra-text-secondary)" }}>{INDICATORS[alert.indicator_type as IndicatorType]?.label ?? alert.indicator_type}</TableCell>
                  <TableCell style={{ color: "var(--dicra-text-primary)" }}>{alert.current_value}</TableCell>
                  <TableCell style={{ color: "var(--dicra-text-muted)" }}>{alert.threshold_value}</TableCell>
                  <TableCell>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-[5px]"
                      style={{
                        background: alert.severity === "critical" ? "var(--dicra-risk-critical-bg)" : "var(--dicra-risk-high-bg)",
                        color: alert.severity === "critical" ? "var(--dicra-risk-critical)" : "var(--dicra-risk-high)",
                      }}
                    >
                      {alert.severity}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: "var(--dicra-text-muted)" }}>{new Date(alert.triggered_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SourceFooter />
    </div>
  );
}

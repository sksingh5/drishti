"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INDICATOR_LABELS, IndicatorType } from "@/lib/types";

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

  const filtered = severityFilter === "all" ? alerts : alerts.filter((a: any) => a.severity === severityFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Active Alerts</h1>
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-neutral-400">No active alerts</p>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>District</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Indicator</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((alert: any) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.district_name}</TableCell>
                  <TableCell>{alert.state_name}</TableCell>
                  <TableCell>{INDICATOR_LABELS[alert.indicator_type as IndicatorType] || alert.indicator_type}</TableCell>
                  <TableCell>{alert.current_value}</TableCell>
                  <TableCell>{alert.threshold_value}</TableCell>
                  <TableCell><Badge variant={alert.severity === "critical" ? "destructive" : "outline"}>{alert.severity}</Badge></TableCell>
                  <TableCell className="text-neutral-500">{new Date(alert.triggered_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

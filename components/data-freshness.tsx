"use client";
import { useEffect, useState } from "react";
import { DataSourceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DataFreshness() {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  useEffect(() => { fetch("/api/data-freshness").then(r => r.json()).then(setSources).catch(() => {}); }, []);
  if (sources.length === 0) return null;

  const worstStatus = sources.some(s => s.status === "error") ? "error"
    : sources.some(s => s.status === "stale") ? "stale"
    : sources.some(s => s.status === "pending") ? "pending" : "ok";

  const statusColor = { ok: "bg-green-500", stale: "bg-yellow-500", error: "bg-red-500", pending: "bg-neutral-400" }[worstStatus];
  const latestFetch = sources.filter(s => s.last_fetched).sort((a, b) => (b.last_fetched! > a.last_fetched! ? 1 : -1))[0];

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span className={cn("h-2 w-2 rounded-full", statusColor)} />
      <span>{latestFetch?.last_fetched ? `Updated ${new Date(latestFetch.last_fetched).toLocaleDateString()}` : "No data yet"}</span>
    </div>
  );
}

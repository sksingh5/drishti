"use client";

import { useEffect, useState } from "react";
import { SourceChip } from "./source-chip";
import { SOURCE_LIST } from "@/lib/sources";

interface FreshnessEntry {
  source_name: string;
  status: "ok" | "stale" | "error" | "pending";
  last_fetched: string | null;
}

export function SourceFooter() {
  const [entries, setEntries] = useState<FreshnessEntry[]>([]);

  useEffect(() => {
    fetch("/api/data-freshness")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => {});
  }, []);

  const chips = SOURCE_LIST.map((src) => {
    const entry = entries.find((e) => e.source_name === src.key);
    return {
      name: src.shortName,
      status: entry?.status ?? ("pending" as const),
      lastFetched: entry?.last_fetched ?? null,
    };
  });

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {chips.map((c) => (
        <SourceChip key={c.name} name={c.name} status={c.status} lastFetched={c.lastFetched} />
      ))}
    </div>
  );
}

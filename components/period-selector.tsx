"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [periods, setPeriods] = useState<string[]>([]);
  const selected = searchParams.get("period") || "";

  useEffect(() => {
    fetch("/api/periods")
      .then((r) => r.json())
      .then((data: string[]) => setPeriods(data))
      .catch(() => {});
  }, []);

  function formatPeriod(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("period", value);
    } else {
      params.delete("period");
    }
    router.push(`?${params.toString()}`);
  }

  if (periods.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Calendar size={14} style={{ color: "var(--dicra-text-muted)" }} />
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="text-[11px] font-bold uppercase tracking-[0.5px] px-2.5 py-1.5 rounded-[var(--dicra-radius-sm)] border appearance-none cursor-pointer pr-6"
        style={{
          background: "var(--dicra-surface-muted)",
          color: "var(--dicra-text-secondary)",
          borderColor: "var(--dicra-border)",
        }}
      >
        <option value="">Latest Period</option>
        {periods.map((p) => (
          <option key={p} value={p}>
            {formatPeriod(p)}
          </option>
        ))}
      </select>
    </div>
  );
}

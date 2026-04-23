import { BreadcrumbSkeleton, TableRowSkeleton } from "@/components/skeletons";

export default function StateLoading() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Breadcrumb + state header */}
      <BreadcrumbSkeleton />

      <div className="mb-6">
        <div className="h-7 w-48 rounded bg-[var(--dicra-border)] animate-pulse mb-2" />
        <div className="h-3 w-64 rounded bg-[var(--dicra-border)] animate-pulse" />
      </div>

      {/* Table header */}
      <div
        className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden"
        style={{ background: "var(--dicra-surface)" }}
      >
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--dicra-border)]"
             style={{ background: "var(--dicra-surface-muted)" }}>
          <div className="h-3 w-8 rounded bg-[var(--dicra-border)] animate-pulse" />
          <div className="h-3 w-24 rounded bg-[var(--dicra-border)] animate-pulse flex-1" />
          <div className="h-3 w-16 rounded bg-[var(--dicra-border)] animate-pulse" />
          <div className="h-3 w-12 rounded bg-[var(--dicra-border)] animate-pulse" />
        </div>
        {/* 10 row skeletons */}
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { StatCardSkeleton, IndicatorCardSkeleton, MapSkeleton } from "@/components/skeletons";

export default function DashboardLoading() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Map area */}
      <div className="mb-6">
        <MapSkeleton />
      </div>
      {/* Indicator cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <IndicatorCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

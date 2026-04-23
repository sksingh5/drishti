import {
  BreadcrumbSkeleton,
  HeroSkeleton,
  IndicatorCardSkeleton,
  TrendChartSkeleton,
} from "@/components/skeletons";

export default function DistrictLoading() {
  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <BreadcrumbSkeleton />

      {/* Hero row */}
      <HeroSkeleton />

      {/* 6 Indicator cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <IndicatorCardSkeleton key={i} />
        ))}
      </div>

      {/* Two-column: Trend chart + Data sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <TrendChartSkeleton />
        <TrendChartSkeleton />
      </div>
    </div>
  );
}

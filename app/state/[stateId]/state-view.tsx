"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DistrictWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { RiskBadge } from "@/components/risk-badge";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface Props { state: { id: number; lgd_code: number; name: string }; districts: DistrictWithScore[]; }

export function StateView({ state, districts }: Props) {
  const router = useRouter();
  const { weights } = useWeights();

  const districtsWithComposite = districts
    .map(d => ({ ...d, composite_score: computeCompositeScore(d.indicator_scores, weights) }))
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0));

  const mapFeatures = districtsWithComposite.map(d => ({ id: d.id, lgd_code: d.lgd_code, name: d.name, score: d.composite_score }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">India</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>{state.name}</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="mb-4 text-2xl font-bold text-neutral-900">{state.name}</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative h-[500px] overflow-hidden rounded-lg border bg-white">
            <ChoroplethMap geojsonUrl="/geo/districts.json" features={mapFeatures} onFeatureClick={f => router.push(`/district/${f.id}`)} />
            <div className="absolute bottom-4 left-4"><MapLegend /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">District Rankings ({districts.length})</h3>
          <div className="max-h-[450px] space-y-1 overflow-y-auto">
            {districtsWithComposite.map((d, i) => (
              <Link key={d.id} href={`/district/${d.id}`} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100">
                <span><span className="mr-2 text-neutral-400">{i + 1}.</span>{d.name}</span>
                <RiskBadge score={d.composite_score} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

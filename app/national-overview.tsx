"use client";
import { useRouter } from "next/navigation";
import { StateWithScore } from "@/lib/types";
import { ChoroplethMap } from "@/components/map/choropleth-map";
import { MapLegend } from "@/components/map/map-legend";
import { StateRanking } from "@/components/state-ranking";
import { useWeights } from "@/components/weight-provider";
import { computeCompositeScore } from "@/lib/scoring-client";

export function NationalOverview({ states }: { states: StateWithScore[] }) {
  const router = useRouter();
  const { weights } = useWeights();

  const mapFeatures = states.map(s => ({
    id: s.id,
    lgd_code: s.lgd_code,
    name: s.name,
    score: computeCompositeScore(s.indicator_scores, weights),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold text-neutral-900">Climate Risk — National Overview</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="relative h-[600px] overflow-hidden rounded-lg border bg-white">
            <ChoroplethMap geojsonUrl="/geo/states.json" features={mapFeatures} onFeatureClick={f => router.push(`/state/${f.id}`)} fitBounds={[[68, 6], [98, 37]]} />
            <div className="absolute bottom-4 left-4"><MapLegend /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <StateRanking states={states} />
        </div>
      </div>
    </div>
  );
}

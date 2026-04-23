"use client";

import { CropAdvisoryCard, type CropAdvisory } from "@/components/crop-advisory-card";

interface CropAdvisorySectionProps {
  advisories: CropAdvisory[];
  zoneName: string;
  districtName: string;
}

export function CropAdvisorySection({ advisories, zoneName, districtName }: CropAdvisorySectionProps) {
  return (
    <div>
      {/* Zone label */}
      <div className="mb-4">
        <div className="text-[11px] font-semibold" style={{ color: "var(--dicra-text-muted)" }}>
          Agro-Climatic Zone: {zoneName}
        </div>
        <div className="text-[13px] font-bold mt-1" style={{ color: "var(--dicra-text-primary)" }}>
          Advisory for Major Crops in {districtName}
        </div>
      </div>

      {/* Crop Advisory Cards */}
      {advisories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {advisories.map(a => (
            <CropAdvisoryCard key={a.crop} advisory={a} />
          ))}
        </div>
      ) : (
        <div className="text-[12px] text-center py-8" style={{ color: "var(--dicra-text-faint)" }}>
          Crop data not yet available for this district.
        </div>
      )}
    </div>
  );
}

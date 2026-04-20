"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightSliders } from "@/components/weight-sliders";
import { useWeights } from "@/components/weight-provider";
import { WeightProfile } from "@/lib/types";

export default function WeightsPage() {
  const { resetToDefaults, applyPreset } = useWeights();
  const [presets, setPresets] = useState<WeightProfile[]>([]);
  useEffect(() => { fetch("/api/weight-presets").then(r => r.json()).then(setPresets); }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Weight Configuration</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Indicator Weights</CardTitle></CardHeader>
          <CardContent>
            <WeightSliders />
            <Button variant="outline" className="mt-4 w-full" onClick={resetToDefaults}>Reset to Defaults</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Presets</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {presets.map(preset => (
              <Button key={preset.name} variant="outline" className="w-full justify-start" onClick={() => applyPreset(preset.weights)}>
                <div className="text-left"><div className="font-medium">{preset.name}</div></div>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

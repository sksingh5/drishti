"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { IndicatorType, DEFAULT_WEIGHTS } from "@/lib/types";
import { loadWeights, saveWeights, rebalanceWeights } from "@/lib/weights";

interface WeightContextValue {
  weights: Record<IndicatorType, number>;
  setWeight: (key: IndicatorType, value: number) => void;
  resetToDefaults: () => void;
  applyPreset: (weights: Record<IndicatorType, number>) => void;
}

const WeightContext = createContext<WeightContextValue | null>(null);

export function WeightProvider({ children }: { children: ReactNode }) {
  const [weights, setWeights] = useState<Record<IndicatorType, number>>(DEFAULT_WEIGHTS);

  useEffect(() => { setWeights(loadWeights()); }, []);

  const setWeight = (key: IndicatorType, value: number) => {
    const newWeights = rebalanceWeights(weights, key, value);
    setWeights(newWeights);
    saveWeights(newWeights);
  };

  const resetToDefaults = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    saveWeights({ ...DEFAULT_WEIGHTS });
  };

  const applyPreset = (preset: Record<IndicatorType, number>) => {
    setWeights(preset);
    saveWeights(preset);
  };

  return (
    <WeightContext.Provider value={{ weights, setWeight, resetToDefaults, applyPreset }}>
      {children}
    </WeightContext.Provider>
  );
}

export function useWeights() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeights must be used within WeightProvider");
  return ctx;
}

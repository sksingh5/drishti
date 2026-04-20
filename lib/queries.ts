import { createClient } from "@/lib/supabase/server";

export async function getStatesWithLatestScores() {
  const supabase = await createClient();
  const { data: states } = await supabase.from("states").select("id, lgd_code, name, area_sq_km").order("name");
  if (!states) return [];

  // Get latest indicators per district, aggregate to state level
  const { data: scores } = await supabase.from("climate_indicators")
    .select("district_id, indicator_type, score, districts!inner(state_id)")
    .order("period_start", { ascending: false });

  const stateScores = new Map<number, Map<string, number[]>>();
  if (scores) {
    for (const row of scores as any[]) {
      const stateId = row.districts?.state_id;
      if (!stateId) continue;
      if (!stateScores.has(stateId)) stateScores.set(stateId, new Map());
      const indicators = stateScores.get(stateId)!;
      if (!indicators.has(row.indicator_type)) indicators.set(row.indicator_type, []);
      indicators.get(row.indicator_type)!.push(row.score);
    }
  }

  return states.map((s: any) => {
    const indicators = stateScores.get(s.id);
    const indicator_scores: Record<string, number> = {};
    if (indicators) {
      for (const [type, values] of indicators) {
        indicator_scores[type] = Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length);
      }
    }
    return { ...s, indicator_scores };
  });
}

export async function getDistrictsForState(stateId: number) {
  const supabase = await createClient();
  const { data: districts } = await supabase.from("districts").select("id, lgd_code, name, area_sq_km, state_id").eq("state_id", stateId).order("name");
  if (!districts) return [];

  const districtIds = districts.map((d: any) => d.id);
  const { data: scores } = await supabase.from("climate_indicators").select("district_id, indicator_type, score").in("district_id", districtIds).order("period_start", { ascending: false });

  const scoreMap = new Map<number, Record<string, number>>();
  if (scores) {
    for (const row of scores as any[]) {
      if (!scoreMap.has(row.district_id)) scoreMap.set(row.district_id, {});
      const existing = scoreMap.get(row.district_id)!;
      if (!existing[row.indicator_type]) existing[row.indicator_type] = row.score;
    }
  }

  return districts.map((d: any) => ({ ...d, indicator_scores: scoreMap.get(d.id) || {} }));
}

export async function getDistrictDetail(districtId: number) {
  const supabase = await createClient();
  const { data: district } = await supabase.from("districts").select("id, lgd_code, name, area_sq_km, state_id, states(name)").eq("id", districtId).single();
  const { data: scores } = await supabase.from("climate_indicators").select("indicator_type, value, score, period_start, period_end, source").eq("district_id", districtId).order("period_start", { ascending: false }).limit(6);
  return { district, latest_scores: scores || [] };
}

export async function getDistrictHistory(districtId: number) {
  const supabase = await createClient();
  const { data } = await supabase.from("climate_indicators").select("indicator_type, value, score, period_start").eq("district_id", districtId).order("period_start", { ascending: true });
  return data || [];
}

export async function getAlerts() {
  const supabase = await createClient();
  const { data } = await supabase.from("alert_events").select("id, district_id, current_value, triggered_at, acknowledged, districts(name, state_id, states(name)), alert_thresholds(indicator_type, threshold_value, severity)").eq("acknowledged", false).order("triggered_at", { ascending: false }).limit(200);
  return data || [];
}

export async function getDataFreshness() {
  const supabase = await createClient();
  const { data } = await supabase.from("data_sources").select("source_name, description, last_fetched, status, fetch_frequency").order("source_name");
  return data || [];
}

export async function getWeightPresets() {
  const supabase = await createClient();
  const { data } = await supabase.from("risk_score_defaults").select("name, description, weights").order("name");
  return data || [];
}

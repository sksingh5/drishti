import { createClient } from "@/lib/supabase/server";

export async function getStatesWithLatestScores() {
  const supabase = await createClient();
  const { data: states } = await supabase.from("states").select("id, lgd_code, name, area_sq_km").order("name");
  if (!states) return [];

  // Build district→state mapping (no FK on climate_indicators, so we can't join via REST)
  const districtToState = new Map<number, number>();
  let dOffset = 0;
  while (true) {
    const { data: batch } = await supabase.from("districts")
      .select("id, state_id")
      .range(dOffset, dOffset + 999);
    if (!batch || batch.length === 0) break;
    for (const d of batch) districtToState.set(d.id, d.state_id);
    if (batch.length < 1000) break;
    dOffset += 1000;
  }

  // Fetch all indicator scores (paginated)
  const scores: any[] = [];
  let offset = 0;
  while (true) {
    const { data: batch } = await supabase.from("climate_indicators")
      .select("district_id, indicator_type, score")
      .order("period_start", { ascending: false })
      .range(offset, offset + 999);
    if (!batch || batch.length === 0) break;
    scores.push(...batch);
    if (batch.length < 1000) break;
    offset += 1000;
  }

  // Aggregate to state level using the district→state mapping
  const stateScores = new Map<number, Map<string, number[]>>();
  for (const row of scores) {
    const stateId = districtToState.get(row.district_id);
    if (!stateId) continue;
    if (!stateScores.has(stateId)) stateScores.set(stateId, new Map());
    const indicators = stateScores.get(stateId)!;
    if (!indicators.has(row.indicator_type)) indicators.set(row.indicator_type, []);
    indicators.get(row.indicator_type)!.push(row.score);
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
  // Paginate to avoid Supabase's default 1000-row limit
  const scores: any[] = [];
  let offset = 0;
  while (true) {
    const { data: batch } = await supabase.from("climate_indicators")
      .select("district_id, indicator_type, score")
      .in("district_id", districtIds)
      .order("period_start", { ascending: false })
      .range(offset, offset + 999);
    if (!batch || batch.length === 0) break;
    scores.push(...batch);
    if (batch.length < 1000) break;
    offset += 1000;
  }

  const scoreMap = new Map<number, Record<string, number>>();
  if (scores.length > 0) {
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

export async function getIndicatorStatus(): Promise<
  { indicator_type: string; district_count: number; latest_period: string }[]
> {
  const supabase = await createClient();

  // Fetch indicator data — paginate to handle large datasets
  const allRows: { indicator_type: string; district_id: number; period_start: string }[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("climate_indicators")
      .select("indicator_type, district_id, period_start")
      .order("period_start", { ascending: false })
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allRows.push(...(data as any[]));
    if (data.length < 1000) break;
    offset += 1000;
  }

  if (allRows.length === 0) return [];

  // Group by indicator_type — count distinct districts, find latest period
  const statusMap = new Map<string, { districts: Set<number>; latest: string }>();
  for (const row of allRows) {
    const key = row.indicator_type;
    if (!statusMap.has(key)) {
      statusMap.set(key, { districts: new Set(), latest: row.period_start });
    }
    const entry = statusMap.get(key)!;
    entry.districts.add(row.district_id);
    if (row.period_start > entry.latest) entry.latest = row.period_start;
  }

  return Array.from(statusMap.entries()).map(([type, info]) => ({
    indicator_type: type,
    district_count: info.districts.size,
    latest_period: info.latest,
  }));
}

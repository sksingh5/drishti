import { createClient } from "@/lib/supabase/server";

export async function getStatesWithLatestScores(period?: string) {
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

  // If no period specified, find the latest available period first
  if (!period) {
    const { data: latestRow } = await supabase
      .from("climate_indicators")
      .select("period_start")
      .order("period_start", { ascending: false })
      .limit(1);
    if (latestRow && latestRow.length > 0) {
      period = latestRow[0].period_start;
    }
  }

  // Fetch indicator scores for the target period only (paginated)
  const scores: any[] = [];
  let offset = 0;
  while (true) {
    const { data: batch } = await supabase.from("climate_indicators")
      .select("district_id, indicator_type, score")
      .eq("period_start", period!)
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
  const { data: scores } = await supabase.from("climate_indicators").select("indicator_type, value, score, period_start, period_end, source").eq("district_id", districtId).order("period_start", { ascending: false }).limit(70);
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

  // Use RPC or a direct aggregate query instead of downloading all rows.
  // GROUP BY indicator_type with COUNT(DISTINCT district_id) and MAX(period_start)
  const { data } = await supabase
    .rpc("get_indicator_status");

  if (data && data.length > 0) return data;

  // Fallback: manual aggregation with a single query per indicator type
  // (much faster than paginating the entire table)
  const indicators = [
    "rainfall_anomaly", "heat_stress", "drought_index",
    "vegetation_health", "flood_risk", "soil_moisture",
  ];

  const results: { indicator_type: string; district_count: number; latest_period: string }[] = [];

  for (const ind of indicators) {
    const { data: rows } = await supabase
      .from("climate_indicators")
      .select("district_id, period_start")
      .eq("indicator_type", ind)
      .order("period_start", { ascending: false })
      .limit(1);

    if (rows && rows.length > 0) {
      const { count } = await supabase
        .from("climate_indicators")
        .select("district_id", { count: "exact", head: true })
        .eq("indicator_type", ind)
        .eq("period_start", rows[0].period_start);

      results.push({
        indicator_type: ind,
        district_count: count ?? 0,
        latest_period: rows[0].period_start,
      });
    }
  }

  return results;
}

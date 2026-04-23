import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  // Get distinct period_start values
  const allPeriods: string[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("climate_indicators")
      .select("period_start")
      .order("period_start", { ascending: false })
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (!allPeriods.includes(row.period_start)) {
        allPeriods.push(row.period_start);
      }
    }
    if (data.length < 1000) break;
    offset += 1000;
  }

  return NextResponse.json(allPeriods);
}

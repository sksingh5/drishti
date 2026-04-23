import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  // Paginate to get all districts (may be >1000)
  const allDistricts: any[] = [];
  let offset = 0;
  while (true) {
    const { data } = await supabase
      .from("districts")
      .select("id, name, state_id, states(name)")
      .order("name")
      .range(offset, offset + 999);
    if (!data || data.length === 0) break;
    allDistricts.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return NextResponse.json(allDistricts);
}

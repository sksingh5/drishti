import { NextResponse } from "next/server";
import { getDistrictHistory } from "@/lib/queries";
export async function GET(_req: Request, { params }: { params: Promise<{ districtId: string }> }) {
  const { districtId } = await params;
  const history = await getDistrictHistory(parseInt(districtId));
  return NextResponse.json(history);
}

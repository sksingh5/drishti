import { NextResponse } from "next/server";
import { getDistrictDetail } from "@/lib/queries";
export async function GET(_req: Request, { params }: { params: Promise<{ districtId: string }> }) {
  const { districtId } = await params;
  const detail = await getDistrictDetail(parseInt(districtId));
  return NextResponse.json(detail);
}

import { NextResponse } from "next/server";
import { getDistrictsForState } from "@/lib/queries";
export async function GET(_req: Request, { params }: { params: Promise<{ stateId: string }> }) {
  const { stateId } = await params;
  const districts = await getDistrictsForState(parseInt(stateId));
  return NextResponse.json(districts);
}

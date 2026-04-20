import { NextResponse } from "next/server";
import { getStatesWithLatestScores } from "@/lib/queries";
export async function GET() {
  const states = await getStatesWithLatestScores();
  return NextResponse.json(states);
}

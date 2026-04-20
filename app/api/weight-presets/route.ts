import { NextResponse } from "next/server";
import { getWeightPresets } from "@/lib/queries";
export async function GET() { return NextResponse.json(await getWeightPresets()); }

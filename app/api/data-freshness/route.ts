import { NextResponse } from "next/server";
import { getDataFreshness } from "@/lib/queries";
export async function GET() { return NextResponse.json(await getDataFreshness()); }

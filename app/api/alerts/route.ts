import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/queries";
export async function GET() { return NextResponse.json(await getAlerts()); }

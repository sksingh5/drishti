import { NextResponse } from "next/server";
import { queryPoint } from "@/lib/gee-point-query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lon parameters" },
      { status: 400 }
    );
  }

  // India bounds check
  if (lat < 6 || lat > 38 || lon < 67 || lon > 98) {
    return NextResponse.json(
      { error: "Coordinates outside India bounds" },
      { status: 400 }
    );
  }

  try {
    const result = await queryPoint(lat, lon);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[point-query] GEE error:", err);
    return NextResponse.json(
      { error: "Failed to query Earth Engine", detail: err.message },
      { status: 502 }
    );
  }
}

export const maxDuration = 30;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ee = require("@google/earthengine");

let initialized = false;

function initializeGEE(): Promise<void> {
  if (initialized) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const email = process.env.GEE_SERVICE_ACCOUNT_EMAIL;
    const keyRaw = process.env.GEE_PRIVATE_KEY;

    if (!email || !keyRaw) {
      console.error("[GEE] Missing GEE_SERVICE_ACCOUNT_EMAIL or GEE_PRIVATE_KEY");
      return reject(new Error("GEE credentials not configured"));
    }

    // .env.local stores \\n literals; replace with real newlines for the PEM
    const key = keyRaw.replace(/\\n/g, "\n");
    const credentials = { client_email: email, private_key: key };

    console.log("[GEE] Authenticating as", email);
    ee.data.authenticateViaPrivateKey(
      credentials,
      () => {
        ee.initialize(null, null, () => {
          initialized = true;
          console.log("[GEE] Initialized successfully");
          resolve();
        }, (err: any) => {
          console.error("[GEE] ee.initialize failed:", err);
          reject(err);
        });
      },
      (err: any) => {
        console.error("[GEE] authenticateViaPrivateKey failed:", err);
        reject(err);
      }
    );
  });
}

export interface PointQueryResult {
  lat: number;
  lon: number;
  timestamp: string;
  indicators: {
    ndvi: number | null;
    ndvi_date: string | null;
    land_surface_temp: number | null;
    soil_moisture: number | null;
    precipitation: number | null;
    evi: number | null;
  };
}

export async function queryPoint(lat: number, lon: number): Promise<PointQueryResult> {
  await initializeGEE();

  const point = ee.Geometry.Point([lon, lat]);
  const now = new Date();
  const startDate = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
  const start = startDate.toISOString().split("T")[0];
  const end = now.toISOString().split("T")[0];

  // MODIS MOD13Q1 — 250m NDVI + EVI (16-day composite)
  const modisNdvi = ee.ImageCollection("MODIS/061/MOD13Q1")
    .filterDate(start, end)
    .select(["NDVI", "EVI"])
    .sort("system:time_start", false)
    .first();

  // MODIS LST — Land Surface Temperature
  const modisLst = ee.ImageCollection("MODIS/061/MOD11A2")
    .filterDate(start, end)
    .select("LST_Day_1km")
    .sort("system:time_start", false)
    .first();

  // ERA5-Land — Soil Moisture
  const era5Sm = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
    .filterDate(start, end)
    .select("volumetric_soil_water_layer_1")
    .sort("system:time_start", false)
    .first();

  // CHIRPS — Precipitation
  const chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(start, end)
    .select("precipitation");
  const precipSum = chirps.sum();

  // Sample all at the point
  const ndviSample = modisNdvi.sample({ region: point, scale: 250, numPixels: 1 });
  const lstSample = modisLst.sample({ region: point, scale: 1000, numPixels: 1 });
  const smSample = era5Sm.sample({ region: point, scale: 11132, numPixels: 1 });
  const precipSample = precipSum.sample({ region: point, scale: 5566, numPixels: 1 });

  const ndviDate = modisNdvi.date();

  // Evaluate all in one getInfo call
  const combined = ee.Dictionary({
    ndvi: ndviSample.first().toDictionary(),
    lst: lstSample.first().toDictionary(),
    sm: smSample.first().toDictionary(),
    precip: precipSample.first().toDictionary(),
    ndvi_date: ndviDate.format("YYYY-MM-dd"),
  });

  const result: any = await new Promise((resolve, reject) => {
    combined.evaluate((data: any, err: any) => {
      if (err) reject(new Error(err));
      else resolve(data);
    });
  });

  const ndviRaw = result.ndvi?.NDVI;
  const eviRaw = result.ndvi?.EVI;
  const lstRaw = result.lst?.LST_Day_1km;
  const smRaw = result.sm?.volumetric_soil_water_layer_1;
  const precipRaw = result.precip?.precipitation;

  return {
    lat,
    lon,
    timestamp: new Date().toISOString(),
    indicators: {
      ndvi: ndviRaw != null ? ndviRaw * 0.0001 : null,
      ndvi_date: result.ndvi_date ?? null,
      land_surface_temp: lstRaw != null ? lstRaw * 0.02 - 273.15 : null,
      soil_moisture: smRaw ?? null,
      precipitation: precipRaw ?? null,
      evi: eviRaw != null ? eviRaw * 0.0001 : null,
    },
  };
}

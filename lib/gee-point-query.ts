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

/** Helper: safely sample a single pixel from an image, returning null if image or sample is empty */
function safeSample(image: any, point: any, scale: number): any {
  // Use ee.Algorithms.If to handle null images gracefully
  const safeImage = ee.Algorithms.If(image, image, null);
  return ee.Algorithms.If(
    safeImage,
    ee.Image(safeImage).sample({ region: point, scale, numPixels: 1 })
      .first()
      .toDictionary(),
    null
  );
}

export async function queryPoint(lat: number, lon: number): Promise<PointQueryResult> {
  await initializeGEE();

  const point = ee.Geometry.Point([lon, lat]);
  const now = new Date();

  // Different lookback windows — ERA5 lags 2-3 months, others ~1 month
  const shortWindow = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days
  const longWindow = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000); // 120 days for ERA5
  const shortStart = shortWindow.toISOString().split("T")[0];
  const longStart = longWindow.toISOString().split("T")[0];
  const end = now.toISOString().split("T")[0];

  // MODIS MOD13Q1 — 250m NDVI + EVI (16-day composite)
  const ndviCol = ee.ImageCollection("MODIS/061/MOD13Q1")
    .filterDate(shortStart, end)
    .select(["NDVI", "EVI"])
    .sort("system:time_start", false);
  const ndviImage = ee.Algorithms.If(ndviCol.size().gt(0), ndviCol.first(), null);

  // MODIS LST — Land Surface Temperature (8-day)
  const lstCol = ee.ImageCollection("MODIS/061/MOD11A2")
    .filterDate(shortStart, end)
    .select("LST_Day_1km")
    .sort("system:time_start", false);
  const lstImage = ee.Algorithms.If(lstCol.size().gt(0), lstCol.first(), null);

  // ERA5-Land — Soil Moisture (longer lookback — lags 2-3 months)
  const smCol = ee.ImageCollection("ECMWF/ERA5_LAND/MONTHLY_AGGR")
    .filterDate(longStart, end)
    .select("volumetric_soil_water_layer_1")
    .sort("system:time_start", false);
  const smImage = ee.Algorithms.If(smCol.size().gt(0), smCol.first(), null);

  // CHIRPS — Precipitation (daily, sum over window)
  const chirpsCol = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
    .filterDate(shortStart, end)
    .select("precipitation");
  const precipImage = ee.Algorithms.If(chirpsCol.size().gt(0), chirpsCol.sum(), null);

  // NDVI date (if available)
  const ndviDate = ee.Algorithms.If(
    ndviCol.size().gt(0),
    ndviCol.first().date().format("YYYY-MM-dd"),
    null
  );

  // Sample each independently — null if no data
  const combined = ee.Dictionary({
    ndvi: safeSample(ndviImage, point, 250),
    lst: safeSample(lstImage, point, 1000),
    sm: safeSample(smImage, point, 11132),
    precip: safeSample(precipImage, point, 5566),
    ndvi_date: ndviDate,
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

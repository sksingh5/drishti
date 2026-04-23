## Automated Pipeline (GitHub Actions)

The pipeline runs automatically on the 5th of each month via GitHub Actions. It can also be triggered manually from the Actions tab.

### Required GitHub Secrets

Set these in your repo's Settings → Secrets and variables → Actions:

| Secret | Description | Where to get it |
|--------|------------|----------------|
| `SUPABASE_URL` | Supabase project URL | Supabase dashboard → Settings → API |
| `SUPABASE_KEY` | Supabase service role key | Supabase dashboard → Settings → API |
| `GEE_PROJECT` | GEE Cloud project ID | Google Cloud Console |
| `GEE_SERVICE_ACCOUNT_EMAIL` | GEE service account email | GCP → IAM → Service Accounts |
| `GEE_PRIVATE_KEY` | GEE service account private key (JSON) | Create key for the service account |
| `CDS_URL` | Copernicus CDS API URL | `https://cds.climate.copernicus.eu/api` |
| `CDS_KEY` | Copernicus CDS API key | CDS dashboard → User Profile |

### GEE Tier Selection (URGENT — deadline April 27, 2026)

1. Go to https://code.earthengine.google.com/
2. Select **Contributor** tier for your project (free, 1,000 EECU-hours/month)
3. Link a billing account (won't be charged for non-commercial use)

### Manual Trigger

From GitHub: **Actions → Monthly Climate Data Pipeline → Run workflow → Enter year/month**

From CLI:
```bash
cd pipeline
python -m src.run_pipeline 2026 3  # Run for March 2026
python -m src.run_pipeline --latest # Run for current month
```

### Point Query API

The frontend includes a point-level query feature that calls GEE directly:

```
GET /api/point-query?lat=17.385&lon=78.4867
```

Returns NDVI, EVI, Land Surface Temperature, Soil Moisture, and Precipitation at the given coordinate. Requires GEE authentication (service account or local `earthengine authenticate`).

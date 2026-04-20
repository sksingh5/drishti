# Session Handoff

## Last Session (2026-04-20)

### What Was Done

**All three implementation plans completed — full platform built:**

1. **Plan 1: Foundation** (13 tasks, complete)
   - Next.js 16 + TypeScript + Tailwind + shadcn/ui v4
   - Supabase project `xwmcepqcqkmgoiwiiaml` (Pro, ap-south-1 Mumbai)
   - PostgreSQL + PostGIS with 7 tables (states, districts, climate_indicators partitioned 2020-2030, risk_score_defaults, alert_thresholds, alert_events, data_sources)
   - 36 states + 784 districts loaded with LGD boundaries via RPC
   - Simplified GeoJSON exported (states 528KB, districts 3.3MB)
   - Seed data: 4 weight profiles, 12 alert thresholds, 5 data source entries

2. **Plan 2: Data Pipeline** (12 tasks, complete)
   - Scoring module (percentile ranking, 0-100 risk scores)
   - Zonal statistics (raster → district aggregation via rasterstats)
   - 6 indicator pipelines: IMD rainfall, IMD temperature, SPI drought, ERA5 soil moisture, MODIS NDVI, flood risk composite
   - Alert threshold checker
   - Pipeline orchestrator (`python -m src.run_pipeline <year> <month>`)
   - 27 unit tests passing, 4 skipped (DB connection)

3. **Plan 3: Dashboard** (13 tasks, complete)
   - 6 pages: National Overview, State View, District Scorecard, Compare, Alerts, Weights
   - MapLibre choropleth maps with click-through National → State → District
   - Recharts trend lines and radar comparison charts
   - Interactive weight sliders with auto-rebalancing and presets (localStorage)
   - 7 API routes + Supabase server queries
   - Build verified, all TypeScript checks pass

### Current State

- **Code:** All committed to `master` branch (30+ commits)
- **Dev server:** `npm run dev` — runs on localhost:3000, all pages render
- **Dashboard shows "No data"** because no indicator scores in the database yet
- **Build passes:** `npm run build` succeeds

### BLOCKER: Supabase Pooler Not Working

The Supabase connection pooler (Supavisor) returns "Tenant or user not found" for project `xwmcepqcqkmgoiwiiaml`. This has persisted since project creation.

**Impact:** Python pipeline cannot connect to write indicator scores. Dashboard API routes that query Supabase work via the REST API but direct DB queries via pooler fail.

**Fix:** User needs to **pause and resume** the Supabase project from the dashboard:
- https://supabase.com/dashboard/project/xwmcepqcqkmgoiwiiaml/settings/general
- Pause → wait 30 seconds → Resume
- This forces Supavisor to re-register the tenant

**After fix, verify with:**
```bash
cd pipeline && source .venv/Scripts/activate
python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres.xwmcepqcqkmgoiwiiaml:1hL8ix758s7uPAZG@aws-0-ap-south-1.pooler.supabase.com:6543/postgres', connect_timeout=10)
cur = conn.cursor()
cur.execute('SELECT PostGIS_version()')
print('SUCCESS:', cur.fetchone())
conn.close()
"
```

### Next Steps (in order)

1. **Fix pooler** — pause/resume Supabase project, verify Python connection
2. **Create RPC function** — run on Supabase (MCP token expired, need re-auth):
   ```sql
   CREATE OR REPLACE FUNCTION get_latest_state_scores()
   RETURNS TABLE(state_id BIGINT, indicator_type TEXT, avg_score NUMERIC) AS $$
     SELECT d.state_id, ci.indicator_type::TEXT, ROUND(AVG(ci.score), 0)
     FROM climate_indicators ci JOIN districts d ON ci.district_id = d.id
     WHERE ci.period_start = (SELECT MAX(period_start) FROM climate_indicators)
     GROUP BY d.state_id, ci.indicator_type
   $$ LANGUAGE sql STABLE;
   ```
3. **Run IMD rainfall pipeline** for a test month:
   ```bash
   cd pipeline && source .venv/Scripts/activate
   python -m src.fetch_imd_rainfall 2024 6
   ```
4. **Verify dashboard** shows real data at localhost:3000
5. **Run full pipeline** for multiple months to build history
6. **Register for external accounts** (not yet done):
   - CDS account (https://cds.climate.copernicus.eu) for ERA5 soil moisture
   - GEE account (https://earthengine.google.com) for MODIS NDVI
   - IMD rainfall works without any account

### Key Files

| Area | Path |
|------|------|
| Spec | `docs/superpowers/specs/2026-04-18-climate-risk-platform-design.md` |
| Plan 1 | `docs/superpowers/plans/2026-04-18-foundation-plan.md` |
| Plan 2 | `docs/superpowers/plans/2026-04-20-data-pipeline-plan.md` |
| Plan 3 | `docs/superpowers/plans/2026-04-20-dashboard-plan.md` |
| Research | `docs/research/00-research-index.md` (master index) |
| Pipeline env | `pipeline/.env` (DATABASE_URL — gitignored) |
| App env | `.env.local` (Supabase keys — gitignored) |
| Pipeline venv | `pipeline/.venv/` |

### Credentials (in env files, not committed)

- **Supabase URL:** https://xwmcepqcqkmgoiwiiaml.supabase.co
- **Supabase anon key:** in `.env.local`
- **DB password:** `1hL8ix758s7uPAZG`
- **DB pooler URL:** `postgresql://postgres.xwmcepqcqkmgoiwiiaml:1hL8ix758s7uPAZG@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
- **Git config:** Santosh / san1378@gmail.com

### Gotchas

- Supabase pooler "Tenant not found" — needs pause/resume fix
- Windows environment has no IPv6 support — must use pooler, not direct DB connection
- shadcn/ui v4 Select `onValueChange` can pass `null` — all instances wrapped with `(v) => setter(v ?? "")`
- shadcn/ui v4 Slider `onValueChange` returns `number | readonly number[]` — destructure with `Array.isArray` check
- GeoJSON boundary files in `pipeline/data/` are large (82MB districts) — gitignored
- `pipeline/tests/test_db.py` is skipped until pooler works (set `pytestmark` to `True`)

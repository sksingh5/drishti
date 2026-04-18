# Foundation — Project Setup, Database & Geospatial Data

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Next.js project, PostgreSQL+PostGIS database on Supabase, Python pipeline skeleton, and load all Indian state/district boundary data.

**Architecture:** Next.js 15 (App Router) deployed on Vercel, PostgreSQL+PostGIS on Supabase (Pro), Python 3.12+ pipeline on a cloud VM. This plan covers project initialization and the database foundation that Plans 2 (Data Pipeline) and 3 (Dashboard) build on.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL + PostGIS), Python 3.12+, geopandas

**Spec:** `docs/superpowers/specs/2026-04-18-climate-risk-platform-design.md`

**Plan series:**
1. **Foundation** (this plan) — project setup, database schema, geospatial boundaries
2. **Data Pipeline** (next) — Python fetchers, processors, scorers for IMD/ERA5/MODIS
3. **Dashboard** (last) — Next.js pages, maps, charts, weight configuration

---

## File Structure

```
dicrav2/
├── .env.local                        # Supabase keys (gitignored)
├── .env.example                      # Template for onboarding
├── .gitignore
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json                   # shadcn/ui config
├── app/
│   ├── layout.tsx                    # Root layout with nav shell
│   ├── page.tsx                      # Home placeholder
│   └── globals.css                   # Tailwind directives + theme
├── lib/
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       └── server.ts                 # Server-side Supabase client
├── components/
│   └── ui/                           # shadcn/ui components (auto-generated)
├── supabase/
│   ├── config.toml                   # Supabase CLI config
│   └── migrations/
│       ├── 20260418000001_enable_postgis.sql
│       ├── 20260418000002_states.sql
│       ├── 20260418000003_districts.sql
│       ├── 20260418000004_climate_indicators.sql
│       ├── 20260418000005_risk_and_alerts.sql
│       └── 20260418000006_seed_defaults.sql
├── pipeline/
│   ├── pyproject.toml
│   ├── requirements.txt
│   ├── src/
│   │   ├── __init__.py
│   │   ├── db.py                     # Database connection helper
│   │   └── load_boundaries.py        # Load state/district geo boundaries
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py               # Shared fixtures
│       └── test_db.py                # Database connection tests
└── docs/
    └── (existing research + specs)
```

---

## Task 1: Initialize Git Repository

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Initialize git**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git init
```

Expected: `Initialized empty Git repository`

- [ ] **Step 2: Create .gitignore**

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# next.js
.next/
out/

# env
.env
.env.local
.env.*.local

# debug
npm-debug.log*

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.venv/
venv/

# Supabase
.superpowers/
```

- [ ] **Step 3: Create .env.example**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (direct connection for pipeline)
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

- [ ] **Step 4: Initial commit**

```bash
git add .gitignore .env.example CLAUDE.md docs/ tasks/
git commit -m "chore: initial project structure with research docs and spec"
```

---

## Task 2: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Create Next.js app**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack --use-npm
```

When prompted about existing files, allow overwrite. The command scaffolds into the current directory.

Expected: Next.js project created with `app/` directory, `package.json`, `next.config.ts`, etc.

- [ ] **Step 2: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on `http://localhost:3000`. Stop with Ctrl+C after confirming.

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

This creates `components.json` and sets up the `components/ui/` directory. The `-d` flag uses defaults (New York style, Zinc color, CSS variables).

- [ ] **Step 4: Add core shadcn components we'll need**

```bash
npx shadcn@latest add button card badge select slider table tabs dropdown-menu separator breadcrumb
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 with TypeScript, Tailwind, shadcn/ui"
```

---

## Task 3: Set Up Supabase

**Files:**
- Create: `supabase/config.toml`, `.env.local`, `lib/supabase/client.ts`, `lib/supabase/server.ts`

**Prerequisite:** User must have a Supabase project created. The project URL and keys come from the Supabase dashboard (Settings → API).

- [ ] **Step 1: Install Supabase dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Initialize Supabase CLI in project**

```bash
npx supabase init
```

Expected: Creates `supabase/` directory with `config.toml`.

- [ ] **Step 3: Link to remote Supabase project**

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with the project reference from Supabase dashboard (Settings → General → Reference ID). This will prompt for the database password.

- [ ] **Step 4: Create .env.local with Supabase credentials**

Copy `.env.example` to `.env.local` and fill in real values from Supabase dashboard (Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service_role key
- `DATABASE_URL` — Connection string from Settings → Database → Connection string → URI

- [ ] **Step 5: Create browser Supabase client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 6: Create server Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  );
}
```

- [ ] **Step 7: Verify Supabase connection**

Create a temporary test page `app/test-db/page.tsx`:

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function TestDB() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("_test_connection").select("*").limit(1);
  
  return (
    <div>
      <h1>Supabase Connection Test</h1>
      <p>Status: {error ? `Connected (expected error: ${error.message})` : "Connected"}</p>
    </div>
  );
}
```

Run `npm run dev`, visit `http://localhost:3000/test-db`. Should show "Connected" (the table doesn't exist so you'll get an error message, but no connection error means Supabase is working). Delete this test page after confirming.

- [ ] **Step 8: Remove test page and commit**

```bash
rm -rf app/test-db
git add lib/supabase/ supabase/ package.json package-lock.json .env.example
git commit -m "feat: configure Supabase client (browser + server)"
```

Note: `.env.local` is gitignored and should NOT be committed.

---

## Task 4: Database Migration — PostGIS and States Table

**Files:**
- Create: `supabase/migrations/20260418000001_enable_postgis.sql`
- Create: `supabase/migrations/20260418000002_states.sql`

- [ ] **Step 1: Create PostGIS extension migration**

Create `supabase/migrations/20260418000001_enable_postgis.sql`:

```sql
-- Enable PostGIS for geospatial operations
CREATE EXTENSION IF NOT EXISTS postgis;
```

- [ ] **Step 2: Create states table migration**

Create `supabase/migrations/20260418000002_states.sql`:

```sql
CREATE TABLE states (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lgd_code INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    area_sq_km DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for map rendering and containment queries
CREATE INDEX idx_states_geometry ON states USING GIST (geometry);

-- Name search
CREATE INDEX idx_states_name ON states (name);

COMMENT ON TABLE states IS 'Indian states and union territories with boundaries from LGD';
```

- [ ] **Step 3: Push migrations to Supabase**

```bash
npx supabase db push
```

Expected: Both migrations applied successfully.

- [ ] **Step 4: Verify PostGIS is enabled**

```bash
npx supabase db execute --sql "SELECT PostGIS_version();"
```

Expected: Returns PostGIS version string (e.g., `3.4 USE_GEOS=1 USE_PROJ=1`).

- [ ] **Step 5: Verify states table exists**

```bash
npx supabase db execute --sql "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'states' ORDER BY ordinal_position;"
```

Expected: Shows id, lgd_code, name, area_sq_km, geometry, created_at columns.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add PostGIS extension and states table migration"
```

---

## Task 5: Database Migration — Districts Table

**Files:**
- Create: `supabase/migrations/20260418000003_districts.sql`

- [ ] **Step 1: Create districts table migration**

Create `supabase/migrations/20260418000003_districts.sql`:

```sql
CREATE TABLE districts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lgd_code INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    state_id BIGINT NOT NULL REFERENCES states(id),
    area_sq_km DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for map rendering and containment queries
CREATE INDEX idx_districts_geometry ON districts USING GIST (geometry);

-- Fast lookup by state (for state view page)
CREATE INDEX idx_districts_state_id ON districts (state_id);

-- Name search
CREATE INDEX idx_districts_name ON districts (name);

COMMENT ON TABLE districts IS 'Indian districts (~770) with boundaries from LGD, linked to states';
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

Expected: Migration applied successfully.

- [ ] **Step 3: Verify districts table and foreign key**

```bash
npx supabase db execute --sql "SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name WHERE tc.table_name = 'districts' AND tc.constraint_type = 'FOREIGN KEY';"
```

Expected: Shows foreign key from `state_id` to `states(id)`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add districts table migration with state foreign key"
```

---

## Task 6: Database Migration — Climate Indicators Table (Partitioned)

**Files:**
- Create: `supabase/migrations/20260418000004_climate_indicators.sql`

- [ ] **Step 1: Create climate indicators migration with yearly partitioning**

Create `supabase/migrations/20260418000004_climate_indicators.sql`:

```sql
-- Enum for indicator types
CREATE TYPE indicator_type AS ENUM (
    'rainfall_anomaly',
    'drought_index',
    'vegetation_health',
    'heat_stress',
    'flood_risk',
    'soil_moisture'
);

-- Partitioned table by year for query performance on time-series data
-- Note: foreign keys from partitioned tables require the referenced column
-- to be part of the partition key, or use triggers for enforcement.
-- We enforce district_id integrity via the pipeline (application-level),
-- not a DB-level FK, because period_start is the partition key.
CREATE TABLE climate_indicators (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    district_id BIGINT NOT NULL,
    indicator_type indicator_type NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    source TEXT NOT NULL,
    methodology_version SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (id, period_start)
) PARTITION BY RANGE (period_start);

-- Create partitions for historical + future data (2020-2030)
CREATE TABLE climate_indicators_2020 PARTITION OF climate_indicators
    FOR VALUES FROM ('2020-01-01') TO ('2021-01-01');
CREATE TABLE climate_indicators_2021 PARTITION OF climate_indicators
    FOR VALUES FROM ('2021-01-01') TO ('2022-01-01');
CREATE TABLE climate_indicators_2022 PARTITION OF climate_indicators
    FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');
CREATE TABLE climate_indicators_2023 PARTITION OF climate_indicators
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE climate_indicators_2024 PARTITION OF climate_indicators
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE climate_indicators_2025 PARTITION OF climate_indicators
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE climate_indicators_2026 PARTITION OF climate_indicators
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE climate_indicators_2027 PARTITION OF climate_indicators
    FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE climate_indicators_2028 PARTITION OF climate_indicators
    FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');
CREATE TABLE climate_indicators_2029 PARTITION OF climate_indicators
    FOR VALUES FROM ('2029-01-01') TO ('2030-01-01');
CREATE TABLE climate_indicators_2030 PARTITION OF climate_indicators
    FOR VALUES FROM ('2030-01-01') TO ('2031-01-01');

-- Primary lookup pattern: all indicators for a district in a time range
CREATE INDEX idx_climate_district_type_period
    ON climate_indicators (district_id, indicator_type, period_start);

COMMENT ON TABLE climate_indicators IS 'Per-district climate risk indicator scores, partitioned by year. Millions of rows over time.';
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

Expected: Migration applied, partitioned table created.

- [ ] **Step 3: Verify partitions exist**

```bash
npx supabase db execute --sql "SELECT tablename FROM pg_tables WHERE tablename LIKE 'climate_indicators_%' ORDER BY tablename;"
```

Expected: Lists `climate_indicators_2020` through `climate_indicators_2030`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add partitioned climate_indicators table (2020-2030)"
```

---

## Task 7: Database Migration — Risk Defaults, Alerts, Data Sources

**Files:**
- Create: `supabase/migrations/20260418000005_risk_and_alerts.sql`

- [ ] **Step 1: Create risk, alerts, and data sources migration**

Create `supabase/migrations/20260418000005_risk_and_alerts.sql`:

```sql
-- Weight presets for composite risk scoring
CREATE TABLE risk_score_defaults (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    weights JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE risk_score_defaults IS 'Named weight profiles for composite risk score calculation';

-- Alert thresholds (system-default for MVP, user-defined in Phase 2)
CREATE TABLE alert_thresholds (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    indicator_type indicator_type NOT NULL,
    threshold_value SMALLINT NOT NULL CHECK (threshold_value BETWEEN 0 AND 100),
    comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('>', '>=', '<', '<=')),
    severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
    is_system_default BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE alert_thresholds IS 'Risk score thresholds that trigger alerts when breached';

-- Triggered alert events
CREATE TABLE alert_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district_id BIGINT NOT NULL REFERENCES districts(id),
    threshold_id BIGINT NOT NULL REFERENCES alert_thresholds(id),
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_value SMALLINT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_alert_events_district ON alert_events (district_id, triggered_at DESC);
CREATE INDEX idx_alert_events_unacked ON alert_events (acknowledged) WHERE NOT acknowledged;

COMMENT ON TABLE alert_events IS 'Log of triggered alerts when indicator scores breach thresholds';

-- Data source registry for freshness tracking
CREATE TABLE data_sources (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_name TEXT NOT NULL UNIQUE,
    description TEXT,
    last_fetched TIMESTAMPTZ,
    fetch_frequency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('ok', 'error', 'stale', 'pending')),
    row_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE data_sources IS 'Registry of data pipeline sources with freshness tracking';
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

Expected: All four tables created.

- [ ] **Step 3: Verify all tables exist**

```bash
npx supabase db execute --sql "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
```

Expected: `alert_events`, `alert_thresholds`, `climate_indicators`, `data_sources`, `districts`, `risk_score_defaults`, `states` (plus any Supabase system tables).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add risk defaults, alert thresholds, alert events, data sources tables"
```

---

## Task 8: Seed Default Data

**Files:**
- Create: `supabase/migrations/20260418000006_seed_defaults.sql`

- [ ] **Step 1: Create seed migration for default weight profiles and alert thresholds**

Create `supabase/migrations/20260418000006_seed_defaults.sql`:

```sql
-- Default weight profiles
INSERT INTO risk_score_defaults (name, description, weights) VALUES
(
    'Balanced',
    'Equal-ish weighting across all indicators. General purpose.',
    '{"rainfall_anomaly": 0.20, "drought_index": 0.20, "vegetation_health": 0.15, "heat_stress": 0.15, "flood_risk": 0.15, "soil_moisture": 0.15}'::jsonb
),
(
    'Drought Focus',
    'Emphasizes drought-related indicators. Suitable for semi-arid regions.',
    '{"rainfall_anomaly": 0.30, "drought_index": 0.30, "vegetation_health": 0.15, "heat_stress": 0.10, "flood_risk": 0.05, "soil_moisture": 0.10}'::jsonb
),
(
    'Flood Focus',
    'Emphasizes flood-related indicators. Suitable for riverine and coastal districts.',
    '{"rainfall_anomaly": 0.25, "drought_index": 0.05, "vegetation_health": 0.10, "heat_stress": 0.05, "flood_risk": 0.35, "soil_moisture": 0.20}'::jsonb
),
(
    'Bank Default',
    'Balanced risk assessment for crop loan evaluation.',
    '{"rainfall_anomaly": 0.20, "drought_index": 0.20, "vegetation_health": 0.20, "heat_stress": 0.10, "flood_risk": 0.15, "soil_moisture": 0.15}'::jsonb
);

-- System default alert thresholds
-- These fire when any indicator score exceeds these levels
INSERT INTO alert_thresholds (indicator_type, threshold_value, comparison_operator, severity) VALUES
('rainfall_anomaly', 75, '>=', 'warning'),
('rainfall_anomaly', 90, '>=', 'critical'),
('drought_index', 75, '>=', 'warning'),
('drought_index', 90, '>=', 'critical'),
('vegetation_health', 75, '>=', 'warning'),
('vegetation_health', 90, '>=', 'critical'),
('heat_stress', 75, '>=', 'warning'),
('heat_stress', 90, '>=', 'critical'),
('flood_risk', 75, '>=', 'warning'),
('flood_risk', 90, '>=', 'critical'),
('soil_moisture', 75, '>=', 'warning'),
('soil_moisture', 90, '>=', 'critical');

-- Data source registry
INSERT INTO data_sources (source_name, description, fetch_frequency) VALUES
('imd_rainfall', 'IMD gridded daily rainfall (0.25 degree)', 'daily'),
('imd_temperature', 'IMD gridded daily temperature (1 degree)', 'daily'),
('era5_land', 'ERA5-Land reanalysis - soil moisture and temperature', 'monthly'),
('modis_ndvi', 'MODIS MOD13A3 monthly NDVI via Google Earth Engine', '16-day'),
('srtm_elevation', 'SRTM 90m DEM for flood risk computation', 'one-time');
```

- [ ] **Step 2: Push migration**

```bash
npx supabase db push
```

- [ ] **Step 3: Verify seed data**

```bash
npx supabase db execute --sql "SELECT name, description FROM risk_score_defaults ORDER BY id;"
```

Expected: Four weight profiles listed.

```bash
npx supabase db execute --sql "SELECT indicator_type, threshold_value, severity FROM alert_thresholds ORDER BY indicator_type, threshold_value;"
```

Expected: 12 threshold rows (2 per indicator type).

```bash
npx supabase db execute --sql "SELECT source_name, fetch_frequency, status FROM data_sources ORDER BY id;"
```

Expected: 5 data sources, all with status `pending`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: seed default weight profiles, alert thresholds, and data sources"
```

---

## Task 9: Set Up Python Pipeline Project

**Files:**
- Create: `pipeline/pyproject.toml`, `pipeline/requirements.txt`, `pipeline/src/__init__.py`, `pipeline/src/db.py`, `pipeline/tests/__init__.py`, `pipeline/tests/conftest.py`, `pipeline/tests/test_db.py`

- [ ] **Step 1: Create Python project structure**

Create `pipeline/pyproject.toml`:

```toml
[project]
name = "dicrav2-pipeline"
version = "0.1.0"
description = "Climate risk data pipeline for DiCRA v2"
requires-python = ">=3.12"

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
```

Create `pipeline/requirements.txt`:

```
geopandas>=1.0
psycopg2-binary>=2.9
sqlalchemy>=2.0
python-dotenv>=1.0
httpx>=0.27
pytest>=8.0
```

Create `pipeline/src/__init__.py` (empty file).

Create `pipeline/tests/__init__.py` (empty file).

- [ ] **Step 2: Create database connection helper**

Create `pipeline/src/db.py`:

```python
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()


def get_engine():
    url = os.environ["DATABASE_URL"]
    return create_engine(url)


def test_connection():
    engine = get_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT PostGIS_version()"))
        version = result.scalar()
    return version
```

- [ ] **Step 3: Create test fixtures**

Create `pipeline/tests/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()


@pytest.fixture(scope="session")
def db_engine():
    url = os.environ["DATABASE_URL"]
    engine = create_engine(url)
    yield engine
    engine.dispose()
```

- [ ] **Step 4: Write database connection test**

Create `pipeline/tests/test_db.py`:

```python
from sqlalchemy import text
from src.db import test_connection


def test_postgis_available():
    version = test_connection()
    assert version is not None
    assert "USE_GEOS" in version


def test_states_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'states'")
        )
        assert result.scalar() == 1


def test_districts_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'districts'")
        )
        assert result.scalar() == 1


def test_climate_indicators_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'climate_indicators'")
        )
        assert result.scalar() == 1
```

- [ ] **Step 5: Set up Python venv and install dependencies**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
python -m venv .venv
source .venv/Scripts/activate  # Windows Git Bash
pip install -r requirements.txt
```

- [ ] **Step 6: Create .env in pipeline directory**

Create `pipeline/.env` (gitignored — copy DATABASE_URL from `.env.local`):

```env
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
```

- [ ] **Step 7: Run tests**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
pytest tests/test_db.py -v
```

Expected: All 4 tests pass.

- [ ] **Step 8: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/pyproject.toml pipeline/requirements.txt pipeline/src/ pipeline/tests/
git commit -m "feat: set up Python pipeline project with db connection and tests"
```

---

## Task 10: Load State Boundaries into PostGIS

**Files:**
- Create: `pipeline/src/load_boundaries.py`
- Create: `pipeline/tests/test_load_boundaries.py`
- Data: State boundary GeoJSON from LGD/Survey of India

This task uses Indian state boundary data. The data can be obtained from:
- India GeoJSON repository on GitHub (Natural Earth or similar)
- Datameet community shapefiles
- Survey of India / LGD data

We'll use a publicly available India states GeoJSON and load it via geopandas.

- [ ] **Step 1: Write the test for state boundary loading**

Create `pipeline/tests/test_load_boundaries.py`:

```python
from sqlalchemy import text


def test_states_loaded(db_engine):
    """After loading, states table should have 36 rows (states + UTs)."""
    with db_engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM states")).scalar()
        assert count >= 28, f"Expected at least 28 states, got {count}"


def test_state_geometries_valid(db_engine):
    """All state geometries should be valid PostGIS geometries."""
    with db_engine.connect() as conn:
        invalid = conn.execute(
            text("SELECT COUNT(*) FROM states WHERE NOT ST_IsValid(geometry)")
        ).scalar()
        assert invalid == 0, f"{invalid} states have invalid geometries"


def test_state_geometry_srid(db_engine):
    """All geometries should use SRID 4326 (WGS84)."""
    with db_engine.connect() as conn:
        wrong_srid = conn.execute(
            text("SELECT COUNT(*) FROM states WHERE ST_SRID(geometry) != 4326")
        ).scalar()
        assert wrong_srid == 0, f"{wrong_srid} states have wrong SRID"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
pytest tests/test_load_boundaries.py -v
```

Expected: All 3 tests FAIL (states table is empty).

- [ ] **Step 3: Write the boundary loading script**

Create `pipeline/src/load_boundaries.py`:

```python
"""Load Indian state and district boundaries into PostGIS from GeoJSON files."""

import geopandas as gpd
from sqlalchemy import text
from src.db import get_engine


def load_states(geojson_path: str) -> int:
    """Load state boundaries from a GeoJSON file into the states table.
    
    The GeoJSON must have properties:
    - 'lgd_code' or 'state_code' (integer): LGD state code
    - 'name' or 'state_name' (string): State name
    
    Returns the number of states loaded.
    """
    engine = get_engine()
    gdf = gpd.read_file(geojson_path)
    
    # Normalize column names — adapt to whatever the source GeoJSON provides
    col_map = {}
    for col in gdf.columns:
        lower = col.lower()
        if lower in ("lgd_code", "state_code", "st_code", "state_lgd_code", "code"):
            col_map[col] = "lgd_code"
        elif lower in ("name", "state_name", "st_name", "state"):
            col_map[col] = "name"
    
    gdf = gdf.rename(columns=col_map)
    
    if "lgd_code" not in gdf.columns or "name" not in gdf.columns:
        raise ValueError(
            f"GeoJSON must have code and name columns. Found: {list(gdf.columns)}"
        )
    
    # Ensure correct CRS
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    
    # Force MultiPolygon (some states may be Polygon)
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if g.geom_type == "MultiPolygon" else gpd.GeoSeries([g]).unary_union
        if g.geom_type == "Polygon" else g
    )
    
    # Make geometries valid
    gdf["geometry"] = gdf["geometry"].make_valid()
    
    # Compute area in sq km (approximate, using UTM-like projection)
    gdf_proj = gdf.to_crs(epsg=7755)  # India-specific projection
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6
    
    # Insert into database
    loaded = 0
    with engine.begin() as conn:
        for _, row in gdf.iterrows():
            wkt = row.geometry.wkt
            conn.execute(
                text("""
                    INSERT INTO states (lgd_code, name, area_sq_km, geometry)
                    VALUES (:lgd_code, :name, :area_sq_km, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (lgd_code) DO UPDATE SET
                        name = EXCLUDED.name,
                        area_sq_km = EXCLUDED.area_sq_km,
                        geometry = EXCLUDED.geometry
                """),
                {
                    "lgd_code": int(row.lgd_code),
                    "name": str(row["name"]),
                    "area_sq_km": float(row.area_sq_km),
                    "wkt": wkt,
                },
            )
            loaded += 1
    
    return loaded


def load_districts(geojson_path: str) -> int:
    """Load district boundaries from a GeoJSON file into the districts table.
    
    The GeoJSON must have properties:
    - 'lgd_code' or 'district_code' (integer): LGD district code
    - 'name' or 'district_name' (string): District name
    - 'state_lgd_code' or 'state_code' (integer): Parent state LGD code
    
    Returns the number of districts loaded.
    """
    engine = get_engine()
    gdf = gpd.read_file(geojson_path)
    
    # Normalize column names
    col_map = {}
    for col in gdf.columns:
        lower = col.lower()
        if lower in ("lgd_code", "district_code", "dt_code", "district_lgd_code", "dtcode"):
            col_map[col] = "lgd_code"
        elif lower in ("name", "district_name", "dt_name", "district", "dtname"):
            col_map[col] = "name"
        elif lower in ("state_lgd_code", "state_code", "st_code", "stcode"):
            col_map[col] = "state_lgd_code"
    
    gdf = gdf.rename(columns=col_map)
    
    if not all(c in gdf.columns for c in ["lgd_code", "name", "state_lgd_code"]):
        raise ValueError(
            f"GeoJSON must have district code, name, and state code columns. Found: {list(gdf.columns)}"
        )
    
    # Ensure correct CRS
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
    
    # Force MultiPolygon
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if g.geom_type == "MultiPolygon" else gpd.GeoSeries([g]).unary_union
        if g.geom_type == "Polygon" else g
    )
    
    # Make geometries valid
    gdf["geometry"] = gdf["geometry"].make_valid()
    
    # Compute area
    gdf_proj = gdf.to_crs(epsg=7755)
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6
    
    # Build state_lgd_code -> state_id lookup
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, lgd_code FROM states")).fetchall()
        state_lookup = {row.lgd_code: row.id for row in rows}
    
    if not state_lookup:
        raise RuntimeError("States table is empty. Load states first.")
    
    # Insert into database
    loaded = 0
    skipped = 0
    with engine.begin() as conn:
        for _, row in gdf.iterrows():
            state_lgd = int(row.state_lgd_code)
            state_id = state_lookup.get(state_lgd)
            if state_id is None:
                print(f"WARNING: Skipping district {row['name']} — state LGD code {state_lgd} not found")
                skipped += 1
                continue
            
            wkt = row.geometry.wkt
            conn.execute(
                text("""
                    INSERT INTO districts (lgd_code, name, state_id, area_sq_km, geometry)
                    VALUES (:lgd_code, :name, :state_id, :area_sq_km, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (lgd_code) DO UPDATE SET
                        name = EXCLUDED.name,
                        state_id = EXCLUDED.state_id,
                        area_sq_km = EXCLUDED.area_sq_km,
                        geometry = EXCLUDED.geometry
                """),
                {
                    "lgd_code": int(row.lgd_code),
                    "name": str(row["name"]),
                    "state_id": int(state_id),
                    "area_sq_km": float(row.area_sq_km),
                    "wkt": wkt,
                },
            )
            loaded += 1
    
    if skipped:
        print(f"Loaded {loaded} districts, skipped {skipped} (missing state)")
    
    return loaded


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python load_boundaries.py <states.geojson> <districts.geojson>")
        sys.exit(1)
    
    states_path = sys.argv[1]
    districts_path = sys.argv[2]
    
    print(f"Loading states from {states_path}...")
    n_states = load_states(states_path)
    print(f"Loaded {n_states} states.")
    
    print(f"Loading districts from {districts_path}...")
    n_districts = load_districts(districts_path)
    print(f"Loaded {n_districts} districts.")
```

- [ ] **Step 4: Obtain boundary GeoJSON files**

Two options:

**Option A (recommended):** Use the indian-geography-provisioner skill to obtain LGD boundary data. This provides official state and district boundaries with LGD codes.

**Option B (fallback):** Download from a public source. The Datameet community maintains India boundary shapefiles:
- States: `https://github.com/datameet/maps/tree/master/States` 
- Districts: `https://github.com/datameet/maps/tree/master/Districts`

Download the GeoJSON files and place them in `pipeline/data/` (add `pipeline/data/` to `.gitignore` — boundary files can be large).

```bash
mkdir -p pipeline/data
echo "pipeline/data/" >> .gitignore
```

Note: The exact column names in the GeoJSON will vary by source. The `load_boundaries.py` script handles common column name variations. If the source uses unexpected names, update the column mapping in the script.

- [ ] **Step 5: Run the boundary loading script**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
python -m src.load_boundaries data/india-states.geojson data/india-districts.geojson
```

Expected: "Loaded 36 states" (or 28+ depending on source) and "Loaded ~770 districts".

- [ ] **Step 6: Run tests to verify they pass**

```bash
pytest tests/test_load_boundaries.py -v
```

Expected: All 3 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/load_boundaries.py pipeline/tests/test_load_boundaries.py .gitignore
git commit -m "feat: load state and district boundaries into PostGIS"
```

---

## Task 11: Load District Boundaries and Verify Full Schema

**Files:**
- Create: `pipeline/tests/test_load_boundaries.py` (add district tests)

- [ ] **Step 1: Add district boundary tests**

Append to `pipeline/tests/test_load_boundaries.py`:

```python
def test_districts_loaded(db_engine):
    """After loading, districts table should have ~770 rows."""
    with db_engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM districts")).scalar()
        assert count >= 500, f"Expected at least 500 districts, got {count}"


def test_district_geometries_valid(db_engine):
    """All district geometries should be valid."""
    with db_engine.connect() as conn:
        invalid = conn.execute(
            text("SELECT COUNT(*) FROM districts WHERE NOT ST_IsValid(geometry)")
        ).scalar()
        assert invalid == 0, f"{invalid} districts have invalid geometries"


def test_districts_linked_to_states(db_engine):
    """Every district should reference a valid state."""
    with db_engine.connect() as conn:
        orphans = conn.execute(
            text("""
                SELECT COUNT(*) FROM districts d
                LEFT JOIN states s ON d.state_id = s.id
                WHERE s.id IS NULL
            """)
        ).scalar()
        assert orphans == 0, f"{orphans} districts have no matching state"


def test_seed_data_present(db_engine):
    """Default weight profiles and alert thresholds should be seeded."""
    with db_engine.connect() as conn:
        profiles = conn.execute(
            text("SELECT COUNT(*) FROM risk_score_defaults")
        ).scalar()
        assert profiles == 4, f"Expected 4 weight profiles, got {profiles}"
        
        thresholds = conn.execute(
            text("SELECT COUNT(*) FROM alert_thresholds")
        ).scalar()
        assert thresholds == 12, f"Expected 12 alert thresholds, got {thresholds}"
        
        sources = conn.execute(
            text("SELECT COUNT(*) FROM data_sources")
        ).scalar()
        assert sources == 5, f"Expected 5 data sources, got {sources}"
```

- [ ] **Step 2: Run full test suite**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
pytest tests/ -v
```

Expected: All tests pass — database connection, table existence, states loaded, districts loaded, geometries valid, seed data present.

- [ ] **Step 3: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/tests/
git commit -m "test: add district boundary and seed data verification tests"
```

---

## Task 12: Create Simplified GeoJSON for Frontend

**Files:**
- Create: `pipeline/src/export_geojson.py`

The full PostGIS geometries are too detailed for web rendering. We need simplified versions as TopoJSON/GeoJSON for MapLibre.

- [ ] **Step 1: Write the GeoJSON export script**

Create `pipeline/src/export_geojson.py`:

```python
"""Export simplified GeoJSON from PostGIS for frontend map rendering."""

import json
from sqlalchemy import text
from src.db import get_engine


def export_states_geojson(output_path: str, tolerance: float = 0.01) -> int:
    """Export simplified state boundaries as GeoJSON.
    
    tolerance: simplification tolerance in degrees. 0.01 ~ 1km at equator.
    """
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT
                    s.id,
                    s.lgd_code,
                    s.name,
                    s.area_sq_km,
                    ST_AsGeoJSON(ST_Simplify(s.geometry, :tolerance))::json AS geometry
                FROM states s
                ORDER BY s.name
            """),
            {"tolerance": tolerance},
        ).fetchall()
    
    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "id": row.id,
                "lgd_code": row.lgd_code,
                "name": row.name,
                "area_sq_km": round(row.area_sq_km, 1) if row.area_sq_km else None,
            },
            "geometry": row.geometry,
        })
    
    geojson = {"type": "FeatureCollection", "features": features}
    
    with open(output_path, "w") as f:
        json.dump(geojson, f)
    
    return len(features)


def export_districts_geojson(output_path: str, state_lgd_code: int | None = None, tolerance: float = 0.005) -> int:
    """Export simplified district boundaries as GeoJSON.
    
    If state_lgd_code is provided, export only districts for that state.
    tolerance: 0.005 ~ 500m at equator (finer than states since districts are smaller).
    """
    engine = get_engine()
    
    query = """
        SELECT
            d.id,
            d.lgd_code,
            d.name,
            d.area_sq_km,
            s.lgd_code AS state_lgd_code,
            s.name AS state_name,
            ST_AsGeoJSON(ST_Simplify(d.geometry, :tolerance))::json AS geometry
        FROM districts d
        JOIN states s ON d.state_id = s.id
    """
    params = {"tolerance": tolerance}
    
    if state_lgd_code is not None:
        query += " WHERE s.lgd_code = :state_lgd_code"
        params["state_lgd_code"] = state_lgd_code
    
    query += " ORDER BY s.name, d.name"
    
    with engine.connect() as conn:
        rows = conn.execute(text(query), params).fetchall()
    
    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "id": row.id,
                "lgd_code": row.lgd_code,
                "name": row.name,
                "area_sq_km": round(row.area_sq_km, 1) if row.area_sq_km else None,
                "state_lgd_code": row.state_lgd_code,
                "state_name": row.state_name,
            },
            "geometry": row.geometry,
        })
    
    geojson = {"type": "FeatureCollection", "features": features}
    
    with open(output_path, "w") as f:
        json.dump(geojson, f)
    
    return len(features)


if __name__ == "__main__":
    import os
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "public", "geo")
    os.makedirs(output_dir, exist_ok=True)
    
    states_path = os.path.join(output_dir, "states.json")
    print(f"Exporting states to {states_path}...")
    n = export_states_geojson(states_path)
    print(f"Exported {n} states.")
    
    districts_path = os.path.join(output_dir, "districts.json")
    print(f"Exporting all districts to {districts_path}...")
    n = export_districts_geojson(districts_path)
    print(f"Exported {n} districts.")
```

- [ ] **Step 2: Run the export**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
python -m src.export_geojson
```

Expected: Creates `public/geo/states.json` and `public/geo/districts.json` in the project root.

- [ ] **Step 3: Verify file sizes are reasonable**

```bash
ls -lh C:\Users\Santosh\Claude_Access\dicrav2\public\geo\
```

Expected: `states.json` should be under 500KB, `districts.json` under 5MB. If larger, reduce tolerance parameter.

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
git add pipeline/src/export_geojson.py public/geo/
git commit -m "feat: export simplified GeoJSON for frontend map rendering"
```

---

## Task 13: Verify End-to-End Foundation

- [ ] **Step 1: Run full pipeline test suite**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2\pipeline
source .venv/Scripts/activate
pytest tests/ -v
```

Expected: All tests pass.

- [ ] **Step 2: Verify Next.js builds**

```bash
cd C:\Users\Santosh\Claude_Access\dicrav2
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Verify GeoJSON files are accessible in dev server**

```bash
npm run dev
```

Visit `http://localhost:3000/geo/states.json` — should return GeoJSON.
Visit `http://localhost:3000/geo/districts.json` — should return GeoJSON.

Stop dev server after confirming.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: foundation plan complete — database, boundaries, GeoJSON export verified"
```

---

## Summary

After completing this plan, you have:
- Next.js 15 project with TypeScript, Tailwind, shadcn/ui
- Supabase database with PostGIS, all 7 tables, proper indexes
- All Indian state (~36) and district (~770) boundaries loaded
- Simplified GeoJSON files ready for MapLibre rendering
- Python pipeline skeleton with database connectivity
- Seed data: 4 weight profiles, 12 alert thresholds, 5 data source entries
- Full test coverage of database schema and boundary data

**Next:** Plan 2 (Data Pipeline) — builds the fetchers, processors, and scorers that populate `climate_indicators`.

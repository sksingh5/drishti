# Phase 1: DiCRA Platform Analysis Framework

## 1. Platform Identity

| Attribute | Detail |
|-----------|--------|
| **Full Name** | Data in Climate Resilient Agriculture (DiCRA) |
| **URL** | https://dicra.nabard.org/ |
| **GitHub** | https://github.com/undpindia/dicra |
| **Stewards** | UNDP India (creator) + NABARD (host & maintainer) |
| **License** | MIT (code); individual dataset licenses vary |
| **Classification** | Digital Public Good (DPG) — open access, open software, open code, open APIs |
| **Launch** | March 2022 |
| **Reach** | ~1,350 unique users, ~10,000 views (as of UNDP Digital X catalog) |

---

## 2. Mission & Value Proposition

**Core Problem:** Climate change causes up to 25% agricultural income loss for Indian smallholder farmers. Climate data remains fragmented across institutions, siloed in proprietary models, and limited by gaps in ground-truth validation. Disaster response mechanisms remain largely reactive. Farmers, banks, and policymakers operate under uncertainty without granular climate foresight.

**DiCRA's Answer:** A collaborative digital public good providing open access to key geospatial datasets for climate resilient agriculture. Uses data science and machine learning to identify farms that are resilient to climate change and those that are highly vulnerable.

**Value-Add Chain:**
```
Satellite Data → Processing Pipeline → Geospatial Layers → AI/ML Analysis → Actionable Intelligence
     ↓                    ↓                    ↓                  ↓                    ↓
  NASA/ESA/        Jupyter Notebooks      26 Data Layers     Positive/Negative    Investment decisions
  Copernicus       Python pipelines       20m-9km resolution  Deviance detection   Policy optimization
                                                                                   Risk assessment
```

---

## 3. Geographic Coverage

| Scope | Detail |
|-------|--------|
| **Primary** | Telangana State, India — 112,077 sq km |
| **Coverage** | 50 million hectares of farmland across India |
| **Resolution** | Up to 20m spatial resolution (LULC via Sentinel-2) |
| **Planned Expansion** | 3 additional Indian states; 7 UNDP Accelerator Labs in Africa (Congo, Nigeria, Zambia) and South America (Guatemala, Peru, Ecuador, Dominican Republic) |
| **Administrative Levels** | District and Mandal level analysis |

---

## 4. Complete Data Layer Inventory

### 4.1 Primary Layers (18 layers)

| # | Layer | Source | Resolution | Frequency | Key Use |
|---|-------|--------|------------|-----------|---------|
| 1 | **NDVI** (Normalized Difference Vegetation Index) | NASA LP DAAC (MOD13Q1) | 250m | 16 days | Vegetation health monitoring |
| 2 | **NDWI** (Normalized Difference Water Index) | NASA LP DAAC (MOD09GA) | 500m-1km | Monthly | Water content in vegetation |
| 3 | **LAI** (Leaf Area Index) | NASA LP DAAC (MOD15A2H) | 500m | 8 days | Canopy cover density |
| 4 | **Soil Moisture** | NASA SMAP Enhanced L3 | 9km | Monthly | Water availability for crops |
| 5 | **Land Surface Temperature (LST)** | NASA LP DAAC (MOD11A1) | 1km | Monthly | Heat stress, energy exchange |
| 6 | **PM2.5** (Particulate Matter) | NASA GMAO (GEOS-CF) | — | Monthly | Air quality / crop burning |
| 7 | **Temperature** (Monthly Avg) | Copernicus ERA5-Land | — | Monthly | Climate baseline |
| 8 | **Total Precipitation** (Monthly) | Copernicus ERA5-Land | — | Monthly | Rainfall patterns |
| 9 | **LULC** (Land Use/Land Cover) | ESA/Impact Observatory (Sentinel-2) | 10m | Yearly | Land classification |
| 10 | **NO2** (Nitrogen Dioxide) | Copernicus Sentinel-5P TROPOMI | — | Monthly | Air quality, industrial activity |
| 11 | **Population** | WorldPop | — | Yearly | Demographic overlay |
| 12 | **Soil Organic Carbon (SOC)** | SoilGrids (ISRIC) | — | Static | Soil health, carbon sequestration |
| 13 | **Crop Intensity** | ICRISAT/UNDP (MODIS) | 250m | Yearly | Single/double/triple cropping |
| 14 | **Croplands** | ICRISAT/UNDP (Landsat) | 30m | — | Crop vs non-crop classification |
| 15 | **Relative Wealth Index** | Meta/Facebook Data for Good | — | — | Socioeconomic vulnerability |
| 16 | **Crop Stress** | ICRISAT/UNDP | — | — | Drought/heat/disease severity |
| 17 | **Warehouses Geolocation** | Telangana Dept. of Agriculture | — | — | Storage infrastructure mapping |
| 18 | **Fire Events** | NASA FIRMS (MODIS) | 1km | Near real-time | Crop fire detection |

### 4.2 Derived Layers — Deviance from Past Period Dataset (DPPD) (8 layers)

AI/ML-generated trend layers showing 6-month deviance from historical patterns:

| # | DPPD Layer | What It Shows |
|---|-----------|---------------|
| 19 | Soil Moisture DPPD | 6-month deviance in soil moisture |
| 20 | LAI DPPD | 6-month change in canopy cover |
| 21 | NDWI DPPD | 6-month deviance in water index |
| 22 | NDVI DPPD | 6-month vegetation health change |
| 23 | LST DPPD | 6-month temperature variations |
| 24 | Crop Fires DPPD | 6-month fire count changes (negative = improvement) |
| 25 | NO2 DPPD | 6-month air quality changes |
| 26 | PM2.5 DPPD | 6-month particulate matter deviance |

**Total: 26 data layers (18 primary + 8 derived)**

---

## 5. Technical Architecture

### 5.1 Repository Structure

```
undpindia/dicra/
├── src/
│   ├── api/                    # Python backend (Flask/FastAPI + Gunicorn)
│   │   ├── app/                # Core application logic
│   │   ├── alembic/            # Database migrations (SQLAlchemy)
│   │   ├── example_calls/      # API usage examples
│   │   ├── Dockerfile          # Container config
│   │   ├── docker-compose.yml  # Multi-container orchestration
│   │   ├── requirements.txt    # Python dependencies
│   │   └── gunicorn.py         # WSGI server config
│   ├── data_preprocessing/     # Data pipeline scripts
│   ├── database_migrations/    # Schema management
│   ├── documentation/          # Internal docs
│   └── web_portal/             # React frontend
│       ├── src/                # React source code
│       ├── public/             # Static assets
│       └── package.json        # Node dependencies
├── analytics/
│   ├── ICRISAT/                # Partner analysis notebooks
│   ├── references/             # Reference materials
│   ├── sandbox/                # Experimental analysis
│   ├── datasets_metadata.xlsx  # Dataset catalog
│   └── peer-review-guidelines.md
├── automation/                 # CI/CD and automation scripts
├── .github/workflows/          # GitHub Actions
├── DataLayers.md               # Complete layer documentation
├── DataDownload.md             # Download guide
└── LICENSE                     # MIT
```

### 5.2 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React (JavaScript) |
| **Backend API** | Python (Flask/FastAPI) + Gunicorn WSGI |
| **Database** | PostgreSQL (inferred from Alembic/SQLAlchemy) |
| **Data Processing** | Jupyter Notebooks (97.7% of repo), Python |
| **ML/AI** | Positive/Negative Deviance algorithms, OpenAI integration |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Geospatial** | GeoTIFF format, raster/vector data |
| **Data Sources** | NASA, Copernicus, ESA, WorldPop, SoilGrids, ICRISAT |

### 5.3 Data Access Methods

| Method | Detail |
|--------|--------|
| **Web Portal** | Interactive map-based exploration with layer selection |
| **Data Download** | Manual 7-step process: select layer → date → format (raster/vector) → boundary → name → email → usage type |
| **Open API** | Available but not extensively documented publicly |
| **Format** | GeoTIFF for raster data |
| **Time Series** | 6 months, 1 year, 3 years trend views |

---

## 6. DPI (Digital Public Infrastructure) Positioning

DiCRA is explicitly classified as a **Digital Public Good** aligned with India's DPI philosophy:

| DPI Principle | DiCRA Implementation |
|--------------|---------------------|
| **Open Access** | All data layers freely accessible |
| **Open Software** | MIT-licensed codebase |
| **Open Code** | Full source code on GitHub |
| **Open APIs** | API endpoints for programmatic access |
| **Interoperability** | GeoTIFF standard format, REST APIs |
| **Citizen Engagement** | 100+ trained citizen scientists, crowdsourced validation |

**Connection to India Stack:** DiCRA is being positioned as the foundational data layer of a "National Climate Stack" — analogous to how Aadhaar is the identity layer and UPI is the payments layer. The Climate Stack would integrate climate data streams through interoperable APIs for agriculture, rural finance, and public planning.

---

## 7. Partner Ecosystem

| Partner | Role |
|---------|------|
| **UNDP India Accelerator Labs** | Creator, technical leadership |
| **NABARD** | Host, maintainer, policy integration |
| **Government of Telangana** | Primary pilot state, data provider |
| **ICRISAT** | Crop data, agriculture analytics |
| **Zero Hunger Lab (Netherlands)** | Research collaboration |
| **JADS (Netherlands)** | Data science expertise |
| **RICH** | Implementation partner |
| **Rockefeller Foundation** | Funding support |
| **Gates Foundation** | Climate Stack Innovation Challenge co-sponsor |
| **Dalberg** | Climate Stack Innovation Challenge partner |
| **mistEO** | CTO/technical advisor |

---

## 8. Current Use Cases (Validated)

| Use Case | Stakeholder | How DiCRA Serves It |
|----------|-------------|---------------------|
| **Public Investment Optimization** | NABARD, State Govts | Optimizes ~$71M in investments under Telangana's Rythu Vedika scheme |
| **Climate Vulnerability Mapping** | District Officials | Identifies vulnerable vs. resilient farms at district/mandal level |
| **Trend Analysis** | Researchers, Policy | 6-month, 1-year, 3-year trends via DPPD layers |
| **Crop Fire Monitoring** | Agriculture Dept | Near real-time fire detection via NASA FIRMS |
| **Land Use Change Detection** | Planning Depts | 10m resolution LULC from Sentinel-2 |
| **Warehouse Infrastructure** | Supply Chain | Geolocation of storage facilities with capacity data |
| **Citizen Science** | Community | 100 trained citizen scientists contributing field validation |
| **Academic Research** | Universities | Open data for agricultural and climate research |

---

## 9. Gaps & Limitations Assessment

### 9.1 Data Gaps

| Gap | Impact |
|-----|--------|
| **No real-time weather** | Cannot support immediate decision-making |
| **No crop price data** | Missing economic dimension for farmers |
| **No groundwater data** | Critical for irrigation planning |
| **No soil type mapping** | Beyond SOC, no comprehensive soil classification |
| **No crop-specific data** | Layers are crop-agnostic (NDVI, not "rice yield") |
| **No flood/drought forecast** | Reactive, not predictive |
| **9km soil moisture resolution** | Too coarse for farm-level decisions |
| **Limited temporal depth** | DPPD only goes 6 months back |

### 9.2 Feature Gaps

| Gap | Impact |
|-----|--------|
| **No alert/notification system** | Users must manually check for changes |
| **No mobile app** | Not accessible to field officers without desktop |
| **No offline capability** | Useless in areas with poor connectivity |
| **No localized language support** | Barrier for district officials and farmers |
| **Manual download process** | 7-step form instead of API-first approach |
| **No dashboard/reporting** | Cannot generate ready-to-present reports |
| **No user roles/permissions** | Same interface for all stakeholders |
| **No integration with government systems** | Standalone platform, not plugged into workflows |
| **No decision support** | Shows data but doesn't recommend actions |
| **Limited API documentation** | Barrier to developer adoption |

### 9.3 Architectural Gaps

| Gap | Impact |
|-----|--------|
| **JS-rendered SPA** | Poor SEO, accessibility issues, slow on low-end devices |
| **Monolithic repo** | Frontend, backend, analytics, data all in one repo |
| **Jupyter-heavy processing** | Hard to automate, scale, or schedule |
| **No event/streaming architecture** | Cannot push updates to subscribers |
| **No caching layer** | Performance under load unknown |

---

## 10. Evolution: The Climate Stack Vision

The **National Climate Stack Innovation Challenge** (launched March 2026) signals DiCRA's evolution from a data platform to a **climate intelligence infrastructure**:

```
Current DiCRA                    →    Climate Stack Vision
─────────────────────────────────────────────────────────────
Static data layers               →    Real-time climate streams
Manual exploration                →    API-first architecture
Reactive analysis                 →    Predictive hazard forecasting (10-15 yr)
Single platform                   →    Interoperable stack with plugins
Researcher-focused                →    Multi-stakeholder (farmer → banker → policy)
Telangana-centric                 →    National + international
```

**Key Requirements from the Challenge:**
- Localized near-term (10-15 year) hazard forecasts
- Interactive dashboards for climate risk visualization
- Interoperable APIs for integration
- Scientific rigor + practical relevance
- Support for agriculture, rural governance, disaster management

---

## Sources

- [DiCRA Platform](https://dicra.nabard.org/)
- [GitHub: undpindia/dicra](https://github.com/undpindia/dicra)
- [UNDP Digital X: DiCRA Catalog](https://digitalx.undp.org/catalogs/dicra.html)
- [UNDP India + NABARD Partnership](https://www.undp.org/india/press-releases/undp-india-partners-nabard-boost-data-driven-innovations-agriculture)
- [Climate Stack Innovation Challenge](https://www.climatestackinnovationchallenge.com/)
- [NABARD Climate Stack Launch (YourStory)](https://yourstory.com/2026/03/nabard-launches-national-climate-stack-innovation-challenge-secure-indias-agricultural-future)
- [NABARD + Gates Foundation Partnership (WebNewsWire)](https://www.webnewswire.com/2026/03/06/nabard-in-partnership-with-gates-foundation-and-dalberg-launches-national-climate-stack-innovation-challenge-to-build-climate-intelligence-for-rural-india/)
- [DiCRA UPSC Analysis (Vajiram & Ravi)](https://vajiramandravi.com/upsc-daily-current-affairs/prelims-pointers/what-is-the-dicra-platform/)

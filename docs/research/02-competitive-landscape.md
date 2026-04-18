# Phase 2: Competitive Landscape & Knowledge Base

## 1. Comparison Framework

Platforms are compared across these dimensions:

| Dimension | What It Measures |
|-----------|-----------------|
| **Objective** | Primary mission and problem being solved |
| **Geographic Scope** | Coverage area and administrative granularity |
| **Data Types** | Satellite, weather, agricultural, socioeconomic, financial |
| **Resolution** | Spatial and temporal granularity |
| **Target Users** | Farmers, govt, researchers, banks, NGOs |
| **Technology** | Open source, APIs, interoperability |
| **Decision Support** | Raw data vs. actionable intelligence vs. forecasting |
| **DPI Alignment** | Open access, open APIs, standards compliance |
| **Agriculture Focus** | Generic climate vs. agriculture-specific |
| **Financial Integration** | Connection to lending, insurance, investment decisions |

---

## 2. Platform Profiles

### 2.1 Indian Platforms

#### A. BHUVAN (ISRO)
| Attribute | Detail |
|-----------|--------|
| **Organization** | ISRO (Indian Space Research Organisation) |
| **URL** | https://bhuvan.nrsc.gov.in/ |
| **Objective** | National geospatial platform for multi-sectoral applications |
| **Scope** | All of India; 1m to 56m resolution satellite imagery |
| **Data Types** | Multi-sensor, multi-platform satellite imagery; hydrological boundaries; climate & environment; forestry; water; agriculture; disaster alerts |
| **Agriculture Features** | Annual LULC mapping (since 2014), agricultural drought assessment, crop insurance support, automatic weather stations (AWS) |
| **Climate Features** | Forest fire alerts, real-time weather data, flood forecasting |
| **Target Users** | Government departments, researchers, planners |
| **Technology** | Proprietary web GIS platform, API access, IoT integration planned |
| **Strengths** | Massive dataset (Indian satellites), government mandate, high resolution, national coverage |
| **Weaknesses** | Not agriculture-specific; complex interface; limited ML/AI-driven insights; not designed for decision support |
| **vs. DiCRA** | Much broader scope but shallower on agriculture-specific analytics. BHUVAN is infrastructure; DiCRA is intelligence |

#### B. India-WRIS (Water Resources Information System)
| Attribute | Detail |
|-----------|--------|
| **Organization** | Ministry of Jal Shakti / National Water Informatics Centre (NWIC) |
| **URL** | https://indiawris.gov.in/ |
| **Objective** | Single-window solution for water resource management |
| **Scope** | All of India |
| **Data Types** | Rainfall (real-time + historical), water levels & discharge, groundwater levels, reservoir storage, evapotranspiration, soil moisture, water quality |
| **Agriculture Features** | Irrigation project data, water availability for agriculture, evapotranspiration monitoring |
| **Target Users** | Water managers, state/central water agencies, planners |
| **Technology** | Web GIS with dashboards, telemetry data (GPRS/satellite), time-series analysis |
| **Strengths** | Real-time water data, comprehensive hydrological coverage, government authority |
| **Weaknesses** | Water-only focus; no crop, vegetation, or air quality data; not a DPG; limited API access |
| **vs. DiCRA** | Complementary — DiCRA lacks groundwater/irrigation data that WRIS has; WRIS lacks vegetation/crop analytics DiCRA has |

#### C. Krishi Decision Support System (DSS)
| Attribute | Detail |
|-----------|--------|
| **Organization** | Ministry of Agriculture / ICAR |
| **Objective** | Weather-based crop advisories for farmers |
| **Scope** | District-level across India |
| **Data Types** | Weather forecasts, crop advisories, soil data |
| **Agriculture Features** | Crop-specific recommendations, pest/disease alerts, sowing advisories |
| **Target Users** | Farmers, extension officers |
| **Strengths** | Directly actionable for farmers; crop-specific; multilingual |
| **Weaknesses** | Advisory-focused (not analytical); limited geospatial visualization; siloed from other platforms |
| **vs. DiCRA** | Krishi DSS is "what to do"; DiCRA is "what's happening." Complementary, not competing |

#### D. Krishi Decision Support System (Krishi DSS)
| Attribute | Detail |
|-----------|--------|
| **Organization** | Ministry of Agriculture & Farmers' Welfare / ISRO/NRSC |
| **Objective** | Geospatial DSS for crop monitoring, yield forecasting, drought assessment, and agricultural planning |
| **Scope** | India — district and sub-district levels |
| **Data Types** | Crop maps, sowing progress, crop condition (NDVI), drought indices, weather data, soil health, crop acreage estimation |
| **Features** | FASAL (crop output forecasting using space + agro-met), CHAMAN (horticulture assessment), NADAMS (drought monitoring), district crop reports |
| **Target Users** | Agricultural ministry officials, state agriculture departments, crop insurance agencies |
| **Technology** | ISRO satellite data, BHUVAN infrastructure, GIS analytics |
| **Strengths** | Official government crop monitoring system; operational yield forecasting; integrates multiple national schemes; policy-linked |
| **Weaknesses** | Primarily government-internal; limited public accessibility; less focus on climate resilience/adaptation; UI/UX not modern |
| **vs. DiCRA** | Closest Indian competitor — both do district-level agriculture + satellite data. But Krishi DSS focuses on production monitoring while DiCRA focuses on climate resilience. Krishi DSS is government-centric; DiCRA targets broader development stakeholders |

#### E. mKisan Portal
| Attribute | Detail |
|-----------|--------|
| **Organization** | Ministry of Agriculture & Farmers' Welfare |
| **Objective** | Location-specific agricultural advisories to farmers via SMS, mobile app, web |
| **Scope** | India — block/village level |
| **Data Types** | Weather advisories, crop-specific guidance, pest/disease alerts, market prices, scheme info |
| **Features** | SMS-based advisories, multi-lingual support, push notifications, KVK integration |
| **Target Users** | Farmers directly, agricultural extension workers |
| **Strengths** | Direct farmer outreach; local-language support; massive reach (millions of farmers); practical and actionable |
| **Weaknesses** | Not a geospatial/analytics platform; no visualization or mapping; advisory not analytical |
| **vs. DiCRA** | Fundamentally different — mKisan is farmer-facing advisory, DiCRA is planner/policymaker analytics. Complementary: DiCRA analytics could feed into mKisan advisories |

#### F. ICAR Platforms / NICRA
| Attribute | Detail |
|-----------|--------|
| **Organization** | Indian Council of Agricultural Research (ICAR), Krishi Vigyan Kendras (KVKs) |
| **Objective** | Research-based agricultural advisories, weather-based crop management, pest surveillance |
| **Scope** | India — varies by platform (national to district) |
| **Data Types** | Agro-met advisories, crop research data, pest/disease data, variety performance, soil test data |
| **Features** | DAMU (District Level Agro-Met) bulletins, NICRA (National Innovations in Climate Resilient Agriculture) project data, crop planning tools |
| **Target Users** | Researchers, extension workers, farmers |
| **Strengths** | Deep domain expertise; research-backed; extensive KVK network; NICRA specifically addresses climate resilience |
| **Weaknesses** | Fragmented across multiple portals; not integrated as a single platform; limited modern visualization; research-oriented |
| **vs. DiCRA** | ICAR/NICRA has deeper agricultural science but lacks DiCRA's unified geospatial visualization and policy-ready analytics |

#### G. State-Level Agricultural DSS (e.g., Mahavedh, AP/Telangana DSS)
| Attribute | Detail |
|-----------|--------|
| **Organization** | Various state governments (Maharashtra, Karnataka, Andhra Pradesh, Telangana) |
| **Objective** | State-specific crop monitoring, weather stations, agricultural planning |
| **Scope** | Individual states — taluka/mandal level |
| **Data Types** | Automatic Weather Station (AWS) data, crop damage reports, rainfall, soil data, irrigation data |
| **Features** | Dense weather station networks, crop insurance support, drought declaration support, real-time weather monitoring |
| **Target Users** | State agriculture departments, district collectors, crop insurance companies |
| **Strengths** | Hyper-local data; real-time ground-truth stations; operationally linked to state schemes; dense sensor networks |
| **Weaknesses** | State-specific (no national integration); limited climate modeling; technology quality varies widely |
| **vs. DiCRA** | State DSS platforms have more granular ground-truth data but are fragmented. DiCRA provides a national satellite-derived view. Complementary at different scales |

#### H. Digital Agriculture Mission Platforms
| Attribute | Detail |
|-----------|--------|
| **Organization** | Government of India |
| **Objective** | Unified digital infrastructure for Indian agriculture |
| **Components** | AgriStack (farmer registry + land records + crop sown), India Digital Ecosystem of Agriculture (IDEA) |
| **DPI Alignment** | Core DPI initiative — Aadhaar-linked farmer IDs, consent-based data sharing |
| **Agriculture Features** | Farmer identity, land records, crop surveys, credit access |
| **Strengths** | Government-backed DPI with massive scale potential; integrates identity + land + finance |
| **Weaknesses** | Still in development; limited climate/geospatial data; privacy concerns around farmer data |
| **vs. DiCRA** | AgriStack provides the identity/land layer; DiCRA provides the climate/environment layer. A Climate Stack could bridge both |

---

### 2.2 International Platforms

#### E. NASA SERVIR
| Attribute | Detail |
|-----------|--------|
| **Organization** | NASA + USAID joint initiative |
| **URL** | https://www.servirglobal.net/ |
| **Objective** | Help developing countries use satellite data for climate risk management |
| **Scope** | 50+ countries across Africa, Asia, Central/South America |
| **Data Types** | Satellite imagery, GeoAI products, weather data, crop yield estimates |
| **Features** | Yield estimation, condition mapping, risk assessment, early warning, custom Earth observation applications |
| **Target Users** | Government agencies, regional organizations in developing countries |
| **Technology** | GeoAI, satellite monitoring, predictive models, online geospatial portal |
| **Impact** | 47 co-developed services, 600+ institutional collaborations, 10,000+ trained |
| **Strengths** | Massive scale, NASA data access, locally-led development model, capacity building |
| **Weaknesses** | Not India-specific; requires local adaptation; not a data platform per se but a capacity building program |
| **vs. DiCRA** | SERVIR is a program that builds capacity; DiCRA is a product that serves data. DiCRA could be a SERVIR-type product for India's Climate Stack |

#### F. Digital Earth Africa
| Attribute | Detail |
|-----------|--------|
| **Organization** | Digital Earth Africa (multi-partner) |
| **URL** | https://www.digitalearthafrica.org/ |
| **Objective** | Open access satellite data for sustainable development across Africa |
| **Scope** | Entire African continent |
| **Data Types** | 80+ spatial datasets — land cover, coasts, agriculture, topography, water, vegetation |
| **Features** | Explorer (visual), Maps platform (analysis), Sandbox (JupyterHub for Python analysis), Cropland Extent Map, Fractional Cover, NDVI anomalies, CHIRPS rainfall |
| **Target Users** | Governments, researchers, developers, entrepreneurs |
| **Technology** | Open Data Cube, JupyterHub, GeoTIFF, open APIs |
| **Strengths** | Continental scale, developer-friendly (Sandbox), open data cube architecture, strong crop mapping |
| **Weaknesses** | Africa-specific; less granular than country-specific platforms |
| **vs. DiCRA** | DE Africa is the gold standard for what DiCRA could become — similar mission but with much more mature data infrastructure, developer tools (Sandbox), and scale. Key lesson: JupyterHub sandbox for users |

#### G. FAO GIEWS (Global Information and Early Warning System)
| Attribute | Detail |
|-----------|--------|
| **Organization** | UN Food and Agriculture Organization (FAO) |
| **URL** | https://www.fao.org/giews/en/ |
| **Objective** | World's leading source of information on global food production and food security |
| **Scope** | All countries worldwide |
| **Data Types** | Crop production forecasts, food prices (90 countries), supply/utilization balances (220 countries since 1980), Agricultural Stress Index (ASI), vegetation health, water availability |
| **Features** | Country briefs, food price monitoring (FPMA), crop assessments (CFSAMs), ASI drought detection, cereal balance sheets |
| **Target Users** | Governments, international organizations, policy makers, humanitarian agencies |
| **Technology** | Web portal, data tools, remote sensing integration |
| **Strengths** | Longest-running system (since 1970s); authoritative; global coverage; integrates field missions with remote sensing |
| **Weaknesses** | Country/regional level (not district); food security focus rather than farm-level intelligence; slow update cycle |
| **vs. DiCRA** | GIEWS operates at macro level (country food security); DiCRA operates at micro level (district/farm resilience). Different scales of the same problem |

#### H. World Bank Climate Change Knowledge Portal (CCKP)
| Attribute | Detail |
|-----------|--------|
| **Organization** | World Bank Group |
| **URL** | https://climateknowledgeportal.worldbank.org/ |
| **Objective** | Comprehensive data and tools for climate risk understanding and adaptation |
| **Scope** | Global — all countries |
| **Data Types** | 70+ climate variables and indices, agricultural projections (2050/2080), natural hazards, water, sea level rise, GDP-agriculture correlation |
| **Features** | Country/sector profiles, Climate Smart Agriculture (CSA) profiles, scenario-based projections, World Bank project mapping |
| **Target Users** | Policy makers, development practitioners, researchers |
| **Technology** | Web portal, data on AWS (open data), scenario tools |
| **Strengths** | Authoritative global data; future projections; integrates with World Bank lending/projects; CSA profiles |
| **Weaknesses** | Country-level granularity (not district); projection-focused (not operational); no real-time data |
| **vs. DiCRA** | CCKP is strategic planning (decade-scale projections); DiCRA is operational monitoring (season-scale). CCKP could inform DiCRA's long-term forecasting models |

#### I. Climate Engine
| Attribute | Detail |
|-----------|--------|
| **Organization** | Desert Research Institute / Climate Engine (commercial) |
| **URL** | https://www.climateengine.com/ |
| **Objective** | Cloud-based climate and remote sensing analytics |
| **Scope** | Global |
| **Data Types** | Satellite imagery (Landsat, MODIS, Sentinel), gridded climate data, drought indices |
| **Features** | On-demand analytics, custom area analysis, time-series, anomaly detection, API access, Google Earth Engine integration |
| **Target Users** | Researchers, government, commercial (insurance, agriculture) |
| **Technology** | Google Earth Engine backend, cloud computing, REST APIs |
| **Strengths** | Powerful analytics; developer-friendly APIs; commercial support; Google Cloud scalability |
| **Weaknesses** | Commercial/freemium model; not a DPG; US-centric development |
| **vs. DiCRA** | Climate Engine is what DiCRA's API layer could aspire to — robust, scalable, developer-friendly. But DiCRA's advantage is its DPG status and India-specific curation |

#### J. CGIAR Climate Services / CCAFS
| Attribute | Detail |
|-----------|--------|
| **Organization** | CGIAR (formerly CCAFS — Climate Change, Agriculture and Food Security) |
| **URL** | Various CGIAR center portals |
| **Objective** | Provide climate information services to support agricultural adaptation and food security in developing countries |
| **Scope** | Global (focus on Sub-Saharan Africa, South Asia, Southeast Asia, Latin America) |
| **Data Types** | Seasonal climate forecasts, crop model outputs (DSSAT, APSIM), climate-smart agriculture practices, downscaled climate projections |
| **Features** | CSA prioritization tools, participatory scenario planning, seasonal forecast communication, CSA country profiles |
| **Target Users** | Agricultural researchers, extension services, policymakers, farmers (through intermediaries) |
| **Technology** | Crop models (DSSAT, APSIM), climate model downscaling, web portals, mobile services |
| **Strengths** | Deep agricultural science; integrates climate science with farming practice; strong research base; South Asia relevant |
| **Weaknesses** | Fragmented across multiple CGIAR centers; research-oriented not operational; limited real-time monitoring |
| **vs. DiCRA** | CGIAR tools provide deeper crop modeling but lack DiCRA's unified visualization platform. DiCRA is more operational/policy-ready. CGIAR crop models (DSSAT/APSIM) could be integrated into DiCRA for yield forecasting |

#### K. Google Earth Engine (GEE)
| Attribute | Detail |
|-----------|--------|
| **Organization** | Google |
| **URL** | https://earthengine.google.com/ |
| **Objective** | Cloud-based platform for planetary-scale geospatial analysis |
| **Scope** | Global — pixel-level |
| **Data Types** | Petabytes of satellite imagery (Landsat, Sentinel, MODIS), climate data, elevation, land cover, socioeconomic data |
| **Features** | JavaScript/Python API, code editor, massive data catalog, cloud computing, community scripts |
| **Target Users** | Researchers, scientists, developers |
| **Technology** | Google Cloud infrastructure, parallel processing, JavaScript/Python APIs |
| **Strengths** | Unmatched data catalog and computing power; free for research; large community; DiCRA itself uses GEE as backend |
| **Weaknesses** | Requires programming skills; not a decision-support tool; no policy/decision frameworks |
| **vs. DiCRA** | GEE is the engine; DiCRA is the car built on it. DiCRA adds India-specific context, pre-computed indicators, and a non-technical user interface on top of GEE's raw capability |

#### L. FEWS NET (Famine Early Warning Systems Network)
| Attribute | Detail |
|-----------|--------|
| **Organization** | USAID |
| **URL** | https://fews.net/ |
| **Objective** | Early warning and analysis on acute food insecurity |
| **Scope** | Africa, Central America, Afghanistan, Haiti, Yemen |
| **Data Types** | Food security projections, market prices, rainfall anomalies, vegetation conditions, conflict data |
| **Features** | IPC food security classification, market monitoring, scenario-based projections, monthly reports |
| **Target Users** | Humanitarian organizations, governments, donors |
| **Strengths** | Integrates climate + conflict + economics for food security; actionable early warning |
| **Weaknesses** | Humanitarian focus (crisis countries only); not applicable to India's context directly |
| **vs. DiCRA** | FEWS NET's multi-dimensional approach (climate + economics + conflict) is a model for how DiCRA could integrate non-climate factors |

---

### 2.3 Financial Sector Climate Tools

#### K. RBI Climate Risk Information System (RB-CRIS) [Proposed]
| Attribute | Detail |
|-----------|--------|
| **Organization** | Reserve Bank of India |
| **Status** | Proposed / Under development |
| **Objective** | Bridge data gaps for climate risk assessment in Indian banking |
| **Relevance** | Banks need granular climate data for TCFD reporting, credit risk assessment, and stress testing |
| **Current Gap** | India lacks a dedicated carbon emissions database or sector-level net-zero pathways |
| **vs. DiCRA** | RB-CRIS would be the demand-side; DiCRA could be the supply-side for agricultural climate risk data |

#### L. TCFD-Aligned Bank Tools (ICICI, HDFC, SBI frameworks)
| Attribute | Detail |
|-----------|--------|
| **Users** | Major Indian banks (after RBI's 2024 Draft Disclosure Framework) |
| **Need** | Borrower-specific climate risk scores, sector-specific policies, ESG integration in credit |
| **Current State** | 196 staff across 10 financial institutions trained (including NABARD) |
| **Gap** | No standardized India-specific climate risk data for agriculture lending |
| **vs. DiCRA** | DiCRA could become the authoritative data source for agriculture climate risk scoring used by banks |

---

## 3. Comparative Matrix

| Platform | Scope | Agri Focus | Resolution | Decision Support | Open/DPG | API Quality | Finance Link | Real-time |
|----------|-------|-----------|------------|-----------------|----------|-------------|-------------|-----------|
| **DiCRA** | India (Telangana) | High | 10m-9km | Medium (trends) | Yes (MIT) | Basic | None | No |
| **BHUVAN** | India | Low | 1m-56m | Low (viewer) | Partial | Medium | None | Partial |
| **India-WRIS** | India | Low (water) | Varies | Medium | No | Limited | None | Yes |
| **Krishi DSS** | India | Very High | District | High (advisories) | Limited | No | None | Medium |
| **mKisan** | India | Very High | Block | High (advisory) | Yes | No | None | High |
| **AgriStack** | India | High (ID/land) | Farm-level | Low (infra) | DPI | Planned | Yes (credit) | Low |
| **ICAR/NICRA** | India | Very High | Varies | Medium | Partial | No | None | Low |
| **State DSS** | Single state | High | Taluka | High | Limited | No | Medium (ins.) | High |
| **NASA SERVIR** | 50+ countries | Medium | Varies | Medium | Open | Yes | None | No |
| **DE Africa** | Africa | Medium | 10m+ | High (sandbox) | Yes | Strong | None | No |
| **FAO GIEWS** | Global | High | Country | High (warning) | Partial | Medium | None | No |
| **WB CCKP** | Global | Medium | Country | Medium (proj.) | Yes | Good | Yes (WB) | No |
| **CGIAR/CCAFS** | Global (focus) | Very High | Varies | Medium | Partial | No | None | No |
| **GEE** | Global | Low (raw) | Pixel | None (infra) | Yes (res.) | Excellent | None | High |
| **Climate Engine** | Global | Low | 30m+ | High | Freemium | Excellent | Yes (ins.) | Near |
| **FEWS NET** | Crisis countries | High | Sub-national | Very High | Open | Medium | None | No |
| **TCFD Tools** | Global | Low | Company | High (financial) | No ($$) | High | Very High | Medium |
| **RB-CRIS** | India | — | — | — | TBD | TBD | Yes (core) | TBD |

---

## 4. Key Insights from Comparison

### 4.1 DiCRA's Unique Position
DiCRA occupies a **niche that no other platform fills**: India-specific, district-level, agriculture-focused, open-source climate intelligence. No competitor combines all of:
- Indian administrative boundary alignment (district/mandal)
- Agriculture-specific layer curation (not generic satellite data)
- Digital Public Good status
- AI/ML-derived deviance analysis
- NABARD institutional backing (access to banking sector)

### 4.2 Gaps Relative to Best-in-Class

| Capability | Best-in-Class | DiCRA Status |
|-----------|--------------|-------------|
| **Developer Experience** | Climate Engine, DE Africa (APIs, Sandbox) | Weak — manual download, limited API docs |
| **Decision Support** | FEWS NET, Krishi DSS (actionable alerts) | Weak — data without recommendations |
| **Financial Integration** | Climate Engine (insurance), AgriStack (credit) | None — no banking/finance features |
| **Real-time Data** | BHUVAN (weather), WRIS (water levels) | None — monthly/yearly updates only |
| **Predictive Capability** | WB CCKP (2050/2080), FEWS NET (3-month outlook) | None — retrospective only |
| **Mobile/Offline** | Krishi DSS (mKisan SMS) | None — desktop web only |
| **Scale** | BHUVAN (all India), DE Africa (continent) | Limited — Telangana primary |
| **Multi-language** | Krishi DSS (12+ languages) | None — English only |

### 4.3 Strategic Threats

| Threat | Risk Level | Mitigation |
|--------|-----------|------------|
| **Krishi DSS expands into climate resilience** | High — same ministry, same data sources | DiCRA must differentiate on openness (DPG) and financial sector integration |
| **AgriStack becomes dominant govt agriculture platform** | Medium — could marginalize standalone tools | Position DiCRA as the climate layer OF AgriStack, not competing with it |
| **Commercial platforms (Climate Engine, startups) build India-specific products** | Medium — better tech, more resources | DiCRA's advantages: DPG status, NABARD backing, institutional mandate |
| **State DSS platforms build climate analytics independently** | Low-Medium — fragments demand | Offer DiCRA as the national standard that states can customize |
| **GEE-based startups** replicate DiCRA's analytics | Medium — low barrier with GEE | Speed of execution + institutional relationships are the moat |

### 4.4 Partnership Opportunities

| Partner | What They Bring | What DiCRA Brings |
|---------|----------------|-------------------|
| **Krishi DSS** | Government crop monitoring data, official status | Climate resilience analytics, open platform |
| **BHUVAN/ISRO** | Indian satellite data streams (Resourcesat, Cartosat) | Agriculture-specific analytics and curation |
| **India-WRIS** | Groundwater, river, reservoir data | Vegetation, crop, and air quality layers |
| **NASA SERVIR (ICIMOD)** | Technical collaboration, GEE expertise | India-specific implementation, institutional access |
| **Digital Earth Africa** | Architecture blueprint (Open Data Cube, Sandbox) | South-South collaboration model |
| **CGIAR (ICRISAT is already a partner)** | Crop models (DSSAT/APSIM) for yield forecasting | Operational platform for deploying model outputs |
| **AgriStack** | Farmer identity, land records | Climate risk layer per farmer/land parcel |
| **mKisan** | Last-mile farmer reach (SMS, vernacular) | Climate intelligence to power advisories |
| **RB-CRIS (proposed)** | Banking sector demand, regulatory mandate | Agricultural climate risk data supply |

### 4.5 Integration Opportunities

```
AgriStack (farmer ID + land) + DiCRA (climate layers) + WRIS (water) + Krishi DSS (advisories)
    ↓
    National Climate Stack
    ↓
    Feeds into: RB-CRIS (banking risk) + TCFD reporting + Insurance products
```

---

## Sources

- [BHUVAN - ISRO Geo-Platform](https://bhuvan.nrsc.gov.in/)
- [BHUVAN: Transforming India's Governance (OGC)](https://www.ogc.org/blog-article/bhuvan-transforming-indias-governance-with-geospatial-insights/)
- [India-WRIS Portal](https://indiawris.gov.in/)
- [India-WRIS (NWIC)](https://nwic.gov.in/india-wris)
- [NASA SERVIR Global](https://www.servirglobal.net/)
- [Digital Earth Africa](https://www.digitalearthafrica.org/)
- [DE Africa Data & Products Docs](https://docs.digitalearthafrica.org/en/latest/data_specs/index.html)
- [FAO GIEWS](https://www.fao.org/giews/en/)
- [FAO GIEWS Data & Tools](https://www.fao.org/giews/data-tools/en/)
- [World Bank CCKP](https://climateknowledgeportal.worldbank.org/)
- [WB CCKP Data on AWS](https://worldbank.github.io/climateknowledgeportal/README.html)
- [Climate Engine](https://www.climateengine.com/)
- [FEWS NET](https://fews.net/)
- [Climate Stack Innovation Challenge](https://www.climatestackinnovationchallenge.com/)
- [ODI: Managing Climate Risks in India's Financial Sector](https://odi.org/en/about/our-work/strengthening-climate-risk-assessment-and-enabling-central-bank-supervision-in-the-indian-financial-sector-a-partnership-with-frontrunning-banks-and-dfis/)
- [UK PACT: Equipping India's Financial Sector](https://www.ukpact.co.uk/case-studies/equipping-india-financial-sector-for-climate-risks)
- [KPMG: Steering Climate Risk for Banks](https://kpmg.com/in/en/blogs/2024/07/steering-climate-risk-bringing-banks-on-board.html)
- [Climate Risk Horizons: India's Big Banks](https://climateriskhorizons.com/research/Still-Unprepared.pdf)

# Phase 3: Expert Use-Case Analysis & Expansion Roadmap

*Analysis from the perspective of experts in climate action, climate governance, banking, and government administration.*

---

## 1. Stakeholder Map

```
                    ┌─────────────────┐
                    │   NABARD HQ     │ Policy, schemes, fund allocation
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───────┐ ┌───▼──────┐ ┌─────▼──────────┐
     │ NABARD District │ │ State    │ │ Commercial &   │
     │ Development     │ │ Govt     │ │ Cooperative     │
     │ Managers (DDMs) │ │ Depts    │ │ Banks           │
     └────────┬───────┘ └───┬──────┘ └─────┬──────────┘
              │              │              │
     ┌────────▼───────┐ ┌───▼──────┐ ┌─────▼──────────┐
     │ District       │ │ Block &  │ │ Branch          │
     │ Collectors     │ │ Mandal   │ │ Managers         │
     │ (DM/DC)        │ │ Officers │ │ (Rural/Agri)     │
     └────────┬───────┘ └───┬──────┘ └─────┬──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───────┐ ┌───▼──────┐ ┌─────▼──────────┐
     │ FPOs / SHGs    │ │ Civil    │ │ Insurance       │
     │ Farmer Groups  │ │ Society  │ │ Companies       │
     │                │ │ / NGOs   │ │ (PMFBY etc.)    │
     └────────────────┘ └──────────┘ └────────────────┘
```

---

## 2. Use Cases by Stakeholder

### 2.1 NABARD District Development Managers (DDMs)

DDMs are NABARD's field officers responsible for credit planning, scheme monitoring, and development banking at the district level.

| # | Use Case | Current DiCRA | Gap | Expansion Potential |
|---|----------|--------------|-----|-------------------|
| 1 | **District Credit Plan preparation** — DDMs prepare annual credit plans for each district. They need to know which crops are viable, what infrastructure exists, and where climate risks are highest | Partial — LULC, crop intensity, warehouse data available | No integration with credit data, no crop-yield projections, no risk scoring | **HIGH** — Overlay DiCRA climate layers with crop loan data to generate climate-adjusted credit plans |
| 2 | **Watershed development scheme monitoring** — NABARD funds watershed projects. DDMs need to track impact on soil moisture, vegetation, water availability | Partial — NDVI, NDWI, soil moisture trends available | No before/after comparison tool, no scheme boundary overlays | **HIGH** — Add scheme polygons as a layer, enable before/after analysis with DPPD data |
| 3 | **Farm Infrastructure Fund allocation** — Prioritizing warehouses, cold chains, micro-irrigation based on need | Partial — warehouse geolocation exists | No demand-supply gap analysis, no climate vulnerability overlay for infrastructure | **MEDIUM** — Combine crop intensity + warehouse capacity + climate risk for infrastructure priority scoring |
| 4 | **Climate vulnerability assessment for priority sector lending** — Identifying which districts/blocks need more agricultural credit | Partial — crop stress, NDVI deviance, LST available | No composite vulnerability index, no ranking | **HIGH** — Build a composite Climate Vulnerability Index (CVI) combining multiple layers |

### 2.2 District Government Administration (DM/DC & Block Officials)

| # | Use Case | Current DiCRA | Gap | Expansion Potential |
|---|----------|--------------|-----|-------------------|
| 5 | **Drought declaration and response** — District collectors need evidence to declare drought and request relief | Partial — soil moisture, NDVI, precipitation data | No drought severity classification, no automated triggers, no comparison with IMD criteria | **CRITICAL** — Build drought severity dashboard aligned with IMD/State drought manual criteria |
| 6 | **Crop damage assessment** — After floods/drought/hail, rapid assessment for compensation | Partial — NDVI can show damage | No event-specific analysis, no integration with PMFBY or revenue records | **HIGH** — Pre/post-event NDVI comparison tool with exportable reports for compensation claims |
| 7 | **MGNREGA planning** — Choosing which works (farm ponds, check dams, land leveling) to prioritize | Partial — soil moisture, LULC, topography | No recommendation engine, no integration with MGNREGA MIS | **MEDIUM** — Climate-informed MGNREGA work selection tool |
| 8 | **Groundwater management** — Under Atal Bhujal Yojana, districts must prepare groundwater management plans | Missing — no groundwater data in DiCRA | Major gap — WRIS integration needed | **HIGH** — Integrate groundwater levels from India-WRIS |
| 9 | **Disaster preparedness** — Identifying areas at risk of floods, heat waves, cyclones | Missing — no hazard forecasting | No predictive capability | **CRITICAL** — This is the core Climate Stack challenge: 10-15 year hazard projections |
| 10 | **District agriculture plan** — Annual plan for crop diversification, input supply, extension | Partial — crop intensity, croplands, LULC | No crop-specific recommendations, no climate-crop suitability mapping | **HIGH** — Climate-adjusted crop suitability maps |

### 2.3 Banking Sector (Commercial Banks, RRBs, Cooperatives)

| # | Use Case | Current DiCRA | Gap | Expansion Potential |
|---|----------|--------------|-----|-------------------|
| 11 | **Climate-adjusted credit risk scoring** — Agricultural loans need climate risk built into the appraisal | Not addressed | No integration with banking workflows, no risk scores, no borrower-level data | **TRANSFORMATIVE** — API that returns climate risk score for a lat/long or survey number |
| 12 | **TCFD/ESG reporting** — RBI now requires climate risk disclosure | Not addressed | No portfolio-level climate exposure analysis | **HIGH** — Aggregate DiCRA data at portfolio level: "X% of agricultural loans are in climate-vulnerable districts" |
| 13 | **Crop insurance (PMFBY) analytics** — Yield estimation, loss assessment, premium calibration | Partial — NDVI, soil moisture, precipitation as proxies | No yield models, no integration with insurance workflows | **HIGH** — Satellite-based yield estimation models using DiCRA layers |
| 14 | **Branch-level climate intelligence** — Rural branch managers making lending decisions | Not addressed | No branch/block-level dashboards, no integration with CBS | **MEDIUM** — Simplified dashboard for branch managers showing "top 3 climate risks in your area" |
| 15 | **Green finance product design** — Climate-resilient crop loans, solar pump financing, organic farming credit | Not addressed | No identification of "green finance opportunity zones" | **MEDIUM** — Layer showing where green interventions have highest impact potential |
| 16 | **NPA prediction** — Non-performing asset early warning based on crop stress | Not addressed | No link between climate events and loan default probability | **HIGH** — Historical analysis: climate stress episodes → crop loss → NPA correlation |

### 2.4 Civil Society, NGOs, FPOs

| # | Use Case | Current DiCRA | Gap | Expansion Potential |
|---|----------|--------------|-----|-------------------|
| 17 | **Community-level climate awareness** — Educating farmers about changing patterns | Partially possible — trend data exists | No localized, simplified reports; no vernacular language; no mobile access | **HIGH** — Auto-generated village/mandal-level "climate report cards" in local languages |
| 18 | **Advocacy and evidence-building** — NGOs need data to advocate for policy changes | Good — open data, trends, deviance analysis | No pre-built reports or talking points; requires GIS expertise | **MEDIUM** — Template reports with auto-filled data for advocacy briefs |
| 19 | **FPO crop planning** — Farmer Producer Organizations choosing what to grow collectively | Partial — crop intensity, LULC available | No market linkage, no profitability overlay, no advisory | **MEDIUM** — Combine climate suitability + market demand for crop recommendations |
| 20 | **Climate justice monitoring** — Tracking whether the most vulnerable communities get adequate support | Partial — Relative Wealth Index + climate layers exist | No integrated vulnerability scoring | **HIGH** — Composite socio-climatic vulnerability index |

### 2.5 Researchers & Academic Institutions

| # | Use Case | Current DiCRA | Gap | Expansion Potential |
|---|----------|--------------|-----|-------------------|
| 21 | **Agricultural climate research** — Academic studies on climate-agriculture nexus | Good — open data, multiple layers, GeoTIFF format | API limitations, no computational sandbox | **MEDIUM** — JupyterHub sandbox (like DE Africa) |
| 22 | **Model training data** — ML/AI models for crop prediction, drought forecasting | Good — standardized, curated datasets | Limited temporal depth, no labeled training data | **MEDIUM** — Provide curated, labeled ML-ready datasets |

---

## 3. What DiCRA Currently Meets, Doesn't Meet, and Could Expand To

### 3.1 MEETS Well (Current Strengths)

1. **Open access to curated geospatial data** — 26 layers, MIT-licensed code
2. **Vegetation and crop health monitoring** — NDVI, LAI, NDWI at good resolution
3. **Trend analysis** — DPPD layers show 6-month deviance patterns
4. **Fire monitoring** — Near real-time via NASA FIRMS
5. **Land use classification** — 10m resolution from Sentinel-2
6. **Research platform** — Open data + open code for academic use
7. **DPG principles** — Open access, code, software, APIs

### 3.2 DOES NOT MEET (Critical Gaps)

1. **No decision support** — Shows data but doesn't say "therefore, do X"
2. **No financial integration** — No connection to banking/lending/insurance workflows
3. **No real-time capability** — Monthly updates are too slow for disaster response
4. **No predictive forecasting** — Retrospective only, no forward-looking projections
5. **No mobile/offline access** — Excludes field officers and farmers in low-connectivity areas
6. **No multilingual support** — English-only excludes most intended beneficiaries
7. **No groundwater/irrigation data** — Missing a critical agriculture input
8. **No crop-specific intelligence** — Generic vegetation indices, not "rice yield" or "cotton stress"
9. **No alerting system** — Users must check manually
10. **No report generation** — Cannot produce ready-to-present outputs for government or banks

### 3.3 CAN BE EXPANDED (Highest-Impact Opportunities)

#### Tier 1: Transformative (change the category of the platform)

| Opportunity | What It Enables | Effort |
|------------|----------------|--------|
| **Climate Risk API for Banking** | Banks call an API with a location → get climate risk score. Enables climate-adjusted lending across all Indian banks | High — needs yield models, risk quantification, API infrastructure |
| **Predictive Climate Hazard Layer** | 10-15 year localized projections for drought, flood, heat waves. This is the Climate Stack vision | Very High — this is the Innovation Challenge itself |
| **Composite Vulnerability Index** | Single score combining climate, agricultural, socioeconomic factors. Becomes the "credit score for climate resilience" | Medium — combines existing layers with formula |

#### Tier 2: High Impact (serve new stakeholder segments)

| Opportunity | What It Enables | Effort |
|------------|----------------|--------|
| **District Climate Report Card** | Auto-generated monthly/quarterly reports for each district. DMs and DDMs get actionable summaries | Medium — template engine + data pipeline |
| **Drought Severity Dashboard** | Aligned with IMD/State drought manual criteria. Evidence for drought declaration | Medium — needs IMD criteria mapping |
| **Pre/Post Disaster Assessment** | Event-triggered NDVI comparison. Exportable for compensation claims | Medium — needs event detection + comparison engine |
| **WRIS Integration** | Groundwater + surface water layers. Completes the water picture | Medium — API integration with India-WRIS |
| **Mobile-First Redesign** | PWA or native app for field officers. Offline-capable with pre-cached district data | High — full UX redesign |

#### Tier 3: Foundation (enable ecosystem growth)

| Opportunity | What It Enables | Effort |
|------------|----------------|--------|
| **API-First Architecture** | Developers build on DiCRA. Third-party apps, widgets, dashboards | High — architectural redesign |
| **Developer Sandbox** | JupyterHub (like DE Africa) for researchers and hackathon participants | Medium — infrastructure setup |
| **Multilingual Interface** | Hindi, Telugu, Marathi, etc. Opens platform to actual beneficiaries | Medium — i18n framework |
| **Alert/Notification System** | Push alerts when threshold exceeded (e.g., soil moisture drops below critical) | Medium — event engine + notification service |
| **National Coverage Expansion** | Beyond Telangana to all Indian states | High — data pipeline scaling |

---

## 4. Conceptual Architecture: DiCRA v2

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DiCRA v2 / Climate Stack                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Data Ingestion│  │  Processing   │  │  Intelligence │              │
│  │  Engine       │  │  Pipeline     │  │  Layer        │              │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤              │
│  │ NASA APIs    │  │ Standardize  │  │ Vulnerability│              │
│  │ Copernicus   │  │ Validate     │  │ Index Engine │              │
│  │ IMD          │  │ Gap-fill     │  │ Yield Models │              │
│  │ India-WRIS   │  │ Composite    │  │ Hazard       │              │
│  │ AgriStack    │  │ Layers       │  │ Forecasting  │              │
│  │ SoilGrids    │  │ Time-series  │  │ Anomaly      │              │
│  │ PMFBY data   │  │ DPPD         │  │ Detection    │              │
│  │ Market prices│  │ Generation   │  │ Alert Engine │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway (REST + GraphQL)              │   │
│  │  /climate-risk-score  /district-report  /alert-subscribe    │   │
│  │  /data-layers         /time-series      /hazard-forecast    │   │
│  │  /vulnerability-index /compare          /download           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │
│  │ Web Portal│ │ Mobile App│ │ Developer │ │ Report Generator  │  │
│  │ (React)   │ │ (PWA)     │ │ Sandbox   │ │ (PDF/PPT export)  │  │
│  │           │ │           │ │(JupyterHub)│ │                   │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Integration Layer                               │   │
│  │  AgriStack ←→ DiCRA ←→ WRIS ←→ Banking CBS ←→ PMFBY       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Strategic Recommendations

### For NABARD (Host & Policy Owner)

1. **Position DiCRA as the "Agricultural Climate Data Layer" of India Stack** — just as Aadhaar is the identity layer and UPI is the payments layer, DiCRA should be the authoritative climate intelligence layer for agricultural policy and finance.

2. **Build the Climate Risk API first** — this is the single highest-leverage feature. Every bank in India needs climate risk data for TCFD compliance. An API that returns a climate risk score for any location would make DiCRA indispensable to the financial sector.

3. **Integrate with AgriStack** — farmer IDs + land records (AgriStack) + climate intelligence (DiCRA) = farm-level climate risk profiles. This combination enables personalized climate advisories and climate-adjusted credit.

4. **Mandate use in District Credit Plans** — NABARD already oversees district credit planning. Making DiCRA data a required input for climate-sensitive lending targets would drive adoption.

5. **Expand to all states** — Telangana-only coverage limits institutional relevance. A phased national rollout (starting with NABARD's priority states) is essential.

### For the Development Community (Developers, Researchers)

6. **API-first architecture redesign** — the manual download process is a barrier. Invest in a well-documented REST API with SDKs (Python, R, JavaScript).

7. **Developer Sandbox** — following Digital Earth Africa's model, provide a JupyterHub environment where researchers can analyze DiCRA data without downloading it.

8. **ML-ready datasets** — curate labeled, versioned datasets specifically for training crop yield models, drought forecasting models, and climate risk models.

9. **Open Innovation model** — the Climate Stack Innovation Challenge is the right approach. Make this continuous, not one-time.

### For Government Users (District Administration)

10. **District Climate Dashboard** — a simplified, role-specific view showing the 3-5 most relevant indicators for a district collector's decision-making.

11. **Drought Declaration Support Tool** — map DiCRA data to official drought manual criteria (IMD's SPI, soil moisture thresholds, crop condition triggers) so DMs have evidence-backed declarations.

12. **MGNREGA Integration** — climate-informed work selection: "In blocks with declining soil moisture and degraded NDVI, prioritize farm ponds and check dams."

### For Banking & Insurance

13. **Climate-Adjusted KCC (Kisan Credit Card) appraisal** — use DiCRA climate risk scores as an input to KCC loan appraisal process.

14. **PMFBY loss estimation** — satellite-based crop loss estimation using DiCRA layers could speed up and improve accuracy of crop insurance claims.

15. **Portfolio-level ESG reporting** — aggregate DiCRA data across a bank's agricultural loan portfolio to report climate exposure for TCFD/ESG compliance.

---

## 6. Questions for Further Exploration

These questions should be explored with NABARD, UNDP, and domain experts:

### Data & Technical
1. What is the actual API architecture? Are there undocumented endpoints beyond the download form?
2. How frequently is the data pipeline actually running? Are the 26 layers current?
3. What ML models power the DPPD layers? How are they validated?
4. Is there a data quality framework? How are satellite data gaps handled?
5. What infrastructure runs the platform? Cloud provider, scaling strategy?

### Institutional & Policy
6. What is NABARD's budget allocation for DiCRA's continued development?
7. How does DiCRA relate to the Digital Agriculture Mission and AgriStack?
8. Are there MoUs with IMD, CWC, or other data agencies for integration?
9. What happened with the Telangana Rythu Vedika integration — is it active?
10. The Climate Stack Innovation Challenge runs through June 2026 — what happens to winning solutions?

### Stakeholder & Adoption
11. Who are the actual active users? DDMs? Researchers? Which departments?
12. Has any bank used DiCRA data for lending decisions? If not, why not?
13. What feedback have district collectors given on the platform?
14. Are the 100 citizen scientists still active? What data are they contributing?
15. What prevented expansion beyond Telangana so far?

### Business Model
16. Is DiCRA sustainable without donor funding? What's the long-term funding model?
17. Could a freemium API model work — free for government, paid for commercial (insurance/AgTech)?
18. What's the relationship with commercial platforms like Climate Engine or custom solutions banks are building?

---

## Sources

- [Climate Stack Innovation Challenge](https://www.climatestackinnovationchallenge.com/)
- [NABARD + Gates Foundation Partnership](https://www.webnewswire.com/2026/03/06/nabard-in-partnership-with-gates-foundation-and-dalberg-launches-national-climate-stack-innovation-challenge-to-build-climate-intelligence-for-rural-india/)
- [ODI: Managing Climate Risks in India's Financial Sector](https://odi.org/en/about/our-work/strengthening-climate-risk-assessment-and-enabling-central-bank-supervision-in-the-indian-financial-sector-a-partnership-with-frontrunning-banks-and-dfis/)
- [UK PACT: Equipping India's Financial Sector for Climate Risks](https://www.ukpact.co.uk/case-studies/equipping-india-financial-sector-for-climate-risks)
- [KPMG: Steering Climate Risk for Banks](https://kpmg.com/in/en/blogs/2024/07/steering-climate-risk-bringing-banks-on-board.html)
- [Climate Risk Horizons: India's Banks Still Unprepared](https://climateriskhorizons.com/research/Still-Unprepared.pdf)
- [RBI Draft Climate Risk Disclosure Framework 2024](https://csiglobal.co/climate-proofing-indias-banks-the-rise-of-stress-testing-for-a-new-era/)
- [UNDP Digital X: DiCRA Catalog](https://digitalx.undp.org/catalogs/dicra.html)
- [DiCRA GitHub Repository](https://github.com/undpindia/dicra)
- [DiCRA DataLayers.md](https://github.com/undpindia/dicra/blob/main/DataLayers.md)
- [NABARD Press Release on UNDP Partnership](https://www.nabard.org/PressReleases-article.aspx?id=25&cid=554&EID=75)
- [Digital Earth Africa](https://www.digitalearthafrica.org/)
- [NASA SERVIR](https://www.servirglobal.net/)
- [FAO GIEWS](https://www.fao.org/giews/en/)
- [World Bank CCKP](https://climateknowledgeportal.worldbank.org/)
- [India-WRIS](https://indiawris.gov.in/)
- [BHUVAN - ISRO](https://bhuvan.nrsc.gov.in/)

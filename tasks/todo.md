# Task Plan

## Current: Next Version Build (Climate-Financial Intelligence Dashboard)

### Completed
- [x] A1: ERA5 auth — reads CDS creds from .env
- [x] A2: GEE project — passes project ID from .env
- [x] A3: Writer upsert — prevents duplicate rows
- [x] A4: Pipeline fallbacks — ERA5/GEE graceful degradation
- [x] A5: Test real data — ERA5 (784 rows) + NDVI (486 rows) confirmed
- [x] C1: District search (Cmd+K command palette)
- [x] C2: Time/period selector
- [x] C3: CSV export
- [x] C4: Loading skeletons (dashboard, district, state)
- [x] C5: Dark mode (DiCRA-branded)
- [x] C6: Mobile responsive (bottom nav)
- [x] D1: Risk-to-Action insight cards (18 rules)
- [x] D2: Vulnerability composite score (7th indicator)
- [x] D3: Actionable insights engine (8 compound rules)
- [x] D4: Banker's Ledger "Coming Soon" page
- [x] B2: Indicator metadata updated (MODIS, ERA5-Land, vulnerability)
- [x] Build verification: 19 routes, 0 errors

### In Progress
- [ ] B1: Backfill Jan-Jun 2024 (running in background)

### Known Issues
- Rainfall anomaly: only writing 1 row per pipeline run (baseline matching issue)
- Vulnerability score: low count because it depends on NDVI + rainfall overlap

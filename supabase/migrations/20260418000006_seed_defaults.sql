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

INSERT INTO data_sources (source_name, description, fetch_frequency) VALUES
('imd_rainfall', 'IMD gridded daily rainfall (0.25 degree)', 'daily'),
('imd_temperature', 'IMD gridded daily temperature (1 degree)', 'daily'),
('era5_land', 'ERA5-Land reanalysis - soil moisture and temperature', 'monthly'),
('modis_ndvi', 'MODIS MOD13A3 monthly NDVI via Google Earth Engine', '16-day'),
('srtm_elevation', 'SRTM 90m DEM for flood risk computation', 'one-time');

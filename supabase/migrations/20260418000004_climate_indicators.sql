CREATE TYPE indicator_type AS ENUM (
    'rainfall_anomaly',
    'drought_index',
    'vegetation_health',
    'heat_stress',
    'flood_risk',
    'soil_moisture'
);

-- Partitioned table by year for query performance on time-series data
-- Note: district_id integrity enforced at application level (pipeline),
-- not via FK, because period_start is the partition key.
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

CREATE TABLE climate_indicators_2020 PARTITION OF climate_indicators FOR VALUES FROM ('2020-01-01') TO ('2021-01-01');
CREATE TABLE climate_indicators_2021 PARTITION OF climate_indicators FOR VALUES FROM ('2021-01-01') TO ('2022-01-01');
CREATE TABLE climate_indicators_2022 PARTITION OF climate_indicators FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');
CREATE TABLE climate_indicators_2023 PARTITION OF climate_indicators FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE climate_indicators_2024 PARTITION OF climate_indicators FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE climate_indicators_2025 PARTITION OF climate_indicators FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE climate_indicators_2026 PARTITION OF climate_indicators FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE climate_indicators_2027 PARTITION OF climate_indicators FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
CREATE TABLE climate_indicators_2028 PARTITION OF climate_indicators FOR VALUES FROM ('2028-01-01') TO ('2029-01-01');
CREATE TABLE climate_indicators_2029 PARTITION OF climate_indicators FOR VALUES FROM ('2029-01-01') TO ('2030-01-01');
CREATE TABLE climate_indicators_2030 PARTITION OF climate_indicators FOR VALUES FROM ('2030-01-01') TO ('2031-01-01');

CREATE INDEX idx_climate_district_type_period ON climate_indicators (district_id, indicator_type, period_start);

COMMENT ON TABLE climate_indicators IS 'Per-district climate risk indicator scores, partitioned by year. Millions of rows over time.';

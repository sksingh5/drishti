CREATE TABLE risk_score_defaults (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    weights JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE risk_score_defaults IS 'Named weight profiles for composite risk score calculation';

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

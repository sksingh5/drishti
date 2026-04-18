CREATE TABLE states (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lgd_code INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    area_sq_km DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_states_geometry ON states USING GIST (geometry);
CREATE INDEX idx_states_name ON states (name);

COMMENT ON TABLE states IS 'Indian states and union territories with boundaries from LGD';

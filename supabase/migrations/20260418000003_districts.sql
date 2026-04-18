CREATE TABLE districts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lgd_code INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    state_id BIGINT NOT NULL REFERENCES states(id),
    area_sq_km DOUBLE PRECISION,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_districts_geometry ON districts USING GIST (geometry);
CREATE INDEX idx_districts_state_id ON districts (state_id);
CREATE INDEX idx_districts_name ON districts (name);

COMMENT ON TABLE districts IS 'Indian districts (~770) with boundaries from LGD, linked to states';

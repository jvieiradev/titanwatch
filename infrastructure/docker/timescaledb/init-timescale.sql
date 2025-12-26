-- ===================================================================
-- TimescaleDB Initialization Script
-- ===================================================================
--
-- This script sets up TimescaleDB for high-performance time-series
-- tracking data (Tracking Service - CQRS pattern).
--
-- Features:
-- - Hypertables for automatic partitioning
-- - Continuous aggregates for pre-computed queries
-- - Retention policies for automatic data cleanup
-- - Optimized indexes for time-series queries
--
-- ===================================================================

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ===================================================================
-- WRITE MODEL (Optimized for high-throughput inserts)
-- ===================================================================

-- Main positions table (will become a hypertable)
CREATE TABLE IF NOT EXISTS positions (
    time        TIMESTAMPTZ NOT NULL,
    entity_id   UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'jaeger' or 'kaiju'
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    altitude    DOUBLE PRECISION,
    speed       DOUBLE PRECISION,
    heading     DOUBLE PRECISION,
    accuracy    DOUBLE PRECISION,
    source      VARCHAR(50) NOT NULL,
    metadata    JSONB
);

-- Convert to hypertable (partitioned by time)
SELECT create_hypertable('positions', 'time', if_not_exists => TRUE);

-- Optimized indexes for write model
CREATE INDEX IF NOT EXISTS idx_positions_entity_time ON positions (entity_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_positions_type_time ON positions (entity_type, time DESC);
CREATE INDEX IF NOT EXISTS idx_positions_time ON positions (time DESC);

-- ===================================================================
-- READ MODEL (Optimized for complex queries)
-- ===================================================================

-- Continuous aggregate: Hourly position summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS positions_hourly
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    entity_id,
    entity_type,
    COUNT(*) as position_count,
    AVG(latitude) as avg_latitude,
    AVG(longitude) as avg_longitude,
    AVG(speed) as avg_speed,
    MAX(speed) as max_speed,
    MIN(speed) as min_speed,
    FIRST(latitude, time) as first_latitude,
    FIRST(longitude, time) as first_longitude,
    LAST(latitude, time) as last_latitude,
    LAST(longitude, time) as last_longitude
FROM positions
GROUP BY bucket, entity_id, entity_type
WITH NO DATA;

-- Refresh policy: Update hourly aggregates every 30 minutes
SELECT add_continuous_aggregate_policy('positions_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '30 minutes',
    if_not_exists => TRUE
);

-- Continuous aggregate: Daily summaries
CREATE MATERIALIZED VIEW IF NOT EXISTS positions_daily
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', time) AS bucket,
    entity_id,
    entity_type,
    COUNT(*) as position_count,
    AVG(speed) as avg_speed,
    MAX(speed) as max_speed,
    SUM(
        CASE
            WHEN LAG(latitude) OVER (PARTITION BY entity_id ORDER BY time) IS NOT NULL
            THEN 111.32 * SQRT(
                POW(latitude - LAG(latitude) OVER (PARTITION BY entity_id ORDER BY time), 2) +
                POW((longitude - LAG(longitude) OVER (PARTITION BY entity_id ORDER BY time)) * COS(RADIANS(latitude)), 2)
            )
            ELSE 0
        END
    ) as total_distance_km
FROM positions
GROUP BY bucket, entity_id, entity_type
WITH NO DATA;

-- Refresh policy: Update daily aggregates once per day
SELECT add_continuous_aggregate_policy('positions_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 day',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- ===================================================================
-- RETENTION POLICIES
-- ===================================================================

-- Keep raw data for 90 days
SELECT add_retention_policy('positions', INTERVAL '90 days', if_not_exists => TRUE);

-- ===================================================================
-- TRAILS TABLE (Denormalized for fast trail queries)
-- ===================================================================

CREATE TABLE IF NOT EXISTS trails (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id   UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    start_time  TIMESTAMPTZ NOT NULL,
    end_time    TIMESTAMPTZ NOT NULL,
    points      JSONB NOT NULL, -- Array of {lat, lon, time, speed}
    total_distance DOUBLE PRECISION,
    avg_speed   DOUBLE PRECISION,
    max_speed   DOUBLE PRECISION,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trails_entity ON trails (entity_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_trails_time_range ON trails (start_time, end_time);

-- ===================================================================
-- HEATMAP TABLE (Pre-computed grid data)
-- ===================================================================

CREATE TABLE IF NOT EXISTS heatmap_grid (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    grid_x      INTEGER NOT NULL,
    grid_y      INTEGER NOT NULL,
    lat_min     DOUBLE PRECISION NOT NULL,
    lat_max     DOUBLE PRECISION NOT NULL,
    lon_min     DOUBLE PRECISION NOT NULL,
    lon_max     DOUBLE PRECISION NOT NULL,
    visit_count INTEGER DEFAULT 0,
    avg_speed   DOUBLE PRECISION,
    time_window TSTZRANGE NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heatmap_grid_coords ON heatmap_grid (grid_x, grid_y);
CREATE INDEX IF NOT EXISTS idx_heatmap_entity_type ON heatmap_grid (entity_type);
CREATE INDEX IF NOT EXISTS idx_heatmap_time_window ON heatmap_grid USING GIST (time_window);

-- ===================================================================
-- HELPER FUNCTIONS
-- ===================================================================

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN 111.32 * SQRT(
        POW(lat2 - lat1, 2) +
        POW((lon2 - lon1) * COS(RADIANS((lat1 + lat2) / 2)), 2)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===================================================================
-- COMPRESSION POLICIES (for older data)
-- ===================================================================

-- Enable compression for positions older than 7 days
SELECT add_compression_policy('positions', INTERVAL '7 days', if_not_exists => TRUE);

-- ===================================================================
-- STATISTICS
-- ===================================================================

-- Table for tracking statistics
CREATE TABLE IF NOT EXISTS tracking_statistics (
    id              SERIAL PRIMARY KEY,
    entity_id       UUID NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    total_positions BIGINT DEFAULT 0,
    first_seen      TIMESTAMPTZ,
    last_seen       TIMESTAMPTZ,
    total_distance  DOUBLE PRECISION DEFAULT 0,
    avg_speed       DOUBLE PRECISION DEFAULT 0,
    max_speed       DOUBLE PRECISION DEFAULT 0,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tracking_stats_entity ON tracking_statistics (entity_id);

-- ===================================================================
-- COMPLETION MESSAGE
-- ===================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ TimescaleDB initialization completed successfully!';
    RAISE NOTICE '📊 Hypertables: positions';
    RAISE NOTICE '⏱️  Continuous Aggregates: positions_hourly, positions_daily';
    RAISE NOTICE '🗄️  Retention Policy: 90 days for raw data';
    RAISE NOTICE '🗜️  Compression Policy: 7 days';
END $$;

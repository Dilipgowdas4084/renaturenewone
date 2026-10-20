-- Renature: admin point awards / corrections that aren't tied to an event (idempotent).
-- The server also creates this table on first use (server/utils/participation.js).
CREATE TABLE IF NOT EXISTS point_adjustments (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255),
  student_id  VARCHAR(100),
  full_name   VARCHAR(255),
  department  VARCHAR(100),
  points      DECIMAL(10,2) NOT NULL,
  reason      TEXT,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT NOW()
);

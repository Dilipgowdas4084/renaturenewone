-- ─────────────────────────────────────────────────────────
-- Renature complete database schema (idempotent)
-- Run: psql -U <user> -d renature -f 001_schema.sql
-- ─────────────────────────────────────────────────────────

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  usn           VARCHAR(100) UNIQUE,
  phone         VARCHAR(20),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) DEFAULT 'member',
  department    VARCHAR(100),
  year          VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Add extra columns if upgrading from old schema
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year       VARCHAR(20);

-- 2. Events
CREATE TABLE IF NOT EXISTS events (
  id                    SERIAL PRIMARY KEY,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  image_url             TEXT,
  category              VARCHAR(100),
  event_date            DATE,
  start_time            TIME,
  end_time              TIME,
  venue                 VARCHAR(255),
  registration_deadline TIMESTAMP,
  max_participants      INT,
  status                VARCHAR(50) DEFAULT 'draft',
  points_available      INT DEFAULT 0,
  eligibility           TEXT,
  rules                 TEXT,
  organizer_info        TEXT,
  created_by            INT REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- 3. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id            SERIAL PRIMARY KEY,
  event_id      INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reference_id  VARCHAR(50) UNIQUE NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  student_id    VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(20),
  department    VARCHAR(100),
  year          VARCHAR(20),
  status        VARCHAR(20) DEFAULT 'pending',
  registered_at TIMESTAMP DEFAULT NOW(),
  accepted_at   TIMESTAMP,
  rejected_at   TIMESTAMP,
  accepted_by   INT REFERENCES users(id),
  UNIQUE(event_id, email)
);

-- 4. Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id              SERIAL PRIMARY KEY,
  event_id        INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id INT NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  status          VARCHAR(20) DEFAULT 'absent',
  marked_by       INT REFERENCES users(id),
  marked_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, registration_id)
);

-- 5. Event Results / Marks
CREATE TABLE IF NOT EXISTS event_results (
  id              SERIAL PRIMARY KEY,
  event_id        INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registration_id INT NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  marks           DECIMAL(10,2),
  points          DECIMAL(10,2) DEFAULT 0,
  rank            INT,
  remarks         TEXT,
  created_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, registration_id)
);

-- 6. Nature Resources
CREATE TABLE IF NOT EXISTS resources (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  category     VARCHAR(100),
  image_url    TEXT,
  external_url TEXT,
  tags         TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Done
SELECT 'Renature schema ready ✓' AS status;

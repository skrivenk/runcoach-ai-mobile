CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  race_date DATE,
  duration_weeks INT NOT NULL,
  max_days_per_week INT DEFAULT 5,
  long_run_day TEXT DEFAULT 'Sunday',
  weekly_increase_cap REAL DEFAULT 0.10,
  long_run_cap REAL DEFAULT 0.30,
  guardrails_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  plan_id INT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  version INT DEFAULT 1,
  is_current_version BOOLEAN DEFAULT TRUE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('easy','tempo','intervals','long','recovery','rest','crosstrain')),
  planned_distance REAL,
  planned_intensity TEXT,
  description TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  actual_distance REAL,
  actual_time_seconds INT,
  actual_rpe INT,
  avg_hr INT,
  elevation_gain REAL,
  splits TEXT,
  shoes TEXT,
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_workouts_current ON workouts(plan_id, date, is_current_version);

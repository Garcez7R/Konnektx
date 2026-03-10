PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS salons (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  tagline TEXT,
  logo_url TEXT,
  cover_url TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS salon_memberships (
  salon_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (salon_id, user_id),
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  staff_id TEXT,
  service_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loyalty_rules (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  points_per_service INTEGER NOT NULL,
  target_points INTEGER NOT NULL,
  reward_description TEXT NOT NULL,
  config_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  last_awarded_at TEXT,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salons_slug ON salons(slug);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon ON staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_appt_salon_time ON appointments(salon_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON salon_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer ON loyalty_points(customer_id);

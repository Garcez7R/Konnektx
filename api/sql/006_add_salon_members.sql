CREATE TABLE IF NOT EXISTS salon_members (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  UNIQUE(salon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_salon_members_user ON salon_members(user_id);
CREATE INDEX IF NOT EXISTS idx_salon_members_salon ON salon_members(salon_id);

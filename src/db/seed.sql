-- Insert default admin user for local testing
-- Password: "password" (hashed with PBKDF2-SHA256, 100k iterations, salt=SESSION_SECRET)
INSERT INTO users (name, email, password, role, is_active, must_change_password, created_at)
VALUES (
  'Admin User',
  'admin@nook.local',
  '1e79a58b20049c0cc9a6c19a9755d35e00ca9a082fce47c68d4253a674ba2ea4',
  'admin',
  1,
  1,
  unixepoch()
);

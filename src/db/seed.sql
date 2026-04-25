-- Insert default admin user for local testing
-- Password: "password" (hashed with PBKDF2-SHA256, 100k iterations, salt=SESSION_SECRET)
INSERT INTO users (name, email, password, role, is_active, must_change_password, created_at)
VALUES (
  'Admin User',
  'admin@nook.local',
  '387c7005dd1e0f456e6a8775f6f4f83e40727ba9205d77e4f0b335a932a81e59',
  'admin',
  1,
  1,
  unixepoch()
);

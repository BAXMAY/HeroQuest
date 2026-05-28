-- Demo data on top of seed.sql — gives a populated UI for screenshots
-- without a real Anthropic key. Apply with:
--   wrangler d1 execute heroquest --local --file=seed/demo.sql
--
-- Idempotent (INSERT OR IGNORE) so re-running won't duplicate.
--
-- Does NOT create users — Better Auth's password hashing requires the
-- signup flow. After first register at /register, run:
--   wrangler d1 execute heroquest --local \
--     --command="UPDATE user_profile SET role='admin' WHERE user_id IN (SELECT id FROM user LIMIT 1);"

-- ===== Demo family =====
INSERT OR IGNORE INTO family (id, name, invite_code, created_by, created_at)
VALUES
  ('fam-demo', 'The Demo Family', 'DEMO2025',
   COALESCE((SELECT id FROM user LIMIT 1), 'no-user'),
   unixepoch() * 1000);

-- ===== A recurring chore template (only inserts if a user exists) =====
INSERT OR IGNORE INTO recurring_chore (id, family_id, title, description, frequency, default_xp, default_coins, active, created_by, created_at)
SELECT
  'chore-demo-feed', 'fam-demo', 'Feed the dog', 'Fill the bowl and refill water', 'daily',
  20, 2, 1, id, unixepoch() * 1000
FROM user LIMIT 1;

INSERT OR IGNORE INTO recurring_chore (id, family_id, title, description, frequency, default_xp, default_coins, active, created_by, created_at)
SELECT
  'chore-demo-room', 'fam-demo', 'Tidy your room', 'Bed made, floor clear', 'weekly',
  40, 4, 1, id, unixepoch() * 1000
FROM user LIMIT 1;

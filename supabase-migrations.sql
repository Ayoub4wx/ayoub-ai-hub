-- ============================================================
-- Ayoub AI Hub — Feature Migrations
-- Run this in the Supabase SQL Editor AFTER the main schema
-- ============================================================

-- ─── PROFILES: Add points, streak, gamification columns ──────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_shield BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_game_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_games_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_trivia_score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_frame TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_name_color TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_badge TEXT;

-- ─── POINT TRANSACTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS point_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_point_tx_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_tx_created ON point_transactions(created_at DESC);
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own transactions" ON point_transactions;
DROP POLICY IF EXISTS "Service insert transactions" ON point_transactions;
CREATE POLICY "Users view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service insert transactions" ON point_transactions FOR INSERT WITH CHECK (true);

-- ─── BADGES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO badges (id, name, description, icon, tier) VALUES
  ('first_post',    'First Words',        'Published your first community post',          '✍️',  'bronze'),
  ('post_10',       'Storyteller',        'Published 10 community posts',                 '📚',  'silver'),
  ('post_50',       'Content Creator',    'Published 50 community posts',                 '🎙️', 'gold'),
  ('liked_10',      'Community Favorite', 'Your posts received 10 total likes',           '❤️',  'bronze'),
  ('liked_100',     'Influencer',         'Your posts received 100 total likes',          '🌟',  'gold'),
  ('streak_3',      'On a Roll',          'Completed trivia 3 days in a row',             '🔥',  'bronze'),
  ('streak_7',      'Week Warrior',       'Completed trivia 7 days in a row',             '⚡',  'silver'),
  ('streak_30',     'AI Devotee',         'Completed trivia 30 days in a row',            '💎',  'diamond'),
  ('trivia_expert', 'Trivia Expert',      'Scored 150/150 on a trivia game',              '🏆',  'gold'),
  ('multiplayer_1', 'First Blood',        'Won your first multiplayer trivia match',       '⚔️',  'bronze'),
  ('multiplayer_10','Champion',           'Won 10 multiplayer trivia matches',             '👑',  'gold'),
  ('api_user',      'Developer',          'Generated your first API key',                 '🔑',  'silver'),
  ('supporter',     'Supporter',          'Supported Ayoub AI Hub via Ko-fi',             '☕',  'gold'),
  ('early_adopter', 'Early Adopter',      'Joined in the first month of launch',          '🚀',  'diamond'),
  ('comment_50',    'Conversationalist',  'Left 50 comments on community posts',          '💬',  'silver'),
  ('points_1000',   'Points Hoarder',     'Accumulated 1,000 total points',               '💰',  'silver'),
  ('points_10000',  'High Roller',        'Accumulated 10,000 total points',              '💎',  'diamond')
ON CONFLICT (id) DO NOTHING;

-- ─── USER BADGES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id   TEXT NOT NULL REFERENCES badges(id),
  earned_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read user_badges" ON user_badges;
DROP POLICY IF EXISTS "Service insert user_badges" ON user_badges;
CREATE POLICY "Public read user_badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Service insert user_badges" ON user_badges FOR INSERT WITH CHECK (true);

-- ─── SHOP ITEMS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_items (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('profile_frame', 'name_color', 'badge', 'chat_theme')),
  cost_points INTEGER NOT NULL,
  css_value   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shop_items (id, name, description, icon, category, cost_points, css_value) VALUES
  ('frame_violet',  'Violet Frame',    'Violet gradient profile frame',        '💜', 'profile_frame', 200,  'ring-2 ring-violet-500'),
  ('frame_cyan',    'Cyan Frame',      'Cyan glow profile frame',              '💠', 'profile_frame', 250,  'ring-2 ring-cyan-500'),
  ('frame_gold',    'Gold Frame',      'Gold profile frame for top players',   '🥇', 'profile_frame', 500,  'ring-2 ring-yellow-400'),
  ('frame_rainbow', 'Rainbow Frame',   'Animated rainbow profile frame',       '🌈', 'profile_frame', 1000, 'ring-2 ring-violet-500 animate-pulse'),
  ('name_cyan',     'Cyan Name',       'Your display name glows cyan',         '💠', 'name_color',    300,  'text-cyan-400 font-bold'),
  ('name_gold',     'Gold Name',       'Your display name shines gold',        '✨', 'name_color',    500,  'text-yellow-400 font-bold'),
  ('name_violet',   'Violet Name',     'Bold violet display name',             '💜', 'name_color',    200,  'text-violet-400 font-bold'),
  ('name_red',      'Red Name',        'Bold red display name',                '🔴', 'name_color',    200,  'text-red-400 font-bold'),
  ('badge_robot',   'Robot Badge',     'Robot emoji badge next to your name',  '🤖', 'badge',         150,  '🤖'),
  ('badge_fire',    'Fire Badge',      'Fire emoji badge next to your name',   '🔥', 'badge',         150,  '🔥'),
  ('badge_star',    'Star Badge',      'Star emoji badge next to your name',   '⭐', 'badge',         200,  '⭐'),
  ('badge_diamond', 'Diamond Badge',   'Diamond emoji for elite users',        '💎', 'badge',         400,  '💎'),
  ('badge_crown',   'Crown Badge',     'Crown emoji for champions',            '👑', 'badge',         600,  '👑')
ON CONFLICT (id) DO NOTHING;

-- ─── USER SHOP ITEMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_shop_items (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id      TEXT NOT NULL REFERENCES shop_items(id),
  is_equipped  BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_user_shop_user ON user_shop_items(user_id);
ALTER TABLE user_shop_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own shop items" ON user_shop_items;
DROP POLICY IF EXISTS "Users manage own shop items" ON user_shop_items;
CREATE POLICY "Users view own shop items" ON user_shop_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own shop items" ON user_shop_items FOR ALL USING (auth.uid() = user_id);

-- ─── API KEYS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key_prefix     TEXT NOT NULL,
  key_hash       TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL DEFAULT 'My API Key',
  plan           TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  daily_limit    INTEGER NOT NULL DEFAULT 50,
  requests_today INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  last_reset_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users create own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users update own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Users delete own api_keys" ON api_keys;
DROP POLICY IF EXISTS "Service update api_keys" ON api_keys;
CREATE POLICY "Users view own api_keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own api_keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own api_keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own api_keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service update api_keys" ON api_keys FOR UPDATE USING (true);

-- ─── GAME ROOMS (Multiplayer) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS game_rooms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code     TEXT NOT NULL UNIQUE,
  host_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'countdown', 'playing', 'finished')),
  category      TEXT DEFAULT 'all',
  questions     JSONB NOT NULL DEFAULT '[]',
  host_score    INTEGER DEFAULT 0,
  guest_score   INTEGER DEFAULT 0,
  host_answers  JSONB DEFAULT '[]',
  guest_answers JSONB DEFAULT '[]',
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rooms_code ON game_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_created ON game_rooms(created_at DESC);
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Auth create game_rooms" ON game_rooms;
DROP POLICY IF EXISTS "Players update game_rooms" ON game_rooms;
CREATE POLICY "Public read game_rooms" ON game_rooms FOR SELECT USING (true);
CREATE POLICY "Auth create game_rooms" ON game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Players update game_rooms" ON game_rooms FOR UPDATE USING (
  auth.uid() = host_id OR auth.uid() = guest_id
);

-- Enable real-time for game rooms
-- REPLICA IDENTITY FULL is required for UPDATE events to work with non-PK filters
ALTER TABLE game_rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;

-- ─── LEADERBOARD SNAPSHOTS ───────────────────────────────────
-- Weekly top-10 leaderboard archives (used by leaderboard-snapshot cron)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start  DATE NOT NULL,
  rank        INTEGER NOT NULL,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,
  username    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, rank)
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON leaderboard_snapshots(week_start DESC);
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read leaderboard_snapshots" ON leaderboard_snapshots;
DROP POLICY IF EXISTS "Service insert leaderboard_snapshots" ON leaderboard_snapshots;
CREATE POLICY "Public read leaderboard_snapshots" ON leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "Service insert leaderboard_snapshots" ON leaderboard_snapshots FOR INSERT WITH CHECK (true);

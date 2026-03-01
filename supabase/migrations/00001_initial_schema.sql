-- Create custom types
CREATE TYPE match_status AS ENUM ('waiting', 'playing', 'finished');

-- Riddle themes table
CREATE TABLE riddle_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  is_ai BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  theme_id UUID NOT NULL REFERENCES riddle_themes(id),
  status match_status NOT NULL DEFAULT 'waiting',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  is_creator BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_id, display_name)
);

-- Riddles table (template riddles per theme)
CREATE TABLE riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES riddle_themes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  hint TEXT,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  depends_on_id UUID REFERENCES riddles(id),
  flavor_text TEXT,
  is_final BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Match riddles (instantiated riddles for a specific match)
CREATE TABLE match_riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  riddle_id UUID NOT NULL REFERENCES riddles(id),
  is_visible BOOLEAN NOT NULL DEFAULT false,
  is_solved BOOLEAN NOT NULL DEFAULT false,
  solved_by UUID REFERENCES players(id),
  solved_at TIMESTAMPTZ,
  UNIQUE(match_id, riddle_id)
);

-- Player notes (per-riddle per-player collaborative notes)
CREATE TABLE player_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_riddle_id UUID NOT NULL REFERENCES match_riddles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(match_riddle_id, player_id)
);

-- Indexes
CREATE INDEX idx_matches_code ON matches(code);
CREATE INDEX idx_players_match_id ON players(match_id);
CREATE INDEX idx_riddles_theme_id ON riddles(theme_id);
CREATE INDEX idx_match_riddles_match_id ON match_riddles(match_id);
CREATE INDEX idx_player_notes_match_riddle_id ON player_notes(match_riddle_id);

-- Enable Row Level Security
ALTER TABLE riddle_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Themes: readable by all
CREATE POLICY "Themes are viewable by everyone"
  ON riddle_themes FOR SELECT USING (true);

-- Riddles: readable by all (answers are only exposed through API logic)
CREATE POLICY "Riddles are viewable by everyone"
  ON riddles FOR SELECT USING (true);

-- Matches: readable by all, insertable by authenticated users
CREATE POLICY "Matches are viewable by everyone"
  ON matches FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Match creator can update their match"
  ON matches FOR UPDATE USING (auth.uid() = creator_id);

-- Players: readable by all, insertable by all (anonymous join)
CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT USING (true);

CREATE POLICY "Anyone can join as a player"
  ON players FOR INSERT WITH CHECK (true);

-- Match riddles: readable by all, managed via service role
CREATE POLICY "Match riddles are viewable by everyone"
  ON match_riddles FOR SELECT USING (true);

CREATE POLICY "Match riddles can be updated by anyone"
  ON match_riddles FOR UPDATE USING (true);

CREATE POLICY "Match riddles can be inserted by anyone"
  ON match_riddles FOR INSERT WITH CHECK (true);

-- Player notes: readable and writable by all (collaborative)
CREATE POLICY "Player notes are viewable by everyone"
  ON player_notes FOR SELECT USING (true);

CREATE POLICY "Anyone can create player notes"
  ON player_notes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update player notes"
  ON player_notes FOR UPDATE USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_riddles;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE player_notes;

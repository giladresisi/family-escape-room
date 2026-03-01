export interface RiddleTheme {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  is_ai: boolean;
  created_at: string;
}

export interface Riddle {
  id: string;
  theme_id: string;
  title: string;
  body: string;
  hint: string | null;
  answer: string;
  sort_order: number;
  depends_on_id: string | null;
  flavor_text: string | null;
  is_final: boolean;
  created_at: string;
}

export interface MatchRiddle {
  id: string;
  match_id: string;
  riddle_id: string;
  is_visible: boolean;
  is_solved: boolean;
  solved_by: string | null;
  solved_at: string | null;
  riddle?: Riddle;
}

export interface PlayerNote {
  id: string;
  match_riddle_id: string;
  player_id: string;
  content: string;
  updated_at: string;
}

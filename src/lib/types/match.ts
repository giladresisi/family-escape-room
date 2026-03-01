export type MatchStatus = "waiting" | "playing" | "finished";

export interface Match {
  id: string;
  code: string;
  creator_id: string;
  theme_id: string;
  status: MatchStatus;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  match_id: string;
  user_id: string | null;
  display_name: string;
  is_creator: boolean;
  joined_at: string;
}

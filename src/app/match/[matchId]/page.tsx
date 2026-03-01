"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Match, Player } from "@/lib/types/match";
import { MatchRiddle, PlayerNote } from "@/lib/types/riddle";
import { useRealtimeMatch } from "@/hooks/use-realtime-match";
import { useRealtimePlayers } from "@/hooks/use-realtime-players";
import { useRealtimeRiddles } from "@/hooks/use-realtime-riddles";
import { useRealtimeNotes } from "@/hooks/use-realtime-notes";
import Timer from "@/components/match/timer";
import PlayerList from "@/components/match/player-list";
import Lobby from "@/components/match/lobby";
import GameBoard from "@/components/match/game-board";
import GameFinished from "@/components/match/game-finished";

export default function MatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const [initialMatch, setInitialMatch] = useState<Match | null>(null);
  const [initialPlayers, setInitialPlayers] = useState<Player[]>([]);
  const [initialRiddles, setInitialRiddles] = useState<MatchRiddle[]>([]);
  const [initialNotes, setInitialNotes] = useState<PlayerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      // Get stored player ID
      const storedPlayerId = localStorage.getItem(`player_${matchId}`);
      setPlayerId(storedPlayerId);

      // Fetch match
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (matchError || !match) {
        setError("Match not found");
        setLoading(false);
        return;
      }

      setInitialMatch(match);

      // Fetch players
      const { data: players } = await supabase
        .from("players")
        .select("*")
        .eq("match_id", matchId)
        .order("joined_at", { ascending: true });

      setInitialPlayers(players || []);

      // Fetch match riddles with riddle details
      const { data: matchRiddles } = await supabase
        .from("match_riddles")
        .select("*, riddle:riddles(*)")
        .eq("match_id", matchId)
        .order("riddle(sort_order)", { ascending: true });

      setInitialRiddles(matchRiddles || []);

      // Fetch notes
      if (matchRiddles && matchRiddles.length > 0) {
        const matchRiddleIds = matchRiddles.map((mr) => mr.id);
        const { data: notes } = await supabase
          .from("player_notes")
          .select("*")
          .in("match_riddle_id", matchRiddleIds);

        setInitialNotes(notes || []);
      }

      setLoading(false);
    };

    loadData();
  }, [matchId]);

  // Realtime subscriptions
  const match = useRealtimeMatch(matchId, initialMatch);
  const players = useRealtimePlayers(matchId, initialPlayers);
  const riddles = useRealtimeRiddles(matchId, initialRiddles);
  const matchRiddleIds = riddles.filter((r) => r.is_visible).map((r) => r.id);
  const [notes] = useRealtimeNotes(matchRiddleIds, initialNotes);

  const isCreator = players.some(
    (p) => p.id === playerId && p.is_creator
  );

  const handleStartGame = async () => {
    setStarting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to start game");
      }
    } catch {
      setError("Failed to start game");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-foreground/60">Loading match...</div>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-xl text-error">{error}</div>
        <a
          href="/"
          className="mt-4 text-accent-light hover:text-accent transition-colors"
        >
          Back to home
        </a>
      </div>
    );
  }

  if (!match) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-surface-light bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-foreground/40 hover:text-foreground/60">
              Home
            </a>
            <Timer startedAt={match.started_at} finishedAt={match.finished_at} />
          </div>
          <PlayerList players={players} currentPlayerId={playerId} />
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <div className="rounded-lg bg-error/10 p-3 text-center text-sm text-error">
            {error}
          </div>
        </div>
      )}

      {/* Match content based on status */}
      {match.status === "waiting" && (
        <Lobby
          code={match.code}
          players={players}
          currentPlayerId={playerId}
          isCreator={isCreator}
          onStart={handleStartGame}
          starting={starting}
        />
      )}

      {match.status === "playing" && (
        <GameBoard
          matchId={matchId}
          riddles={riddles}
          players={players}
          notes={notes}
          currentPlayerId={playerId}
        />
      )}

      {match.status === "finished" && match.started_at && match.finished_at && (
        <GameFinished
          startedAt={match.started_at}
          finishedAt={match.finished_at}
          players={players}
        />
      )}
    </div>
  );
}

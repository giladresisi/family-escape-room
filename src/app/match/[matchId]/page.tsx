"use client";

import { useEffect, useState, use } from "react";
import { clientDb } from "@/lib/firebase/client";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
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

  useEffect(() => {
    const loadData = async () => {
      const storedPlayerId = localStorage.getItem(`player_${matchId}`);
      setPlayerId(storedPlayerId);

      const matchSnap = await getDoc(doc(clientDb(), "matches", matchId));
      if (!matchSnap.exists()) {
        setError("Match not found");
        setLoading(false);
        return;
      }
      setInitialMatch({ id: matchSnap.id, ...matchSnap.data() } as Match);

      const playersSnap = await getDocs(
        query(
          collection(clientDb(), "players"),
          where("match_id", "==", matchId),
          orderBy("joined_at")
        )
      );
      setInitialPlayers(
        playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Player)
      );

      const riddlesSnap = await getDocs(
        query(
          collection(clientDb(), "match_riddles"),
          where("match_id", "==", matchId),
          orderBy("sort_order")
        )
      );
      const matchRiddles = riddlesSnap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as MatchRiddle
      );
      setInitialRiddles(matchRiddles);

      if (matchRiddles.length > 0) {
        const matchRiddleIds = matchRiddles.map((mr) => mr.id);
        const notesSnap = await getDocs(
          query(
            collection(clientDb(), "player_notes"),
            where("match_riddle_id", "in", matchRiddleIds)
          )
        );
        setInitialNotes(
          notesSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as PlayerNote)
        );
      }

      setLoading(false);
    };

    loadData();
  }, [matchId]);

  const match = useRealtimeMatch(matchId, initialMatch);
  const players = useRealtimePlayers(matchId, initialPlayers);
  const riddles = useRealtimeRiddles(matchId, initialRiddles);
  const matchRiddleIds = riddles.filter((r) => r.is_visible).map((r) => r.id);
  const [notes] = useRealtimeNotes(matchRiddleIds, initialNotes);

  const isCreator = players.some((p) => p.id === playerId && p.is_creator);

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

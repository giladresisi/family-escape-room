"use client";

import { MatchRiddle, PlayerNote } from "@/lib/types/riddle";
import { Player } from "@/lib/types/match";
import RiddleCard from "../riddle/riddle-card";

interface GameBoardProps {
  matchId: string;
  riddles: MatchRiddle[];
  players: Player[];
  notes: PlayerNote[];
  currentPlayerId: string | null;
}

export default function GameBoard({
  matchId,
  riddles,
  players,
  notes,
  currentPlayerId,
}: GameBoardProps) {
  const visibleRiddles = riddles.filter((r) => r.is_visible);
  const solvedCount = visibleRiddles.filter((r) => r.is_solved).length;
  const totalCount = riddles.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Riddles</h2>
        <span className="rounded-full bg-surface px-3 py-1 text-sm text-foreground/60">
          {solvedCount} / {totalCount} solved
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-success transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (solvedCount / totalCount) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-4">
        {visibleRiddles
          .sort((a, b) => (a.riddle?.sort_order || 0) - (b.riddle?.sort_order || 0))
          .map((matchRiddle) => {
            const solvedByPlayer = matchRiddle.solved_by
              ? players.find((p) => p.id === matchRiddle.solved_by)
              : null;
            return (
              <RiddleCard
                key={matchRiddle.id}
                matchRiddle={matchRiddle}
                matchId={matchId}
                players={players}
                notes={notes.filter(
                  (n) => n.match_riddle_id === matchRiddle.id
                )}
                currentPlayerId={currentPlayerId}
                solvedByName={solvedByPlayer?.display_name}
              />
            );
          })}
      </div>

      {visibleRiddles.length < riddles.length && (
        <div className="text-center">
          <p className="text-sm text-foreground/40">
            {riddles.length - visibleRiddles.length} more riddle
            {riddles.length - visibleRiddles.length !== 1 ? "s" : ""} will
            unlock as you solve the current ones...
          </p>
        </div>
      )}
    </div>
  );
}

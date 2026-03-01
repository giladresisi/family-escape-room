"use client";

import { Player } from "@/lib/types/match";
import { PlayerNote } from "@/lib/types/riddle";
import PlayerNoteEditor from "./player-note-editor";

interface RiddleNotesProps {
  matchRiddleId: string;
  players: Player[];
  notes: PlayerNote[];
  currentPlayerId: string | null;
}

export default function RiddleNotes({
  matchRiddleId,
  players,
  notes,
  currentPlayerId,
}: RiddleNotesProps) {
  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wide text-foreground/40">
        Team Notes
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {players.map((player) => {
          const note = notes.find(
            (n) =>
              n.match_riddle_id === matchRiddleId &&
              n.player_id === player.id
          );
          return (
            <PlayerNoteEditor
              key={player.id}
              matchRiddleId={matchRiddleId}
              playerId={player.id}
              playerName={player.display_name}
              initialContent={note?.content || ""}
              isCurrentPlayer={player.id === currentPlayerId}
            />
          );
        })}
      </div>
    </div>
  );
}

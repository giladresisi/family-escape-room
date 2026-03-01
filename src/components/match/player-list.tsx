"use client";

import { Player } from "@/lib/types/match";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => (
        <span
          key={player.id}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${
            player.id === currentPlayerId
              ? "bg-accent/20 text-accent-light font-medium"
              : "bg-surface-light text-foreground/70"
          }`}
        >
          {player.is_creator && (
            <span className="text-xs" title="Room Creator">
              ★
            </span>
          )}
          {player.display_name}
          {player.id === currentPlayerId && (
            <span className="text-xs text-foreground/40">(you)</span>
          )}
        </span>
      ))}
    </div>
  );
}

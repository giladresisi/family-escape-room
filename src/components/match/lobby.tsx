"use client";

import { Player } from "@/lib/types/match";
import PlayerList from "./player-list";
import ShareLink from "./share-link";

interface LobbyProps {
  code: string;
  players: Player[];
  currentPlayerId: string | null;
  isCreator: boolean;
  onStart: () => void;
  starting: boolean;
}

export default function Lobby({
  code,
  players,
  currentPlayerId,
  isCreator,
  onStart,
  starting,
}: LobbyProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">Waiting Room</h1>
        <p className="text-foreground/60">
          Share the link below to invite players. Start when everyone is ready!
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-6 space-y-6">
        <ShareLink code={code} />

        <div>
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-foreground/40">
            Players ({players.length})
          </h3>
          <PlayerList players={players} currentPlayerId={currentPlayerId} />
        </div>
      </div>

      {isCreator && (
        <div className="text-center">
          <button
            onClick={onStart}
            disabled={starting || players.length < 1}
            className="rounded-xl bg-success px-10 py-4 text-lg font-bold text-white shadow-lg shadow-success/25 transition-all hover:bg-success/80 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {starting ? "Starting..." : "Start Game"}
          </button>
          {players.length < 2 && (
            <p className="mt-2 text-sm text-foreground/40">
              You can start alone, but it&apos;s more fun with friends!
            </p>
          )}
        </div>
      )}

      {!isCreator && (
        <div className="text-center">
          <p className="text-foreground/60">
            Waiting for the host to start the game...
          </p>
          <div className="mt-2 flex justify-center">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-light [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-light [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-accent-light [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

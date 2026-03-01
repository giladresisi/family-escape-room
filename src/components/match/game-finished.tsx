"use client";

import { useTimer } from "@/hooks/use-timer";
import { Player } from "@/lib/types/match";

interface GameFinishedProps {
  startedAt: string;
  finishedAt: string;
  players: Player[];
}

export default function GameFinished({
  startedAt,
  finishedAt,
  players,
}: GameFinishedProps) {
  const { formatted } = useTimer(startedAt, finishedAt);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-6xl">🎉</div>

      <h1 className="mb-4 text-4xl font-bold text-success sm:text-5xl">
        You Escaped!
      </h1>

      <p className="mb-8 max-w-md text-lg text-foreground/60">
        Congratulations! Your team solved all the riddles and made it out!
      </p>

      <div className="mb-8 rounded-2xl bg-surface p-8">
        <p className="mb-2 text-sm uppercase tracking-wide text-foreground/40">
          Total Time
        </p>
        <p className="font-mono text-5xl font-bold text-accent-light">
          {formatted}
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-6">
        <p className="mb-3 text-sm uppercase tracking-wide text-foreground/40">
          Team Members
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {players.map((player) => (
            <span
              key={player.id}
              className="rounded-full bg-surface-light px-4 py-2 text-sm font-medium text-foreground"
            >
              {player.is_creator && "★ "}
              {player.display_name}
            </span>
          ))}
        </div>
      </div>

      <a
        href="/"
        className="mt-8 rounded-xl bg-accent px-8 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light"
      >
        Play Again
      </a>
    </div>
  );
}

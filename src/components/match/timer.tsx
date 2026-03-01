"use client";

import { useTimer } from "@/hooks/use-timer";

interface TimerProps {
  startedAt: string | null;
  finishedAt: string | null;
}

export default function Timer({ startedAt, finishedAt }: TimerProps) {
  const { formatted, isRunning } = useTimer(startedAt, finishedAt);

  if (!startedAt) return null;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold ${
        isRunning
          ? "bg-accent/20 text-accent-light"
          : "bg-success/20 text-success"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-accent-light animate-pulse" : "bg-success"}`} />
      {formatted}
    </div>
  );
}

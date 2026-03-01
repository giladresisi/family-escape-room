"use client";

import { useState, useEffect, useCallback } from "react";

export function useTimer(startedAt: string | null, finishedAt: string | null) {
  const [elapsed, setElapsed] = useState(0);

  const calculateElapsed = useCallback(() => {
    if (!startedAt) return 0;
    const start = new Date(startedAt).getTime();
    const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 1000));
  }, [startedAt, finishedAt]);

  useEffect(() => {
    setElapsed(calculateElapsed());

    if (!startedAt || finishedAt) return;

    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, finishedAt, calculateElapsed]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const formatted = hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return { elapsed, formatted, isRunning: !!startedAt && !finishedAt };
}

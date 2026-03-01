"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) {
      router.push(`/join/${code}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl">
          <span className="text-accent-light">Family</span> Escape Room
        </h1>
        <p className="mx-auto max-w-md text-lg text-foreground/60">
          Solve riddles together in real-time. Create a room, invite your family,
          and race against the clock!
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          onClick={() => router.push("/create")}
          className="w-full rounded-xl bg-accent px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light hover:shadow-xl hover:shadow-accent/30"
        >
          Create a Room
        </button>

        {!showJoin ? (
          <button
            onClick={() => setShowJoin(true)}
            className="w-full rounded-xl border-2 border-surface-light bg-surface px-6 py-4 text-lg font-semibold text-foreground transition-all hover:border-accent/50 hover:bg-surface-light"
          >
            Join a Room
          </button>
        ) : (
          <div className="rounded-xl border-2 border-surface-light bg-surface p-4">
            <label className="mb-2 block text-sm text-foreground/60">
              Enter room code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="ABCD23"
                className="flex-1 rounded-lg bg-surface-light px-4 py-3 text-center font-mono text-xl tracking-widest text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent"
                maxLength={6}
                autoFocus
              />
              <button
                onClick={handleJoin}
                disabled={joinCode.trim().length !== 6}
                className="rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Go
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-12 text-sm text-foreground/40">
        Creating a room requires a Google account. Joining is free — no sign-in needed!
      </p>
    </div>
  );
}

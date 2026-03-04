"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { clientDb } from "@/lib/firebase/client";
import { collection, query, where, limit, getDocs } from "firebase/firestore";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<{
    id: string;
    status: string;
    themeName: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      const snap = await getDocs(
        query(
          collection(clientDb(), "matches"),
          where("code", "==", code.toUpperCase()),
          limit(1)
        )
      );

      if (snap.empty) {
        setError("Room not found. Check the code and try again.");
        setLoading(false);
        return;
      }

      const matchDoc = snap.docs[0];
      const match = { id: matchDoc.id, ...matchDoc.data() } as {
        id: string;
        status: string;
        theme_name: string;
      };

      if (match.status !== "waiting") {
        setError("This room has already started. You can no longer join.");
        setLoading(false);
        return;
      }

      setMatchInfo({
        id: match.id,
        status: match.status,
        themeName: match.theme_name || "Unknown Theme",
      });
      setLoading(false);
    };

    fetchMatch();
  }, [code]);

  const handleJoin = async () => {
    if (!displayName.trim() || !matchInfo) return;
    setJoining(true);
    setError(null);

    try {
      const res = await fetch(`/api/matches/${matchInfo.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join match");
        setJoining(false);
        return;
      }

      localStorage.setItem(`player_${matchInfo.id}`, data.player.id);
      router.push(`/match/${matchInfo.id}`);
    } catch {
      setError("Failed to join match");
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-foreground/60">Looking up room...</div>
      </div>
    );
  }

  if (error && !matchInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center">
          <div className="mb-4 text-4xl">😕</div>
          <h2 className="mb-2 text-xl font-bold text-error">{error}</h2>
          <a
            href="/"
            className="mt-4 inline-block text-accent-light hover:text-accent transition-colors"
          >
            Back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-accent-light">
            Join Escape Room
          </h1>
          <p className="text-foreground/60">
            Theme:{" "}
            <span className="font-medium text-foreground">
              {matchInfo?.themeName}
            </span>
          </p>
          <p className="mt-1 text-sm text-foreground/40">
            Room Code: <span className="font-mono">{code.toUpperCase()}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-error/10 p-3 text-center text-sm text-error">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground/60">
              Your Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Enter your name"
              className="w-full rounded-lg bg-surface-light px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent"
              maxLength={30}
              autoFocus
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={!displayName.trim() || joining}
            className="w-full rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {joining ? "Joining..." : "Join Room"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Player } from "@/lib/types/match";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimePlayers(matchId: string, initial: Player[]) {
  const [players, setPlayers] = useState<Player[]>(initial);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`players:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "players",
          filter: `match_id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<Player>) => {
          if (payload.eventType === "INSERT") {
            setPlayers((prev) => {
              const exists = prev.some((p) => p.id === (payload.new as Player).id);
              if (exists) return prev;
              return [...prev, payload.new as Player];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return players;
}

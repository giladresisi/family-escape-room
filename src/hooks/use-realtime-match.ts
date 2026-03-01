"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Match } from "@/lib/types/match";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimeMatch(matchId: string, initial: Match | null) {
  const [match, setMatch] = useState<Match | null>(initial);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<Match>) => {
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setMatch(payload.new as Match);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return match;
}

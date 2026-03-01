"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MatchRiddle } from "@/lib/types/riddle";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimeRiddles(matchId: string, initial: MatchRiddle[]) {
  const [riddles, setRiddles] = useState<MatchRiddle[]>(initial);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`riddles:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_riddles",
          filter: `match_id=eq.${matchId}`,
        },
        (payload: RealtimePostgresChangesPayload<MatchRiddle>) => {
          if (payload.eventType === "UPDATE") {
            setRiddles((prev) =>
              prev.map((r) =>
                r.id === (payload.new as MatchRiddle).id
                  ? { ...r, ...payload.new }
                  : r
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Re-fetch riddle details when visibility changes
  useEffect(() => {
    const fetchRiddleDetails = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("match_riddles")
        .select("*, riddle:riddles(*)")
        .eq("match_id", matchId)
        .order("riddle(sort_order)", { ascending: true });

      if (data) {
        setRiddles(
          data.map((mr) => ({
            ...mr,
            riddle: mr.riddle,
          }))
        );
      }
    };

    // Only refetch if there are riddles without details that are now visible
    const hasNewVisible = riddles.some((r) => r.is_visible && !r.riddle);
    if (hasNewVisible) {
      fetchRiddleDetails();
    }
  }, [riddles, matchId]);

  return riddles;
}

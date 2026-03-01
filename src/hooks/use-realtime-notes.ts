"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PlayerNote } from "@/lib/types/riddle";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export function useRealtimeNotes(
  matchRiddleIds: string[],
  initial: PlayerNote[]
) {
  const [notes, setNotes] = useState<PlayerNote[]>(initial);

  useEffect(() => {
    if (matchRiddleIds.length === 0) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notes:${matchRiddleIds.join(",")}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_notes",
        },
        (payload: RealtimePostgresChangesPayload<PlayerNote>) => {
          if (payload.eventType === "INSERT") {
            const newNote = payload.new as PlayerNote;
            if (matchRiddleIds.includes(newNote.match_riddle_id)) {
              setNotes((prev) => {
                const exists = prev.some((n) => n.id === newNote.id);
                if (exists) return prev;
                return [...prev, newNote];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedNote = payload.new as PlayerNote;
            setNotes((prev) =>
              prev.map((n) =>
                n.id === updatedNote.id ? { ...n, ...updatedNote } : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchRiddleIds]);

  return [notes, setNotes] as const;
}

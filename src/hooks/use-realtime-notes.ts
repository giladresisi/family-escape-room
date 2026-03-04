"use client";

import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { PlayerNote } from "@/lib/types/riddle";

export function useRealtimeNotes(
  matchRiddleIds: string[],
  initial: PlayerNote[]
) {
  const [notes, setNotes] = useState<PlayerNote[]>(initial);

  useEffect(() => {
    if (matchRiddleIds.length === 0) return;

    const q = query(
      collection(clientDb(), "player_notes"),
      where("match_riddle_id", "in", matchRiddleIds)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PlayerNote)
      );
    });

    return unsubscribe;
  }, [matchRiddleIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return [notes, setNotes] as const;
}

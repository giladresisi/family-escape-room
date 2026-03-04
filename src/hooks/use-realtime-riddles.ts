"use client";

import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { MatchRiddle } from "@/lib/types/riddle";

export function useRealtimeRiddles(matchId: string, initial: MatchRiddle[]) {
  const [riddles, setRiddles] = useState<MatchRiddle[]>(initial);

  useEffect(() => {
    const q = query(
      collection(clientDb(), "match_riddles"),
      where("match_id", "==", matchId),
      orderBy("sort_order")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRiddles(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as MatchRiddle)
      );
    });

    return unsubscribe;
  }, [matchId]);

  return riddles;
}

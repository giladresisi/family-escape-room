"use client";

import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";
import { Match } from "@/lib/types/match";

export function useRealtimeMatch(matchId: string, initial: Match | null) {
  const [match, setMatch] = useState<Match | null>(initial);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(clientDb(), "matches", matchId),
      (snapshot) => {
        if (snapshot.exists()) {
          setMatch({ id: snapshot.id, ...snapshot.data() } as Match);
        }
      }
    );
    return unsubscribe;
  }, [matchId]);

  return match;
}

"use client";

import { useEffect, useState } from "react";
import { clientDb } from "@/lib/firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Player } from "@/lib/types/match";

export function useRealtimePlayers(matchId: string, initial: Player[]) {
  const [players, setPlayers] = useState<Player[]>(initial);

  useEffect(() => {
    const q = query(
      collection(clientDb(), "players"),
      where("match_id", "==", matchId),
      orderBy("joined_at")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPlayers(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Player)
      );
    });

    return unsubscribe;
  }, [matchId]);

  return players;
}

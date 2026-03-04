import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { matchRiddleId, playerId, content } = await request.json();

  if (!matchRiddleId || !playerId) {
    return NextResponse.json(
      { error: "matchRiddleId and playerId are required" },
      { status: 400 }
    );
  }

  // Deterministic ID: one note per (matchRiddle, player)
  const noteId = `${matchRiddleId}_${playerId}`;
  await adminDb()
    .collection("player_notes")
    .doc(noteId)
    .set(
      {
        id: noteId,
        match_riddle_id: matchRiddleId,
        player_id: playerId,
        content: content ?? "",
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

  return NextResponse.json({ success: true });
}

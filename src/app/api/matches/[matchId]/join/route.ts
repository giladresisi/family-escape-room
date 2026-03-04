import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const { displayName } = await request.json();

  if (!displayName || displayName.trim().length === 0) {
    return NextResponse.json(
      { error: "Display name is required" },
      { status: 400 }
    );
  }

  const matchSnap = await adminDb().collection("matches").doc(matchId).get();
  if (!matchSnap.exists) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  const match = matchSnap.data()!;

  if (match.status !== "waiting") {
    return NextResponse.json(
      { error: "This match has already started. You can no longer join." },
      { status: 403 }
    );
  }

  // Check if display name is already taken
  const existingSnap = await adminDb()
    .collection("players")
    .where("match_id", "==", matchId)
    .where("display_name", "==", displayName.trim())
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    return NextResponse.json(
      { error: "This name is already taken in this match" },
      { status: 409 }
    );
  }

  const playerRef = adminDb().collection("players").doc();
  const playerData = {
    match_id: matchId,
    user_id: null,
    display_name: displayName.trim(),
    is_creator: false,
    joined_at: new Date().toISOString(),
  };
  await playerRef.set(playerData);
  const player = { id: playerRef.id, ...playerData };

  return NextResponse.json({ player, matchId });
}

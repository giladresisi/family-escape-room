import { adminDb, getUserFromRequest } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matchSnap = await adminDb().collection("matches").doc(matchId).get();
  if (!matchSnap.exists) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  const match = matchSnap.data()!;

  if (match.creator_id !== user.uid) {
    return NextResponse.json(
      { error: "Only the match creator can start the game" },
      { status: 403 }
    );
  }

  if (match.status !== "waiting") {
    return NextResponse.json(
      { error: "Match has already started" },
      { status: 400 }
    );
  }

  const startedAt = new Date().toISOString();
  await adminDb().collection("matches").doc(matchId).update({
    status: "playing",
    started_at: startedAt,
  });

  const updatedMatch = { id: matchId, ...match, status: "playing", started_at: startedAt };
  return NextResponse.json({ match: updatedMatch });
}

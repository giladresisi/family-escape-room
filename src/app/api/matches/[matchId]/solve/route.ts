import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const { matchRiddleId, answer, playerId } = await request.json();

  if (!matchRiddleId || !answer || !playerId) {
    return NextResponse.json(
      { error: "matchRiddleId, answer, and playerId are required" },
      { status: 400 }
    );
  }

  const matchSnap = await adminDb().collection("matches").doc(matchId).get();
  if (!matchSnap.exists || matchSnap.data()!.status !== "playing") {
    return NextResponse.json(
      { error: "Match is not in progress" },
      { status: 400 }
    );
  }

  const mrSnap = await adminDb()
    .collection("match_riddles")
    .doc(matchRiddleId)
    .get();

  if (!mrSnap.exists || mrSnap.data()!.match_id !== matchId) {
    return NextResponse.json({ error: "Riddle not found" }, { status: 404 });
  }

  const matchRiddle = mrSnap.data()!;

  if (matchRiddle.is_solved) {
    return NextResponse.json(
      { error: "This riddle is already solved" },
      { status: 400 }
    );
  }

  const riddle = matchRiddle.riddle;
  const isCorrect =
    answer.trim().toLowerCase() === riddle.answer.trim().toLowerCase();

  if (!isCorrect) {
    return NextResponse.json({ correct: false });
  }

  // Mark riddle as solved
  await adminDb().collection("match_riddles").doc(matchRiddleId).update({
    is_solved: true,
    solved_by: playerId,
    solved_at: new Date().toISOString(),
  });

  // Unlock dependent match_riddles
  const dependentsSnap = await adminDb()
    .collection("match_riddles")
    .where("match_id", "==", matchId)
    .where("riddle.depends_on_id", "==", riddle.id)
    .get();

  if (!dependentsSnap.empty) {
    const batch = adminDb().batch();
    dependentsSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { is_visible: true });
    });
    await batch.commit();
  }

  // Check if this was the final riddle
  if (riddle.is_final) {
    await adminDb().collection("matches").doc(matchId).update({
      status: "finished",
      finished_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    correct: true,
    isFinal: riddle.is_final,
    unlockedCount: dependentsSnap.size,
  });
}

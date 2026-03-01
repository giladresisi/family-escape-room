import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const admin = createAdminClient();

  const { matchRiddleId, answer, playerId } = await request.json();

  if (!matchRiddleId || !answer || !playerId) {
    return NextResponse.json(
      { error: "matchRiddleId, answer, and playerId are required" },
      { status: 400 }
    );
  }

  // Verify match is playing
  const { data: match } = await admin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match || match.status !== "playing") {
    return NextResponse.json(
      { error: "Match is not in progress" },
      { status: 400 }
    );
  }

  // Get the match riddle with its template riddle
  const { data: matchRiddle } = await admin
    .from("match_riddles")
    .select("*, riddle:riddles(*)")
    .eq("id", matchRiddleId)
    .eq("match_id", matchId)
    .single();

  if (!matchRiddle) {
    return NextResponse.json(
      { error: "Riddle not found" },
      { status: 404 }
    );
  }

  if (matchRiddle.is_solved) {
    return NextResponse.json(
      { error: "This riddle is already solved" },
      { status: 400 }
    );
  }

  // Check answer (case-insensitive, trimmed)
  const riddle = matchRiddle.riddle;
  const isCorrect =
    answer.trim().toLowerCase() === riddle.answer.trim().toLowerCase();

  if (!isCorrect) {
    return NextResponse.json({ correct: false });
  }

  // Mark riddle as solved
  await admin
    .from("match_riddles")
    .update({
      is_solved: true,
      solved_by: playerId,
      solved_at: new Date().toISOString(),
    })
    .eq("id", matchRiddleId);

  // Unlock dependent riddles
  const { data: dependentRiddles } = await admin
    .from("riddles")
    .select("id")
    .eq("depends_on_id", riddle.id);

  if (dependentRiddles && dependentRiddles.length > 0) {
    const dependentRiddleIds = dependentRiddles.map((r) => r.id);
    await admin
      .from("match_riddles")
      .update({ is_visible: true })
      .eq("match_id", matchId)
      .in("riddle_id", dependentRiddleIds);
  }

  // Check if this was the final riddle
  if (riddle.is_final) {
    await admin
      .from("matches")
      .update({
        status: "finished",
        finished_at: new Date().toISOString(),
      })
      .eq("id", matchId);
  }

  return NextResponse.json({
    correct: true,
    isFinal: riddle.is_final,
    unlockedCount: dependentRiddles?.length || 0,
  });
}

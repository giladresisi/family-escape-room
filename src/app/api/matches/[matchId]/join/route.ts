import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const admin = createAdminClient();

  const { displayName } = await request.json();

  if (!displayName || displayName.trim().length === 0) {
    return NextResponse.json(
      { error: "Display name is required" },
      { status: 400 }
    );
  }

  // Check match exists and is in waiting state
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "waiting") {
    return NextResponse.json(
      { error: "This match has already started. You can no longer join." },
      { status: 403 }
    );
  }

  // Check if display name is already taken in this match
  const { data: existingPlayer } = await admin
    .from("players")
    .select("id")
    .eq("match_id", matchId)
    .eq("display_name", displayName.trim())
    .single();

  if (existingPlayer) {
    return NextResponse.json(
      { error: "This name is already taken in this match" },
      { status: 409 }
    );
  }

  // Create player
  const { data: player, error: playerError } = await admin
    .from("players")
    .insert({
      match_id: matchId,
      display_name: displayName.trim(),
      is_creator: false,
    })
    .select()
    .single();

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 });
  }

  return NextResponse.json({ player, matchId });
}

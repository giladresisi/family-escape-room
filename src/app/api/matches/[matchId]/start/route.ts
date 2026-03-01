import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user is the match creator
  const { data: match } = await admin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.creator_id !== user.id) {
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

  // Start the match
  const { data: updatedMatch, error } = await admin
    .from("matches")
    .update({
      status: "playing",
      started_at: new Date().toISOString(),
    })
    .eq("id", matchId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ match: updatedMatch });
}

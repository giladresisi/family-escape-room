import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MATCH_CODE_ALPHABET, MATCH_CODE_LENGTH } from "@/lib/constants";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";

const generateCode = customAlphabet(MATCH_CODE_ALPHABET, MATCH_CODE_LENGTH);

export async function POST(request: Request) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { themeId } = await request.json();

  if (!themeId) {
    return NextResponse.json(
      { error: "themeId is required" },
      { status: 400 }
    );
  }

  // Generate unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await admin
      .from("matches")
      .select("id")
      .eq("code", code)
      .single();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  // Create match
  const { data: match, error: matchError } = await admin
    .from("matches")
    .insert({
      code,
      creator_id: user.id,
      theme_id: themeId,
      status: "waiting",
    })
    .select()
    .single();

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  // Add creator as player
  const { data: player, error: playerError } = await admin
    .from("players")
    .insert({
      match_id: match.id,
      user_id: user.id,
      display_name: user.user_metadata?.full_name || user.email || "Host",
      is_creator: true,
    })
    .select()
    .single();

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 });
  }

  // Get riddles for this theme and create match_riddles
  const { data: riddles } = await admin
    .from("riddles")
    .select("*")
    .eq("theme_id", themeId)
    .order("sort_order", { ascending: true });

  if (riddles && riddles.length > 0) {
    const matchRiddles = riddles.map((riddle) => ({
      match_id: match.id,
      riddle_id: riddle.id,
      is_visible: riddle.depends_on_id === null,
      is_solved: false,
    }));

    await admin.from("match_riddles").insert(matchRiddles);
  }

  return NextResponse.json({ match, playerId: player.id });
}

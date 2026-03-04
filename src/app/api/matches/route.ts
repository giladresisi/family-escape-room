import { adminDb, getUserFromRequest } from "@/lib/firebase/admin";
import { MATCH_CODE_ALPHABET, MATCH_CODE_LENGTH } from "@/lib/constants";
import { customAlphabet } from "nanoid";
import { NextResponse } from "next/server";

const generateCode = customAlphabet(MATCH_CODE_ALPHABET, MATCH_CODE_LENGTH);

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { themeId } = await request.json();
  if (!themeId) {
    return NextResponse.json({ error: "themeId is required" }, { status: 400 });
  }

  // Generate unique code
  let code = generateCode();
  for (let i = 0; i < 10; i++) {
    const existing = await adminDb()
      .collection("matches")
      .where("code", "==", code)
      .limit(1)
      .get();
    if (existing.empty) break;
    code = generateCode();
  }

  // Fetch theme name for denormalization
  const themeSnap = await adminDb().collection("riddle_themes").doc(themeId).get();
  const themeName = themeSnap.data()?.name || "Unknown Theme";

  const now = new Date().toISOString();

  // Create match
  const matchRef = adminDb().collection("matches").doc();
  const matchData = {
    code,
    creator_id: user.uid,
    theme_id: themeId,
    theme_name: themeName,
    status: "waiting",
    started_at: null,
    finished_at: null,
    created_at: now,
  };
  await matchRef.set(matchData);
  const match = { id: matchRef.id, ...matchData };

  // Add creator as player
  const playerRef = adminDb().collection("players").doc();
  const playerData = {
    match_id: matchRef.id,
    user_id: user.uid,
    display_name: user.name || user.email || "Host",
    is_creator: true,
    joined_at: now,
  };
  await playerRef.set(playerData);
  const player = { id: playerRef.id, ...playerData };

  // Get riddles for this theme
  const riddlesSnap = await adminDb()
    .collection("riddles")
    .where("theme_id", "==", themeId)
    .orderBy("sort_order")
    .get();
  const riddles = riddlesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
    id: string;
    sort_order: number;
    depends_on_id: string | null;
    title: string;
    body: string;
    hint: string | null;
    answer: string;
    flavor_text: string | null;
    is_final: boolean;
  }[];

  if (riddles.length > 0) {
    const batch = adminDb().batch();
    for (const riddle of riddles) {
      const mrRef = adminDb().collection("match_riddles").doc();
      batch.set(mrRef, {
        match_id: matchRef.id,
        riddle_id: riddle.id,
        sort_order: riddle.sort_order,
        is_visible: riddle.depends_on_id === null,
        is_solved: false,
        solved_by: null,
        solved_at: null,
        riddle: {
          id: riddle.id,
          title: riddle.title,
          body: riddle.body,
          hint: riddle.hint ?? null,
          answer: riddle.answer,
          sort_order: riddle.sort_order,
          depends_on_id: riddle.depends_on_id ?? null,
          flavor_text: riddle.flavor_text ?? null,
          is_final: riddle.is_final ?? false,
        },
      });
    }
    await batch.commit();
  }

  return NextResponse.json({ match, playerId: player.id });
}

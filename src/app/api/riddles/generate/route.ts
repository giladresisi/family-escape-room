import { adminDb, getUserFromRequest } from "@/lib/firebase/admin";
import { generateRiddleTheme } from "@/lib/ai/generate-riddles";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { prompt } = await request.json();
  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Theme description is required" },
      { status: 400 }
    );
  }

  try {
    const generatedTheme = await generateRiddleTheme(prompt.trim());
    const now = new Date().toISOString();

    // Create theme
    const themeRef = adminDb().collection("riddle_themes").doc();
    const themeData = {
      name: generatedTheme.name,
      description: generatedTheme.description,
      image_url: null,
      is_ai: true,
      created_at: now,
    };
    await themeRef.set(themeData);
    const theme = { id: themeRef.id, ...themeData };

    // Insert riddles, resolving depends_on_index to actual IDs
    const riddleIdMap: Record<number, string> = {};

    for (let i = 0; i < generatedTheme.riddles.length; i++) {
      const riddle = generatedTheme.riddles[i];
      const dependsOnId =
        riddle.depends_on_index !== null
          ? (riddleIdMap[riddle.depends_on_index] ?? null)
          : null;

      const riddleRef = adminDb().collection("riddles").doc();
      await riddleRef.set({
        theme_id: themeRef.id,
        title: riddle.title,
        body: riddle.body,
        hint: riddle.hint ?? null,
        answer: riddle.answer,
        sort_order: riddle.sort_order,
        depends_on_id: dependsOnId,
        flavor_text: riddle.flavor_text ?? null,
        is_final: riddle.is_final ?? false,
        created_at: now,
      });
      riddleIdMap[i] = riddleRef.id;
    }

    return NextResponse.json({ theme });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate theme. Please try again." },
      { status: 500 }
    );
  }
}

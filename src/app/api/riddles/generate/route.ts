import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRiddleTheme } from "@/lib/ai/generate-riddles";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    const admin = createAdminClient();

    // Create theme
    const { data: theme, error: themeError } = await admin
      .from("riddle_themes")
      .insert({
        name: generatedTheme.name,
        description: generatedTheme.description,
        is_ai: true,
      })
      .select()
      .single();

    if (themeError || !theme) {
      return NextResponse.json(
        { error: "Failed to save theme" },
        { status: 500 }
      );
    }

    // Insert riddles, resolving depends_on_index to actual IDs
    const riddleIdMap: Record<number, string> = {};

    for (const riddle of generatedTheme.riddles) {
      const dependsOnId =
        riddle.depends_on_index !== null
          ? riddleIdMap[riddle.depends_on_index]
          : null;

      const { data: insertedRiddle } = await admin
        .from("riddles")
        .insert({
          theme_id: theme.id,
          title: riddle.title,
          body: riddle.body,
          hint: riddle.hint,
          answer: riddle.answer,
          sort_order: riddle.sort_order,
          depends_on_id: dependsOnId || null,
          flavor_text: riddle.flavor_text,
          is_final: riddle.is_final,
        })
        .select()
        .single();

      if (insertedRiddle) {
        riddleIdMap[generatedTheme.riddles.indexOf(riddle)] = insertedRiddle.id;
      }
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

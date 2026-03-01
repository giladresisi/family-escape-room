import Anthropic from "@anthropic-ai/sdk";

export interface GeneratedRiddle {
  title: string;
  body: string;
  hint: string;
  answer: string;
  sort_order: number;
  depends_on_index: number | null; // index in the array, null = visible from start
  flavor_text: string;
  is_final: boolean;
}

export interface GeneratedTheme {
  name: string;
  description: string;
  riddles: GeneratedRiddle[];
}

export async function generateRiddleTheme(
  prompt: string
): Promise<GeneratedTheme> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a creative escape room designer. Generate a themed escape room riddle set based on this theme: "${prompt}"

Create 6 riddles that form an escape room experience. The riddles should:
1. Have 2 riddles visible from the start (depends_on_index: null)
2. Each of those 2 starting riddles should unlock 1 new riddle when solved
3. One of those unlocked riddles should unlock another riddle
4. That last riddle should be the final one (is_final: true)
5. Each riddle should be solvable with a single word or short phrase answer
6. Some riddles should reference information from previous riddle solutions
7. Riddles should be family-friendly and fun for all ages
8. Include hints that give a helpful nudge without giving away the answer

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "name": "Theme Name",
  "description": "A 1-2 sentence description of the escape room scenario",
  "riddles": [
    {
      "title": "Riddle Title",
      "body": "The full riddle text that players see",
      "hint": "A helpful hint",
      "answer": "the answer",
      "sort_order": 1,
      "depends_on_index": null,
      "flavor_text": "Text shown after solving, advances the story",
      "is_final": false
    }
  ]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  // Parse the JSON response, stripping any markdown fences if present
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const theme = JSON.parse(jsonText) as GeneratedTheme;

  // Validate
  if (!theme.name || !theme.description || !theme.riddles?.length) {
    throw new Error("Invalid theme generated");
  }

  return theme;
}

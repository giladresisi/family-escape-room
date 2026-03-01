"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemePicker from "@/components/theme/theme-picker";
import { RiddleTheme } from "@/lib/types/riddle";

export default function CreatePage() {
  const router = useRouter();
  const [themes, setThemes] = useState<RiddleTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI generation state
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/themes")
      .then((res) => res.json())
      .then((data) => {
        setThemes(data.themes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load themes");
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    if (!selectedTheme) return;
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: selectedTheme }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create match");
        setCreating(false);
        return;
      }

      // Store playerId for the creator
      localStorage.setItem(`player_${data.match.id}`, data.playerId);
      router.push(`/match/${data.match.id}`);
    } catch {
      setError("Failed to create match");
      setCreating(false);
    }
  };

  const handleGenerateTheme = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/riddles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate theme");
        setGenerating(false);
        return;
      }

      setThemes((prev) => [...prev, data.theme]);
      setSelectedTheme(data.theme.id);
      setShowAiForm(false);
      setAiPrompt("");
    } catch {
      setError("Failed to generate theme");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-foreground/60">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Create a Room</h1>
        <p className="text-foreground/60">
          Choose an escape room theme or generate a custom one with AI.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error/10 p-4 text-error">
          {error}
        </div>
      )}

      <ThemePicker
        themes={themes}
        selectedId={selectedTheme}
        onSelect={setSelectedTheme}
      />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          onClick={handleCreate}
          disabled={!selectedTheme || creating}
          className="rounded-xl bg-accent px-8 py-3 font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {creating ? "Creating..." : "Create Match"}
        </button>

        <div className="border-t border-surface-light sm:border-t-0 sm:border-l sm:pl-4 pt-4 sm:pt-0">
          {!showAiForm ? (
            <button
              onClick={() => setShowAiForm(true)}
              className="text-accent-light hover:text-accent transition-colors font-medium"
            >
              Or generate a custom theme with AI
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-sm text-foreground/60">
                  Describe your theme
                </label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateTheme()}
                  placeholder="e.g., Underwater submarine adventure"
                  className="w-full rounded-lg bg-surface-light px-4 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <button
                onClick={handleGenerateTheme}
                disabled={!aiPrompt.trim() || generating}
                className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition-all hover:bg-accent-light disabled:opacity-40"
              >
                {generating ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={() => {
                  setShowAiForm(false);
                  setAiPrompt("");
                }}
                className="text-sm text-foreground/40 hover:text-foreground/60"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

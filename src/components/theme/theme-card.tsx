"use client";

import { RiddleTheme } from "@/lib/types/riddle";

interface ThemeCardProps {
  theme: RiddleTheme;
  onSelect: (themeId: string) => void;
  selected: boolean;
}

const themeIcons: Record<string, string> = {
  "The Haunted House": "🏚️",
  "Space Station Omega": "🚀",
  "Mystery Mansion: The Missing Diamond": "🔍",
};

export default function ThemeCard({ theme, onSelect, selected }: ThemeCardProps) {
  const icon = themeIcons[theme.name] || (theme.is_ai ? "🤖" : "🎭");

  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={`w-full rounded-xl border-2 p-6 text-left transition-all ${
        selected
          ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
          : "border-surface-light bg-surface hover:border-accent/50 hover:bg-surface-light"
      }`}
    >
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-foreground">{theme.name}</h3>
      <p className="text-sm text-foreground/60">{theme.description}</p>
      {theme.is_ai && (
        <span className="mt-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-light">
          AI Generated
        </span>
      )}
    </button>
  );
}

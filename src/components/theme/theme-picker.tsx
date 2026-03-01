"use client";

import { RiddleTheme } from "@/lib/types/riddle";
import ThemeCard from "./theme-card";

interface ThemePickerProps {
  themes: RiddleTheme[];
  selectedId: string | null;
  onSelect: (themeId: string) => void;
}

export default function ThemePicker({
  themes,
  selectedId,
  onSelect,
}: ThemePickerProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onSelect={onSelect}
          selected={selectedId === theme.id}
        />
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { NOTES_DEBOUNCE_MS } from "@/lib/constants";

interface PlayerNoteEditorProps {
  matchRiddleId: string;
  playerId: string;
  playerName: string;
  initialContent: string;
  isCurrentPlayer: boolean;
}

export default function PlayerNoteEditor({
  matchRiddleId,
  playerId,
  playerName,
  initialContent,
  isCurrentPlayer,
}: PlayerNoteEditorProps) {
  const [content, setContent] = useState(initialContent);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isCurrentPlayer) {
      setContent(initialContent);
    }
  }, [initialContent, isCurrentPlayer]);

  const saveNote = useCallback(
    async (text: string) => {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchRiddleId,
          playerId,
          content: text,
        }),
      });
    },
    [matchRiddleId, playerId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      saveNote(text);
    }, NOTES_DEBOUNCE_MS);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground/50">
        {playerName}
        {isCurrentPlayer && (
          <span className="text-accent-light"> (you)</span>
        )}
      </label>
      <textarea
        value={content}
        onChange={handleChange}
        readOnly={!isCurrentPlayer}
        placeholder={
          isCurrentPlayer
            ? "Share your thoughts on this riddle..."
            : `${playerName} hasn't written anything yet`
        }
        className={`w-full resize-none rounded-lg px-3 py-2 text-sm ${
          isCurrentPlayer
            ? "bg-background text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-accent"
            : "bg-surface text-foreground/70 cursor-default"
        }`}
        rows={3}
      />
    </div>
  );
}

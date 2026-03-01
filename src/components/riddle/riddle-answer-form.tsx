"use client";

import { useState } from "react";

interface RiddleAnswerFormProps {
  matchId: string;
  matchRiddleId: string;
  playerId: string;
  isSolved: boolean;
}

export default function RiddleAnswerForm({
  matchId,
  matchRiddleId,
  playerId,
  isSolved,
}: RiddleAnswerFormProps) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "wrong";
    message: string;
  } | null>(null);

  if (isSolved) return null;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/matches/${matchId}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchRiddleId, answer: answer.trim(), playerId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", message: data.error || "Failed to submit" });
      } else if (!data.correct) {
        setFeedback({ type: "wrong", message: "Not quite right. Try again!" });
        setAnswer("");
      }
      // If correct, the realtime update will handle the UI change
    } catch {
      setFeedback({ type: "error", message: "Failed to submit answer" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Type your answer..."
          className="flex-1 rounded-lg bg-background px-4 py-2 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={submitting}
        />
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting}
          className="rounded-lg bg-accent px-5 py-2 font-medium text-white transition-all hover:bg-accent-light disabled:opacity-40"
        >
          {submitting ? "..." : "Submit"}
        </button>
      </div>

      {feedback && (
        <p
          className={`text-sm ${
            feedback.type === "wrong" ? "text-warning" : "text-error"
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}

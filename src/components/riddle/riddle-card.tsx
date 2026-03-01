"use client";

import { useState } from "react";
import { MatchRiddle, PlayerNote } from "@/lib/types/riddle";
import { Player } from "@/lib/types/match";
import RiddleAnswerForm from "./riddle-answer-form";
import RiddleNotes from "./riddle-notes";

interface RiddleCardProps {
  matchRiddle: MatchRiddle;
  matchId: string;
  players: Player[];
  notes: PlayerNote[];
  currentPlayerId: string | null;
  solvedByName?: string;
}

export default function RiddleCard({
  matchRiddle,
  matchId,
  players,
  notes,
  currentPlayerId,
  solvedByName,
}: RiddleCardProps) {
  const [expanded, setExpanded] = useState(!matchRiddle.is_solved);
  const riddle = matchRiddle.riddle;

  if (!riddle) return null;

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        matchRiddle.is_solved
          ? "border-success/30 bg-success/5"
          : "border-surface-light bg-surface"
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
              matchRiddle.is_solved
                ? "bg-success text-white"
                : "bg-accent/20 text-accent-light"
            }`}
          >
            {matchRiddle.is_solved ? "✓" : riddle.sort_order}
          </span>
          <h3
            className={`text-lg font-bold ${
              matchRiddle.is_solved ? "text-success" : "text-foreground"
            }`}
          >
            {riddle.title}
          </h3>
        </div>
        <svg
          className={`h-5 w-5 text-foreground/40 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-surface-light px-5 pb-5 pt-4">
          <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed">
            {riddle.body}
          </p>

          {riddle.hint && !matchRiddle.is_solved && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-warning hover:text-warning/80">
                Need a hint?
              </summary>
              <p className="mt-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                {riddle.hint}
              </p>
            </details>
          )}

          {matchRiddle.is_solved && (
            <div className="mt-4 rounded-lg bg-success/10 p-4">
              <p className="text-sm font-medium text-success">
                Solved{solvedByName ? ` by ${solvedByName}` : ""}!
              </p>
              <p className="mt-1 font-mono text-sm text-success/80">
                Answer: {riddle.answer}
              </p>
              {riddle.flavor_text && (
                <p className="mt-2 text-sm italic text-foreground/60">
                  {riddle.flavor_text}
                </p>
              )}
            </div>
          )}

          {!matchRiddle.is_solved && currentPlayerId && (
            <RiddleAnswerForm
              matchId={matchId}
              matchRiddleId={matchRiddle.id}
              playerId={currentPlayerId}
              isSolved={matchRiddle.is_solved}
            />
          )}

          <RiddleNotes
            matchRiddleId={matchRiddle.id}
            players={players}
            notes={notes}
            currentPlayerId={currentPlayerId}
          />
        </div>
      )}
    </div>
  );
}

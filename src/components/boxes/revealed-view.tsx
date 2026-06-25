"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Eye, EyeOff, Crown } from "lucide-react";
import type { BoxResults, QuestionResult } from "@/lib/results";

interface RevealedViewProps {
  results: BoxResults;
}

const podiumIcons = [
  <Trophy key="1" className="h-5 w-5 text-yellow-400" />,
  <Medal key="2" className="h-5 w-5 text-gray-400" />,
  <Award key="3" className="h-5 w-5 text-amber-700" />,
];

function UserAvatar({ src, name, size = "sm" }: { src: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-10 w-10" : size === "md" ? "h-8 w-8" : "h-6 w-6";
  return (
    <Avatar className={`${sizeClass} ring-2 ring-background shrink-0`}>
      {src ? (
        <AvatarImage src={src} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className="text-[10px] font-bold bg-secondary/50 text-muted-foreground">
        {name[0]?.toUpperCase() ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function RevealedView({ results }: RevealedViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero Summary */}
      <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-b from-muted/40 to-muted/10 border border-border/50">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
          <Crown className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-2">
          Results are in!
        </h2>
        <p className="text-muted-foreground">
          {results.totalQuestions} question{results.totalQuestions !== 1 ? "s" : ""} &middot;{" "}
          {results.totalMembers} member{results.totalMembers !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {results.questions.map((question, qi) => (
          <QuestionCard key={question.questionId} question={question} index={qi} />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({ question, index }: { question: QuestionResult; index: number }) {
  const isPublic = "votes" in question;
  const maxVotes = question.tally[0]?.voteCount ?? 0;

  const groups: Array<{ voteCount: number; entries: typeof question.tally; rank: number }> = [];
  let denseRank = 0;
  for (let i = 0; i < question.tally.length; ) {
    denseRank++;
    const voteCount = question.tally[i].voteCount;
    const group = [question.tally[i]];
    let j = i + 1;
    while (j < question.tally.length && question.tally[j].voteCount === voteCount) {
      group.push(question.tally[j]);
      j++;
    }
    if (denseRank <= 3) {
      groups.push({ voteCount, entries: group, rank: denseRank });
    } else {
      for (const entry of group) {
        groups.push({ voteCount: entry.voteCount, entries: [entry], rank: denseRank });
      }
    }
    i = j;
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded">
                #{index + 1}
              </span>
              {isPublic ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <Eye className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                  <EyeOff className="h-3 w-3" />
                  Anonymous
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold leading-snug">
              {question.questionText}
            </h3>
          </div>
          {question.winner && (
            <Badge variant="default" className="shrink-0 gap-1.5 py-1.5 px-3 text-xs">
              <Crown className="h-3.5 w-3.5" />
              {question.winner.candidateUsername}
            </Badge>
          )}
        </div>
      </div>

      {/* Winner highlight */}
      {question.winner && (
        <div className="px-5 py-4 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <UserAvatar src={question.winner.candidateAvatarUrl} name={question.winner.candidateUsername} size="lg" />
            <div>
              <p className="text-xs text-muted-foreground/60">Most voted</p>
              <p className="font-semibold text-base">{question.winner.candidateUsername}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-primary">{question.winner.voteCount}</p>
              <p className="text-xs text-muted-foreground/60">
                vote{question.winner.voteCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tally */}
      <div className="p-5 space-y-4">
        {groups.map((group, gi) => {
          const barWidth = maxVotes > 0 ? (group.voteCount / maxVotes) * 100 : 0;
          const barColor =
            gi === 0
              ? "bg-primary"
              : gi === 1
              ? "bg-primary/60"
              : gi === 2
              ? "bg-primary/35"
              : "bg-primary/15";
          return (
            <div key={group.entries[0].candidateId} className="space-y-2">
              {/* Candidates row */}
              <div className="flex items-center gap-2.5">
                {/* Rank badge */}
                <span className="w-7 shrink-0 flex justify-center">
                  {group.rank === 1
                    ? podiumIcons[0]
                    : group.rank === 2
                    ? podiumIcons[1]
                    : group.rank === 3
                    ? podiumIcons[2]
                    : <span className="text-xs text-muted-foreground/40 font-mono">{group.rank}</span>}
                </span>
                {/* Avatars row */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {group.entries.map((entry, ei) => (
                    <div key={entry.candidateId} className="flex items-center gap-1.5 min-w-0">
                      {ei > 0 && (
                        <span className="text-muted-foreground/40 text-xs mx-0.5 shrink-0">+</span>
                      )}
                      <UserAvatar src={entry.candidateAvatarUrl} name={entry.candidateUsername} size="sm" />
                      <span className="font-medium text-sm truncate max-w-[100px]">{entry.candidateUsername}</span>
                    </div>
                  ))}
                </div>
                {/* Vote count */}
                <span className="text-sm font-mono text-muted-foreground tabular-nums shrink-0">
                  {group.voteCount} vote{group.voteCount !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2.5 bg-muted/60 rounded-full overflow-hidden ml-7">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Public vote breakdown */}
      {isPublic && question.votes.length > 0 && (
        <details className="group border-t border-border/30">
          <summary className="px-5 py-3 text-xs text-muted-foreground/60 cursor-pointer hover:text-foreground/80 transition-colors select-none list-none flex items-center gap-1.5">
            <span className="group-open:rotate-90 transition-transform">&#9654;</span>
            View individual votes ({question.tally.reduce((s, t) => s + t.voteCount, 0)} total)
          </summary>
          <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {question.votes.map((vote, vi) => (
              <div
                key={vi}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/30 text-xs"
              >
                <UserAvatar src={vote.voterAvatarUrl} name={vote.voterUsername} size="sm" />
                <span className="text-muted-foreground truncate">{vote.voterUsername}</span>
                <span className="text-muted-foreground/40 mx-0.5">&rarr;</span>
                <UserAvatar src={vote.candidateAvatarUrl} name={vote.candidateUsername} size="sm" />
                <span className="font-medium truncate">{vote.candidateUsername}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

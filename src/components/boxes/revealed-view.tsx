"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Eye, EyeOff, Crown } from "lucide-react";
import type { BoxResults, QuestionResult } from "@/lib/results";

interface RevealedViewProps {
  results: BoxResults;
}

const podiumIcons = [
  <Trophy key="1" className="h-6 w-6 text-yellow-400" />,
  <Medal key="2" className="h-6 w-6 text-gray-400" />,
  <Award key="3" className="h-6 w-6 text-amber-700" />,
];

function UserAvatar({ src, name, size = "sm" }: { src: string | null; name: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClass =
    size === "xl" ? "h-16 w-16" :
    size === "lg" ? "h-12 w-12" :
    size === "md" ? "h-10 w-10" :
    size === "sm" ? "h-8 w-8" :
    "h-6 w-6";
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

  const podiumGroup = groups.find((g) => g.rank === 1);
  const secondGroup = groups.find((g) => g.rank === 2);
  const thirdGroup = groups.find((g) => g.rank === 3);
  const listGroups = groups.filter((g) => g.rank > 3);

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
          {podiumGroup && (
            <Badge variant="default" className="shrink-0 gap-1.5 py-1.5 px-3 text-xs">
              <Crown className="h-3.5 w-3.5" />
              {podiumGroup.entries.length > 1
                ? `${podiumGroup.entries.length}-way tie`
                : podiumGroup.entries[0].candidateUsername}
            </Badge>
          )}
        </div>
      </div>

      {/* Podium */}
      {podiumGroup && (
        <div className="px-5 py-8 bg-gradient-to-b from-primary/[0.04] to-transparent border-b border-border/30">
          <div className="flex items-end justify-center gap-3 sm:gap-5">
            {/* 2nd place */}
            {secondGroup && (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  {podiumIcons[1] && <span className="text-gray-400 [&_svg]:h-5 [&_svg]:w-5">{podiumIcons[1]}</span>}
                  <div className="flex items-center justify-center gap-2 flex-wrap px-1">
                    {secondGroup.entries.map((entry) => (
                      <div key={entry.candidateId} className="flex flex-col items-center gap-1">
                        <UserAvatar src={entry.candidateAvatarUrl} name={entry.candidateUsername} size="md" />
                        <span className="font-semibold text-[10px] text-center leading-tight max-w-16 truncate">{entry.candidateUsername}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/60">{secondGroup.voteCount}</span>
                </div>
                <div className="w-20 sm:w-24 h-24 sm:h-28 bg-gradient-to-b from-gray-400/20 to-gray-400/5 rounded-t-lg border border-gray-400/20 relative flex items-end justify-center pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400/40">2nd</span>
                </div>
              </div>
            )}

            {/* 1st place */}
            <div className="flex flex-col items-center -mx-2 sm:mx-0">
              <div className="flex flex-col items-center gap-1.5 mb-2">
                <div className="flex items-center justify-center">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap px-1">
                  {podiumGroup.entries.map((entry) => (
                    <div key={entry.candidateId} className="flex flex-col items-center gap-1">
                      <UserAvatar src={entry.candidateAvatarUrl} name={entry.candidateUsername} size="xl" />
                      <span className="font-bold text-xs text-center leading-tight max-w-20 truncate">{entry.candidateUsername}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg sm:text-xl font-black text-primary">{podiumGroup.voteCount}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {podiumGroup.entries.length > 1 ? "ea" : "vote"}{podiumGroup.voteCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="w-24 sm:w-28 h-32 sm:h-36 bg-gradient-to-b from-yellow-400/20 to-yellow-400/5 rounded-t-lg border border-yellow-400/20 relative flex items-end justify-center pb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400/40">1st</span>
              </div>
            </div>

            {/* 3rd place */}
            {thirdGroup && (
              <div className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  {podiumIcons[2] && <span className="text-amber-700 [&_svg]:h-5 [&_svg]:w-5">{podiumIcons[2]}</span>}
                  <div className="flex items-center justify-center gap-2 flex-wrap px-1">
                    {thirdGroup.entries.map((entry) => (
                      <div key={entry.candidateId} className="flex flex-col items-center gap-1">
                        <UserAvatar src={entry.candidateAvatarUrl} name={entry.candidateUsername} size="md" />
                        <span className="font-semibold text-[10px] text-center leading-tight max-w-16 truncate">{entry.candidateUsername}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/60">{thirdGroup.voteCount}</span>
                </div>
                <div className="w-[72px] sm:w-20 h-[88px] sm:h-24 bg-gradient-to-b from-amber-700/20 to-amber-700/5 rounded-t-lg border border-amber-700/20 relative flex items-end justify-center pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700/40">3rd</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List (4th place and below) */}
      {listGroups.length > 0 && (
        <div className="p-5 space-y-3">
          {listGroups.map((group) => {
            const barWidth = maxVotes > 0 ? (group.voteCount / maxVotes) * 100 : 0;
            return (
              <div key={group.entries[0].candidateId} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-right text-xs font-mono text-muted-foreground/50 shrink-0">{group.rank}.</span>
                  <UserAvatar src={group.entries[0].candidateAvatarUrl} name={group.entries[0].candidateUsername} size="sm" />
                  <span className="flex-1 font-medium text-sm truncate">{group.entries[0].candidateUsername}</span>
                  <span className="text-sm font-mono text-muted-foreground tabular-nums shrink-0">
                    {group.voteCount}
                  </span>
                </div>
                <div className="h-2 bg-muted/60 rounded-full overflow-hidden ml-9">
                  <div
                    className="h-full rounded-full bg-primary/15"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Public vote breakdown */}
      {isPublic && question.votes.length > 0 && (
        <details className="group border-t border-border/30">
          <summary className="px-5 py-3.5 text-xs text-muted-foreground/60 cursor-pointer hover:text-foreground/80 transition-colors select-none list-none flex items-center gap-1.5">
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

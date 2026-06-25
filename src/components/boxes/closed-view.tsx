"use client";

import { useState } from "react";
import { advanceToRevealedAction } from "@/app/actions/box-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Lock,
  Trophy,
  AlertCircle,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BoxResults } from "@/lib/results";

interface ClosedViewProps {
  boxId: string;
  isOwner: boolean;
  results: BoxResults | null;
}

export function ClosedView({ boxId, isOwner, results }: ClosedViewProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReveal = async () => {
    if (
      !confirm(
        "Reveal results to all members? This cannot be undone."
      )
    ) {
      return;
    }
    setIsRevealing(true);
    setError(null);
    const result = await advanceToRevealedAction(boxId);
    if (result.error) {
      setError(result.error);
    }
    setIsRevealing(false);
  };

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Voting Closed</h2>
            <p className="text-muted-foreground text-center max-w-sm">
              Voting has ended. The owner will reveal the results when they&apos;re ready.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reveal button */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
        <div>
          <p className="text-sm font-medium">Results are ready to be revealed</p>
          <p className="text-xs text-muted-foreground">
            Only you can see this preview — members see &quot;Voting Closed&quot;
          </p>
        </div>
        <Button
          onClick={handleReveal}
          disabled={isRevealing}
          variant="default"
          size="sm"
          className="gap-1"
        >
          <Trophy className="h-3.5 w-3.5" />
          {isRevealing ? "Revealing..." : "Reveal Results"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results preview for owner */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Owner preview — {results.totalQuestions} question{results.totalQuestions !== 1 ? "s" : ""}, {results.totalMembers} member{results.totalMembers !== 1 ? "s" : ""}
          </div>

          {results.questions.map((q) => (
            <Card key={q.questionId} className="overflow-hidden">
              <CardHeader className="bg-muted/30 py-3">
                <CardTitle className="text-base">{q.questionText}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {q.tally.map((entry) => (
                  <div
                    key={entry.candidateId}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      entry.candidateUsername === q.winner?.candidateUsername
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-muted/20"
                    }`}
                  >
                    <Avatar className="h-7 w-7">
                      {entry.candidateAvatarUrl && (
                        <AvatarImage src={entry.candidateAvatarUrl} alt={entry.candidateUsername} />
                      )}
                      <AvatarFallback className="text-[10px] bg-secondary">
                        {entry.candidateUsername[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium flex-1">{entry.candidateUsername}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-primary/20 min-w-[40px] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${q.tally.length > 0 ? (entry.voteCount / Math.max(...q.tally.map(t => t.voteCount))) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-muted-foreground w-6 text-right">
                        {entry.voteCount}
                      </span>
                    </div>
                    {entry.candidateUsername === q.winner?.candidateUsername && (
                      <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </div>
                ))}

                {/* Individual vote breakdown */}
                {q.votes.length > 0 && (
                  <details className="group mt-2 border-t border-border/20 pt-2">
                    <summary className="text-xs text-muted-foreground/60 hover:text-foreground/80 cursor-pointer transition-colors select-none list-none flex items-center gap-1.5 py-1">
                      <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform" />
                      Who voted for whom ({q.votes.length} votes)
                    </summary>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {q.votes.map((vote, vi) => (
                        <div
                          key={vi}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30 text-[11px]"
                        >
                          <Avatar className="h-5 w-5">
                            {vote.voterAvatarUrl && <AvatarImage src={vote.voterAvatarUrl} />}
                            <AvatarFallback className="text-[8px] bg-secondary">
                              {vote.voterUsername[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground truncate">{vote.voterUsername}</span>
                          <span className="text-muted-foreground/30">&rarr;</span>
                          <Avatar className="h-5 w-5">
                            {vote.candidateAvatarUrl && <AvatarImage src={vote.candidateAvatarUrl} />}
                            <AvatarFallback className="text-[8px] bg-secondary">
                              {vote.candidateUsername[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate">{vote.candidateUsername}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

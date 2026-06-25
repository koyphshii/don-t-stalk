"use client";

import { useState } from "react";
import { submitVoteAction } from "@/app/actions/vote-actions";
import { closeVotingAction } from "@/app/actions/box-actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Loader2,
  SkipForward,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface LiveVotesData {
  questionId: string;
  questionText: string;
  visibility: "PUBLIC" | "PRIVATE";
  votes: Array<{
    voterUsername: string;
    voterAvatarUrl: string | null;
    candidateUsername: string;
    candidateAvatarUrl: string | null;
  }>;
}

interface VotingViewProps {
  boxId: string;
  questions: Array<{
    id: string;
    text: string;
    userVote: string | null;
    visibility: "PUBLIC" | "PRIVATE";
    allowSelfVote: boolean;
  }>;
  candidates: Array<{
    id: string;
    username: string;
    avatarUrl: string | null;
  }>;
  currentUserId: string;
  progress: {
    voted: number;
    total: number;
    votedQuestionIds: string[];
  };
  isOwner: boolean;
  liveVotes: LiveVotesData[] | null;
}

export function VotingView({
  boxId,
  questions,
  candidates,
  currentUserId,
  progress,
  isOwner,
  liveVotes,
}: VotingViewProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnvoted = questions.findIndex(
      (q) => !progress.votedQuestionIds.includes(q.id)
    );
    return firstUnvoted >= 0 ? firstUnvoted : 0;
  });
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.userVote) initial[q.id] = q.userVote;
    });
    return initial;
  });
  const [error, setError] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(() => {
    return questions.length > 0 && questions.every((q) => q.userVote);
  });

  const currentQuestion = questions[currentIndex];
  const votedCount = Object.keys(selections).length;
  const allVoted = questions.length > 0 && questions.every((q) => selections[q.id]);
  const progressPercent = questions.length > 0 ? (votedCount / questions.length) * 100 : 0;
  const isLast = currentIndex === questions.length - 1;

  const SKIP_VALUE = "__skip__";
  const filteredCandidates = candidates;

  const selectedCandidate = selections[currentQuestion?.id];

  const handleSelect = (candidateId: string) => {
    if (submitted) return;
    setError(null);
    setSelections((prev) => ({ ...prev, [currentQuestion.id]: candidateId }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDone = async () => {
    if (!allVoted || submitted) return;
    setIsSubmitting(true);
    setError(null);

    const entries = Object.entries(selections).filter(
      ([, cId]) => cId !== SKIP_VALUE
    );
    const results = await Promise.all(
      entries.map(([qId, cId]) => submitVoteAction(qId, cId))
    );

    const firstError = results.find((r) => r.error);
    if (firstError) {
      setError(firstError.error ?? "Failed to submit votes");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleEndVoting = async () => {
    if (
      !confirm(
        "End voting? Members won't be able to vote anymore. You can reveal results later."
      )
    ) {
      return;
    }
    setIsClosing(true);
    setCloseError(null);
    const result = await closeVotingAction(boxId);
    if (result.error) {
      setCloseError(result.error);
    }
    setIsClosing(false);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No questions with voting enabled yet.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        {isOwner && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div>
              <p className="text-sm font-medium">All votes are in</p>
              <p className="text-xs text-muted-foreground">
                End voting to close submissions and preview results.
              </p>
            </div>
            <Button
              onClick={handleEndVoting}
              disabled={isClosing}
              variant="default"
              size="sm"
              className="gap-1"
            >
              <Lock className="h-3.5 w-3.5" />
              {isClosing ? "Closing..." : "End Voting"}
            </Button>
          </div>
        )}

        {closeError && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {closeError}
          </div>
        )}

        {/* Owner live votes */}
        {isOwner && liveVotes && liveVotes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Live votes — who&apos;s voted so far
            </h3>
            {liveVotes.map((qv) => (
              <details key={qv.questionId} className="group rounded-lg border border-border/50 bg-muted/10">
                <summary className="px-4 py-2.5 text-sm font-medium cursor-pointer hover:bg-muted/20 transition-colors list-none flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform shrink-0 text-muted-foreground" />
                  <span className="truncate">{qv.questionText}</span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {qv.votes.length} vote{qv.votes.length !== 1 ? "s" : ""}
                  </span>
                </summary>
                <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {qv.votes.map((v, vi) => (
                    <div key={vi} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30 text-[11px]">
                      <Avatar className="h-5 w-5">
                        {v.voterAvatarUrl && <AvatarImage src={v.voterAvatarUrl} />}
                        <AvatarFallback className="text-[8px] bg-secondary">
                          {v.voterUsername[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground truncate">{v.voterUsername}</span>
                      <span className="text-muted-foreground/30">&rarr;</span>
                      <Avatar className="h-5 w-5">
                        {v.candidateAvatarUrl && <AvatarImage src={v.candidateAvatarUrl} />}
                        <AvatarFallback className="text-[8px] bg-secondary">
                          {v.candidateUsername[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{v.candidateUsername}</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="text-center py-8 px-6 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 mb-4">
            <Check className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">
            All votes locked in!
          </h2>
          <p className="text-muted-foreground">
            You answered all {questions.length} question{questions.length !== 1 ? "s" : ""}. Your choices are final.
          </p>
        </div>

        <div className="space-y-2">
          {questions.map((q, i) => {
            const votedId = selections[q.id];
            const candidate = candidates.find((c) => c.id === votedId);
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
              >
                <span className="text-xs text-muted-foreground/60 font-mono w-6 shrink-0">#{i + 1}</span>
                <p className="text-sm truncate flex-1">{q.text}</p>
                  {votedId === SKIP_VALUE ? (
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      <SkipForward className="h-4 w-4" />
                      <span className="text-sm font-medium">Skipped</span>
                    </div>
                  ) : candidate ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Avatar className="h-6 w-6">
                        {candidate.avatarUrl && (
                          <AvatarImage src={candidate.avatarUrl} alt={candidate.username} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {candidate.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{candidate.username}</span>
                    </div>
                  ) : null}
                  <Check className="h-4 w-4 text-primary shrink-0" />
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => router.push("/boxes")}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Back to Boxes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {votedCount === 0
              ? "Vote on each question"
              : `You've selected ${votedCount} of ${questions.length}`}
          </span>
          <span className="font-medium font-mono">
            {votedCount}/{questions.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {isOwner && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div>
            <p className="text-sm font-medium">Manage voting</p>
            <p className="text-xs text-muted-foreground">
              End voting when everyone has submitted.
            </p>
          </div>
          <Button
            onClick={handleEndVoting}
            disabled={isClosing}
            variant="default"
            size="sm"
            className="gap-1"
          >
            <Lock className="h-3.5 w-3.5" />
            {isClosing ? "Closing..." : "End Voting"}
          </Button>
        </div>
      )}

      {closeError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {closeError}
        </div>
      )}

      {currentQuestion && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {currentQuestion.visibility === "PUBLIC" ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    Public
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <EyeOff className="h-3 w-3" />
                    Anonymous
                  </span>
                )}
              </div>
              {selectedCandidate && (
                <span className="flex items-center gap-1 text-xs text-primary">
                  <Check className="h-3 w-3" />
                  Selected
                </span>
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl leading-relaxed mt-2">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20 p-4">
                <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground/60" />
                <p className="font-medium">No candidates available</p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Self-voting is disabled on this question. You need more members in the box to vote!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Skip option - always first */}
                  <button
                    onClick={() => handleSelect(SKIP_VALUE)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                      selectedCandidate === SKIP_VALUE
                        ? "border-muted-foreground/50 bg-muted/30"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
                      selectedCandidate === SKIP_VALUE
                        ? "bg-muted-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      <SkipForward className="h-4 w-4" />
                    </div>
                    <span className="text-sm truncate font-medium text-muted-foreground">Skip</span>
                    {selectedCandidate === SKIP_VALUE && <Check className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />}
                  </button>

                {filteredCandidates.map((candidate) => {
                  const isSelected = selectedCandidate === candidate.id;
                  const isSelf = candidate.id === currentUserId;
                  const selfDisabled = !currentQuestion?.allowSelfVote && isSelf;
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => !selfDisabled && handleSelect(candidate.id)}
                      disabled={selfDisabled}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                        selfDisabled
                          ? "border-border/30 bg-muted/20 opacity-40 cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {candidate.avatarUrl && (
                          <AvatarImage
                            src={candidate.avatarUrl}
                            alt={candidate.username}
                          />
                        )}
                        <AvatarFallback className={`text-xs ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                          {candidate.username[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm truncate font-medium">{candidate.username}</span>
                      {selfDisabled && <span className="text-[10px] text-muted-foreground shrink-0 ml-auto">You</span>}
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentIndex
                  ? "bg-primary w-4"
                  : selections[q.id]
                  ? "bg-primary/60"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <Button
            variant="default"
            size="sm"
            onClick={handleDone}
            disabled={!allVoted || isSubmitting}
            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Done
                <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!selectedCandidate}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

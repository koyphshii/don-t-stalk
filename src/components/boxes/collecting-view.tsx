"use client";

import { useActionState, useState, useEffect } from "react";
import { submitQuestionAction } from "@/app/actions/question-actions";
import { advanceToVotingAction, updateQuestionSettingsAction } from "@/app/actions/box-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Send, ChevronRight, AlertCircle, Eye, EyeOff, UserCheck, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

interface CollectingViewProps {
  boxId: string;
  questions: Array<{
    id: string;
    text: string;
    author: {
      id: string;
      username: string;
    };
    visibility: "PUBLIC" | "PRIVATE";
    allowSelfVote: boolean;
    votingEnabled: boolean;
    createdAt: Date;
  }>;
  isOwner: boolean;
}

export function CollectingView({
  boxId,
  questions,
  isOwner,
}: CollectingViewProps) {
  const router = useRouter();
  const [advanceError, setAdvanceError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [allowSelfVote, setAllowSelfVote] = useState(false);

  const boundSubmitQuestion = submitQuestionAction.bind(null, boxId);
  const [submitState, submitAction, isSubmitting] = useActionState(
    boundSubmitQuestion,
    {}
  );

  useEffect(() => {
    if (submitState.success) {
      const form = document.getElementById("question-form") as HTMLFormElement;
      form?.reset();
      setAllowSelfVote(false);
    }
  }, [submitState]);

  const handleAdvance = async () => {
    setIsAdvancing(true);
    setAdvanceError(null);
    const result = await advanceToVotingAction(boxId);
    if (result.error) {
      setAdvanceError(result.error);
    }
    setIsAdvancing(false);
  };

  const toggleQuestionVisibility = async (questionId: string, current: "PUBLIC" | "PRIVATE") => {
    const next = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    await updateQuestionSettingsAction(questionId, { visibility: next });
    router.refresh();
  };

  const toggleQuestionSelfVote = async (questionId: string, current: boolean) => {
    await updateQuestionSettingsAction(questionId, { allowSelfVote: !current });
    router.refresh();
  };

  const canAdvance = isOwner;

  return (
    <div className="space-y-6">
      {/* Question counter */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-muted p-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold">
              {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              question{questions.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            onClick={handleAdvance}
            disabled={!canAdvance || isAdvancing}
            className="gap-1"
          >
            {isAdvancing ? "Starting..." : "Start Voting"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {advanceError && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {advanceError}
        </div>
      )}

      {/* Submit question form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submit a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="question-form" action={submitAction} className="space-y-4">
            {submitState.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {submitState.error}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                name="text"
                placeholder="Who's most likely to..."
                required
                minLength={5}
                maxLength={300}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="submit-self-vote"
                checked={allowSelfVote}
                onCheckedChange={setAllowSelfVote}
                disabled={isSubmitting}
              />
              <Label htmlFor="submit-self-vote" className="text-xs text-muted-foreground cursor-pointer">
                Allow self-voting on this question
              </Label>
            </div>
            <input type="hidden" name="allowSelfVote" value={allowSelfVote ? "true" : "false"} />
          </form>
        </CardContent>
      </Card>

      {/* Questions list */}
      {questions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Submitted Questions
          </h3>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border transition-colors"
              >
                <span className="text-sm text-muted-foreground font-mono mt-0.5 shrink-0">
                  {i + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      by {q.author.username}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {q.allowSelfVote ? (
                        <><UserCheck className="h-3 w-3 text-emerald-500" /> Self-vote allowed</>
                      ) : (
                        <><UserX className="h-3 w-3 text-rose-500" /> Self-vote blocked</>
                      )}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleQuestionVisibility(q.id, q.visibility)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      title={q.visibility === "PUBLIC" ? "Public results" : "Private results"}
                    >
                      {q.visibility === "PUBLIC" ? (
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                    
                    <div className="flex items-center gap-1.5 pl-1.5 border-l border-border">
                      <Label htmlFor={`selfvote-list-${q.id}`} className="text-xs text-muted-foreground cursor-pointer">
                        Self-vote
                      </Label>
                      <Switch
                        id={`selfvote-list-${q.id}`}
                        checked={q.allowSelfVote}
                        onCheckedChange={() => toggleQuestionSelfVote(q.id, q.allowSelfVote)}
                        className="scale-75 origin-right"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

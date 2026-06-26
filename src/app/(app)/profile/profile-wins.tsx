"use client";

import { useState } from "react";
import { Trophy, Crown, Loader2, ChevronDown, ExternalLink } from "lucide-react";
import { getUserWinDetails } from "@/app/actions/user-actions";
import type { WinDetail } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";

export function ProfileWins({
  userId,
  initialWinCount,
}: {
  userId: string;
  initialWinCount: number;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wins, setWins] = useState<WinDetail[] | null>(null);

  const handleClick = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (wins === null) {
      setLoading(true);
      const data = await getUserWinDetails(userId);
      setWins(data);
      setLoading(false);
    }
    setExpanded(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-center hover:bg-yellow-400/15 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-center gap-0.5">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <p className="text-2xl font-display font-bold text-yellow-400">
            {initialWinCount}
          </p>
          <ChevronDown
            className={`h-3 w-3 text-yellow-400/60 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
        <p className="text-xs text-yellow-400/70">Wins</p>
      </button>

      {expanded && (
        <div className="col-span-4 space-y-1.5">
          {loading ? (
            <div className="flex items-center gap-2 py-3 px-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading wins...
            </div>
          ) : wins && wins.length > 0 ? (
            wins.map((w) => (
              <div
                key={w.questionId}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/20 border border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/boxes/${w.boxId}`)}
              >
                <Crown className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{w.questionText}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{w.boxTitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-yellow-400">{w.userVoteCount}</p>
                  <p className="text-[10px] text-muted-foreground">of {w.totalVotes} votes</p>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-3 px-3 italic">No wins yet</p>
          )}
        </div>
      )}
    </>
  );
}

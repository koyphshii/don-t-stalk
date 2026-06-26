"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  BoxIcon,
  Trophy,
  Crown,
  Loader2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { getUserWinDetails } from "@/app/actions/user-actions";
import type { WinDetail } from "@/app/actions/user-actions";
import { useRouter } from "next/navigation";

interface MemberData {
  id: string;
  username: string;
  avatarUrl: string | null;
  discordId: string | null;
  isYou: boolean;
  ownedBoxes: number;
  questions: number;
  memberships: number;
  wins: number;
}

export function MembersList({ members }: { members: MemberData[] }) {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function MemberCard({ member }: { member: MemberData }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wins, setWins] = useState<WinDetail[] | null>(null);

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (wins === null) {
      setLoading(true);
      const data = await getUserWinDetails(member.id);
      setWins(data);
      setLoading(false);
    }
    setExpanded(true);
  };

  return (
    <div>
      <Card
        className="hover:border-primary/50 transition-colors cursor-pointer"
        onClick={handleToggle}
      >
        <CardHeader className="flex flex-row items-center gap-3 py-3 px-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={member.avatarUrl || undefined} />
            <AvatarFallback className="text-sm bg-secondary text-muted-foreground">
              {member.username[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">
                {member.username}
              </span>
              {member.discordId && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-[#5865F2] border-[#5865F2]/30">
                  Discord
                </Badge>
              )}
              {member.isYou && (
                <span className="text-[11px] text-muted-foreground">(you)</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <BoxIcon className="h-3 w-3" />
                {member.ownedBoxes} boxes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {member.questions} questions
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {member.memberships} memberships
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">{member.wins}</span>
              <span className="text-[10px] text-muted-foreground">wins</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground/50 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </CardHeader>
      </Card>

      {expanded && (
        <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-1.5 mt-1 mb-3">
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
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/boxes/${w.boxId}`);
                }}
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
    </div>
  );
}

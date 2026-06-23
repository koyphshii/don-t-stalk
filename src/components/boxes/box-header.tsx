"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { banMemberAction } from "@/app/actions/box-actions";
import {
  Copy,
  Check,
  Users,
  Crown,
  Link as LinkIcon,
  Ban,
  Shield,
} from "lucide-react";
import { useState, useTransition } from "react";

interface BoxHeaderProps {
  box: {
    id: string;
    title: string;
    status: "COLLECTING" | "VOTING" | "CLOSED" | "REVEALED";
    inviteToken: string;
    isOwner: boolean;
    members: Array<{
      user: {
        id: string;
        username: string;
        avatarUrl: string | null;
        discordId: string | null;
      };
    }>;
    owner: {
      id: string;
      username: string;
    };
  };
}

const statusConfig: Record<string, { variant: "collecting" | "voting" | "revealed"; label: string }> = {
  COLLECTING: { variant: "collecting" as const, label: "Collecting Questions" },
  VOTING: { variant: "voting" as const, label: "Voting Open" },
  CLOSED: { variant: "voting" as const, label: "Voting Closed" },
  REVEALED: { variant: "revealed" as const, label: "Results Ready" },
};

export function BoxHeader({ box }: BoxHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/boxes/${box.id}/join?token=${box.inviteToken}`
      : "";

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBan = (userId: string) => {
    startTransition(async () => {
      await banMemberAction(box.id, userId);
    });
  };

  const status = statusConfig[box.status];

  return (
    <div className="mb-8 space-y-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold truncate">
            {box.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Crown className="h-3 w-3" />
              {box.owner.username}
            </span>
          </div>
        </div>

        {box.status === "COLLECTING" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={copyInvite}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Invite Link"}
            </span>
            <LinkIcon className="h-3.5 w-3.5 sm:hidden" />
          </Button>
        )}
      </div>

      {/* Members row */}
      <div>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Users className="h-4 w-4" />
          <span>
            {box.members.length} member{box.members.length !== 1 ? "s" : ""}
          </span>
          <div className="flex -space-x-2">
            {box.members.slice(0, 5).map((m) => (
              <Avatar key={m.user.id} className="h-6 w-6 border-2 border-background">
                {m.user.avatarUrl && (
                  <AvatarImage src={m.user.avatarUrl} alt={m.user.username} />
                )}
                <AvatarFallback className="text-[10px] bg-secondary">
                  {m.user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {box.members.length > 5 && (
              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                +{box.members.length - 5}
              </div>
            )}
          </div>
        </button>

        {showMembers && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-2">
            {box.members.map((m) => (
              <div
                key={m.user.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0">
                    {m.user.avatarUrl && (
                      <AvatarImage src={m.user.avatarUrl} alt={m.user.username} />
                    )}
                    <AvatarFallback className="text-[10px] bg-secondary">
                      {m.user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {m.user.username}
                    {m.user.id === box.owner.id && (
                      <Crown className="inline h-3 w-3 ml-1 text-primary" />
                    )}
                  </span>
                  {m.user.discordId && (
                    <Shield className="inline h-3 w-3 ml-1 text-[#5865F2]" />
                  )}
                </div>
                {box.isOwner && m.user.id !== box.owner.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive/70 hover:text-destructive"
                    onClick={() => handleBan(m.user.id)}
                    disabled={isPending}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

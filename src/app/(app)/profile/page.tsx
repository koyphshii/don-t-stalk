import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Shield } from "lucide-react";
import { AvatarForm } from "./avatar-form";
import { ProfileWins } from "./profile-wins";

async function updateAvatarAction(formData: FormData): Promise<string | null> {
  "use server";
  const session = await requireAuth();
  const url = formData.get("avatarUrl") as string;
  if (!url || !url.startsWith("https://")) {
    return "Avatar URL must start with https://";
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl: url },
  });
  return null;
}

export default async function ProfilePage() {
  const session = await requireAuth();

  const [user, questions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            memberships: true,
            questions: true,
            votesGiven: true,
          },
        },
      },
    }),
    prisma.question.findMany({
      where: {
        votingEnabled: true,
        box: { status: { in: ["CLOSED", "REVEALED"] } },
      },
      include: {
        _count: { select: { votes: true } },
        votes: { select: { candidateId: true } },
      },
    }),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  let winCount = 0;
  for (const q of questions) {
    const tally = new Map<string, number>();
    for (const v of q.votes) {
      tally.set(v.candidateId, (tally.get(v.candidateId) || 0) + 1);
    }
    const maxVotes = Math.max(...tally.values(), 0);
    if (maxVotes === 0) continue;
    for (const [candidateId, count] of tally) {
      if (count === maxVotes) {
        if (candidateId === user.id) winCount++;
      }
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8">Profile</h1>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {user.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">{user.username}</CardTitle>
          <CardDescription className="flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
          {user.discordId && (
            <div className="flex items-center justify-center gap-1 text-xs text-[#5865F2] mt-1">
              <Shield className="h-3 w-3" />
              Discord connected
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-display font-bold">
                {user._count.memberships}
              </p>
              <p className="text-xs text-muted-foreground">Boxes</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-display font-bold">
                {user._count.questions}
              </p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-display font-bold">
                {user._count.votesGiven}
              </p>
              <p className="text-xs text-muted-foreground">Votes Cast</p>
            </div>
            <ProfileWins userId={user.id} initialWinCount={winCount} />
          </div>

          <AvatarForm currentAvatar={user.avatarUrl} updateAvatarAction={updateAvatarAction} />
        </CardContent>
      </Card>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MembersList } from "./members-list";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [members, questions] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        discordId: true,
        _count: {
          select: {
            ownedBoxes: true,
            questions: true,
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
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

  // Compute win counts per user across all questions
  const winCounts: Record<string, number> = {};
  for (const q of questions) {
    const tally = new Map<string, number>();
    for (const v of q.votes) {
      tally.set(v.candidateId, (tally.get(v.candidateId) || 0) + 1);
    }
    const maxVotes = Math.max(...tally.values(), 0);
    if (maxVotes === 0) continue;
    for (const [candidateId, count] of tally) {
      if (count === maxVotes) {
        winCounts[candidateId] = (winCounts[candidateId] || 0) + 1;
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Members</h1>
        <p className="text-muted-foreground mt-1">
          All registered members — {members.length} total
        </p>
      </div>

      <MembersList
        members={members.map((m) => ({
          id: m.id,
          username: m.username,
          avatarUrl: m.avatarUrl,
          discordId: m.discordId,
          isYou: m.id === session.user.id,
          ownedBoxes: m._count.ownedBoxes,
          questions: m._count.questions,
          memberships: m._count.memberships,
          wins: winCounts[m.id] || 0,
        }))}
      />
    </div>
  );
}

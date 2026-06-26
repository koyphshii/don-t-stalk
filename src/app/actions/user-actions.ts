"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type WinDetail = {
  questionId: string;
  questionText: string;
  boxTitle: string;
  boxId: string;
  userVoteCount: number;
  totalVotes: number;
  placement: number;
};

export async function getUserWinDetails(userId: string): Promise<WinDetail[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const questions = await prisma.question.findMany({
    where: {
      votingEnabled: true,
      box: { status: { in: ["CLOSED", "REVEALED"] } },
      votes: { some: {} },
    },
    include: {
      votes: {
        include: {
          candidate: { select: { id: true } },
        },
      },
      box: { select: { title: true, id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const wins: WinDetail[] = [];

  for (const q of questions) {
    const tally = new Map<string, number>();
    for (const v of q.votes) {
      tally.set(v.candidateId, (tally.get(v.candidateId) || 0) + 1);
    }

    const sorted = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) continue;

    const maxVotes = sorted[0][1];
    const winners = sorted.filter(([, count]) => count === maxVotes).map(([id]) => id);
    if (!winners.includes(userId)) continue;

    const userVoteCount = tally.get(userId) ?? 0;
    const totalVotes = q.votes.length;
    const placement = winners.length > 1 ? "T-1" : 1;

    wins.push({
      questionId: q.id,
      questionText: q.text,
      boxTitle: q.box.title,
      boxId: q.box.id,
      userVoteCount,
      totalVotes,
      placement: typeof placement === "number" ? placement : 1,
    });
  }

  return wins;
}

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { BoxStatus } from "@prisma/client";

export type VoteActionResult = {
  error?: string;
  success?: boolean;
};

export async function submitVoteAction(
  questionId: string,
  candidateId: string
): Promise<VoteActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const voterId = session.user.id;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      box: {
        include: {
          members: {
            select: { userId: true },
          },
        },
      },
    },
  });

  if (!question) {
    return { error: "Question not found" };
  }

  if (question.box.status !== BoxStatus.VOTING) {
    return { error: "This box is not in voting mode" };
  }

  if (!question.votingEnabled) {
    return { error: "Voting is not enabled for this question" };
  }

  const voterIsMember = question.box.members.some(
    (m) => m.userId === voterId
  );
  if (!voterIsMember) {
    return { error: "You must be a member of this box to vote" };
  }

  if (!question.allowSelfVote && voterId === candidateId) {
    return { error: "Self-voting is not allowed for this question" };
  }

  const existingVote = await prisma.vote.findUnique({
    where: {
      questionId_voterId: {
        questionId,
        voterId,
      },
    },
  });

  if (existingVote) {
    await prisma.vote.update({
      where: { id: existingVote.id },
      data: { candidateId },
    });

    revalidatePath(`/boxes/${question.boxId}`);
    return { success: true };
  }

  try {
    await prisma.vote.create({
      data: {
        questionId,
        voterId,
        candidateId,
      },
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { error: "You have already voted on this question" };
    }
    throw error;
  }

  revalidatePath(`/boxes/${question.boxId}`);
  return { success: true };
}

export async function getVotingProgress(
  boxId: string
): Promise<{
  voted: number;
  total: number;
  votedQuestionIds: string[];
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [totalQuestions, userVotes] = await Promise.all([
    prisma.question.count({ where: { boxId, votingEnabled: true } }),
    prisma.vote.findMany({
      where: {
        question: { boxId, votingEnabled: true },
        voterId: session.user.id,
      },
      select: { questionId: true },
    }),
  ]);

  return {
    voted: userVotes.length,
    total: totalQuestions,
    votedQuestionIds: userVotes.map((v) => v.questionId),
  };
}

export async function getQuestionsForVoting(boxId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) return null;

  const questions = await prisma.question.findMany({
    where: { boxId, votingEnabled: true },
    include: {
      votes: {
        where: { voterId: session.user.id },
        select: { candidateId: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const box = await prisma.box.findUnique({
    where: { id: boxId },
    select: { id: true },
  });

  if (!box) return null;

  const candidates = await prisma.user.findMany({
    select: { id: true, username: true, avatarUrl: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    questions: questions.map((q) => ({
      id: q.id,
      text: q.text,
      userVote: q.votes[0]?.candidateId || null,
      visibility: q.visibility,
      allowSelfVote: q.allowSelfVote,
    })),
    candidates,
    currentUserId: session.user.id,
  };
}

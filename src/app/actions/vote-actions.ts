"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { BoxStatus } from "@prisma/client";
import type { BoxResults } from "@/lib/results";

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

export async function deleteVoteAction(
  questionId: string
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
        select: { status: true, id: true },
      },
    },
  });

  if (!question) {
    return { error: "Question not found" };
  }

  if (question.box.status !== BoxStatus.VOTING) {
    return { error: "This box is not in voting mode" };
  }

  try {
    await prisma.vote.delete({
      where: {
        questionId_voterId: {
          questionId,
          voterId,
        },
      },
    });
  } catch {
    return { error: "No vote to delete" };
  }

  revalidatePath(`/boxes/${question.box.id}`);
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

export async function getCurrentVotesForOwner(boxId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const box = await prisma.box.findUnique({
    where: { id: boxId },
    select: { ownerId: true },
  });

  if (!box || box.ownerId !== session.user.id) return null;

  const questions = await prisma.question.findMany({
    where: { boxId, votingEnabled: true },
    include: {
      votes: {
        include: {
          voter: { select: { username: true, avatarUrl: true } },
          candidate: { select: { username: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return questions.map((q) => ({
    questionId: q.id,
    questionText: q.text,
    visibility: q.visibility,
    votes: q.votes.map((v) => ({
      voterUsername: v.voter.username,
      voterAvatarUrl: v.voter.avatarUrl,
      candidateUsername: v.candidate.username,
      candidateAvatarUrl: v.candidate.avatarUrl,
    })),
  }));
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

export async function getPreviewResultsAction(boxId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const box = await prisma.box.findUnique({
    where: { id: boxId },
    select: { ownerId: true, title: true },
  });

  if (!box || box.ownerId !== session.user.id) return null;

  const [questions, memberCount] = await Promise.all([
    prisma.question.findMany({
      where: { boxId, votingEnabled: true },
      include: {
        votes: {
          include: {
            voter: { select: { username: true, avatarUrl: true } },
            candidate: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.boxMember.count({ where: { boxId } }),
  ]);

  const buildTally = (
    votes: Array<{
      candidate: { id: string; username: string; avatarUrl: string | null };
    }>
  ) => {
    const map = new Map<
      string,
      {
        candidateId: string;
        candidateUsername: string;
        candidateAvatarUrl: string | null;
        voteCount: number;
      }
    >();
    for (const v of votes) {
      const existing = map.get(v.candidate.id);
      if (existing) {
        existing.voteCount++;
      } else {
        map.set(v.candidate.id, {
          candidateId: v.candidate.id,
          candidateUsername: v.candidate.username,
          candidateAvatarUrl: v.candidate.avatarUrl,
          voteCount: 1,
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => b.voteCount - a.voteCount
    );
  };

  return {
    boxTitle: box.title,
    totalQuestions: questions.length,
    totalMembers: memberCount,
    questions: questions.map((q) => {
      const tally = buildTally(q.votes);
      return {
        questionId: q.id,
        questionText: q.text,
        visibility: q.visibility,
        votes: q.votes.map((v) => ({
          voterUsername: v.voter.username,
          voterAvatarUrl: v.voter.avatarUrl,
          candidateUsername: v.candidate.username,
          candidateAvatarUrl: v.candidate.avatarUrl,
        })),
        tally,
        winner: tally[0] || null,
      };
    }),
  } satisfies BoxResults;
}

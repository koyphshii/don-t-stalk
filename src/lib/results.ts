import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type PublicQuestionResult = {
  questionId: string;
  questionText: string;
  votes: Array<{
    voterUsername: string;
    voterAvatarUrl: string | null;
    candidateUsername: string;
    candidateAvatarUrl: string | null;
  }>;
  tally: Array<{
    candidateId: string;
    candidateUsername: string;
    candidateAvatarUrl: string | null;
    voteCount: number;
  }>;
  winner: {
    candidateUsername: string;
    candidateAvatarUrl: string | null;
    voteCount: number;
  } | null;
};

export type PrivateQuestionResult = {
  questionId: string;
  questionText: string;
  tally: Array<{
    candidateId: string;
    candidateUsername: string;
    candidateAvatarUrl: string | null;
    voteCount: number;
  }>;
  winner: {
    candidateUsername: string;
    candidateAvatarUrl: string | null;
    voteCount: number;
  } | null;
};

export type BoxResults = {
  boxTitle: string;
  totalMembers: number;
  totalQuestions: number;
  questions: PublicQuestionResult[] | PrivateQuestionResult[];
};

export async function getResultsForBox(
  boxId: string
): Promise<BoxResults | null> {
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

  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      _count: { select: { members: true } },
      questions: {
        include: {
          votes: {
            include: {
              voter: {
                select: { username: true, avatarUrl: true },
              },
              candidate: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!box || box.status !== "REVEALED") return null;

  const buildTally = (
    votes: Array<{
      candidate: { id: string; username: string; avatarUrl: string | null };
    }>
  ) => {
    const tallyMap = new Map<
      string,
      {
        candidateId: string;
        candidateUsername: string;
        candidateAvatarUrl: string | null;
        voteCount: number;
      }
    >();

    for (const vote of votes) {
      const existing = tallyMap.get(vote.candidate.id);
      if (existing) {
        existing.voteCount++;
      } else {
        tallyMap.set(vote.candidate.id, {
          candidateId: vote.candidate.id,
          candidateUsername: vote.candidate.username,
          candidateAvatarUrl: vote.candidate.avatarUrl,
          voteCount: 1,
        });
      }
    }

    return Array.from(tallyMap.values()).sort(
      (a, b) => b.voteCount - a.voteCount
    );
  };

  const questions = box.questions.map((q) => {
    const tally = buildTally(q.votes);
    if (q.visibility === "PUBLIC") {
      const publicResult: PublicQuestionResult = {
        questionId: q.id,
        questionText: q.text,
        votes: q.votes.map((v) => ({
          voterUsername: v.voter.username,
          voterAvatarUrl: v.voter.avatarUrl,
          candidateUsername: v.candidate.username,
          candidateAvatarUrl: v.candidate.avatarUrl,
        })),
        tally,
        winner: tally[0] || null,
      };
      return publicResult;
    } else {
      const privateResult: PrivateQuestionResult = {
        questionId: q.id,
        questionText: q.text,
        tally,
        winner: tally[0] || null,
      };
      return privateResult;
    }
  });

  return {
    boxTitle: box.title,
    totalMembers: box._count.members,
    totalQuestions: box.questions.length,
    questions,
  };
}

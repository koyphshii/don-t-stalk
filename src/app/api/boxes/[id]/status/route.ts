import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { BoxStatus } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: boxId } = await params;

  // Verify membership
  const membership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const [box, questionCount, memberCount] = await Promise.all([
    prisma.box.findUnique({
      where: { id: boxId },
      select: { status: true },
    }),
    prisma.question.count({ where: { boxId } }),
    prisma.boxMember.count({ where: { boxId } }),
  ]);

  if (!box) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get voting progress if in VOTING status
  let votingProgress = null;
  if (box.status === BoxStatus.VOTING) {
    const [totalQuestions, userVotes] = await Promise.all([
      prisma.question.count({ where: { boxId } }),
      prisma.vote.count({
        where: {
          question: { boxId },
          voterId: session.user.id,
        },
      }),
    ]);
    votingProgress = {
      voted: userVotes,
      total: totalQuestions,
    };
  }

  return NextResponse.json({
    status: box.status,
    questionCount,
    memberCount,
    votingProgress,
  });
}

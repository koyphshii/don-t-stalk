"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { BoxStatus } from "@prisma/client";

const questionSchema = z.object({
  text: z
    .string()
    .min(5, "Question must be at least 5 characters")
    .max(300, "Question must be under 300 characters"),
});

export type QuestionActionResult = {
  error?: string;
  success?: boolean;
};

export async function submitQuestionAction(
  boxId: string,
  _prevState: QuestionActionResult,
  formData: FormData
): Promise<QuestionActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const raw = {
    text: formData.get("text") as string,
  };

  const parsed = questionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  if (box.status !== BoxStatus.COLLECTING) {
    return { error: "This box is no longer accepting questions" };
  }

  const membership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) {
    return { error: "You must be a member of this box" };
  }

  const allowSelfVote = formData.get("allowSelfVote") === "true";

  await prisma.question.create({
    data: {
      boxId,
      authorId: session.user.id,
      text: parsed.data.text,
      allowSelfVote,
    },
  });

  revalidatePath(`/boxes/${boxId}`);
  return { success: true };
}

export async function getBoxQuestions(boxId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) return [];

  const questions = await prisma.question.findMany({
    where: { boxId },
    include: {
      author: {
        select: { id: true, username: true, avatarUrl: true },
      },
      _count: {
        select: { votes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return questions.map((q) => ({
    id: q.id,
    boxId: q.boxId,
    authorId: q.authorId,
    text: q.text,
    visibility: q.visibility,
    allowSelfVote: q.allowSelfVote,
    votingEnabled: q.votingEnabled,
    createdAt: q.createdAt,
    author: q.author,
    _count: q._count,
  }));
}

export async function getQuestionCount(boxId: string): Promise<number> {
  return prisma.question.count({ where: { boxId } });
}

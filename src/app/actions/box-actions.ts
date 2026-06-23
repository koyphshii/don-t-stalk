"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BoxStatus, Prisma } from "@prisma/client";

const createBoxSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be under 100 characters"),
});

export type BoxActionResult = {
  error?: string;
  success?: boolean;
  boxId?: string;
};

export async function createBoxAction(
  _prevState: BoxActionResult,
  formData: FormData
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const raw = {
    title: formData.get("title") as string,
  };

  const parsed = createBoxSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { title } = parsed.data;

  const box = await prisma.box.create({
    data: {
      title,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
        },
      },
    },
  });

  redirect(`/boxes/${box.id}`);
}

export async function advanceToVotingAction(
  boxId: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
    include: {
      _count: { select: { questions: true } },
    },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  if (box.ownerId !== session.user.id) {
    return { error: "Only the box owner can advance the status" };
  }

  if (box.status !== BoxStatus.COLLECTING) {
    return { error: "Box is not in COLLECTING status" };
  }



  await prisma.$transaction([
    prisma.box.update({
      where: { id: boxId },
      data: {
        status: BoxStatus.VOTING,
        votingStartedAt: new Date(),
      },
    }),
    prisma.question.updateMany({
      where: { boxId },
      data: { votingEnabled: true },
    }),
  ]);

  revalidatePath(`/boxes/${boxId}`);
  return { success: true };
}

export async function advanceToRevealedAction(
  boxId: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  if (box.ownerId !== session.user.id) {
    return { error: "Only the box owner can reveal results" };
  }

  if (box.status !== BoxStatus.VOTING) {
    return { error: "Box is not in VOTING status" };
  }

  await prisma.box.update({
    where: { id: boxId },
    data: {
      status: BoxStatus.REVEALED,
      revealedAt: new Date(),
    },
  });

  revalidatePath(`/boxes/${boxId}`);
  return { success: true };
}

export async function joinBoxAction(
  inviteToken: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { inviteToken },
  });

  if (!box) {
    return { error: "Invalid invite link" };
  }

  const banned = await prisma.bannedMember.findUnique({
    where: {
      boxId_userId: {
        boxId: box.id,
        userId: session.user.id,
      },
    },
  });

  if (banned) {
    return { error: "You have been banned from this box" };
  }

  // Check if already a member
  const existingMembership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId: box.id,
        userId: session.user.id,
      },
    },
  });

  if (existingMembership) {
    redirect(`/boxes/${box.id}`);
  }

  try {
    await prisma.boxMember.create({
      data: {
        boxId: box.id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  revalidatePath(`/boxes/${box.id}`);
  redirect(`/boxes/${box.id}`);
}

export async function publicJoinBoxAction(
  boxId: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  const banned = await prisma.bannedMember.findUnique({
    where: {
      boxId_userId: {
        boxId: box.id,
        userId: session.user.id,
      },
    },
  });

  if (banned) {
    return { error: "You have been banned from this box" };
  }

  const existingMembership = await prisma.boxMember.findUnique({
    where: {
      boxId_userId: {
        boxId: box.id,
        userId: session.user.id,
      },
    },
  });

  if (existingMembership) {
    return { error: "Already a member" };
  }

  try {
    await prisma.boxMember.create({
      data: {
        boxId: box.id,
        userId: session.user.id,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
      throw error;
    }
  }

  revalidatePath("/boxes");
  redirect(`/boxes/${box.id}`);
}

export async function banMemberAction(
  boxId: string,
  userId: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  if (box.ownerId !== session.user.id) {
    return { error: "Only the box owner can ban members" };
  }

  if (userId === box.ownerId) {
    return { error: "Cannot ban yourself" };
  }

  // Remove from members if they're a member
  await prisma.boxMember.deleteMany({
    where: {
      boxId,
      userId,
    },
  });

  // Add to banned list
  await prisma.bannedMember.upsert({
    where: {
      boxId_userId: { boxId, userId },
    },
    create: { boxId, userId },
    update: {},
  });

  revalidatePath(`/boxes/${boxId}`);
  return { success: true };
}

export async function unbanMemberAction(
  boxId: string,
  userId: string
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const box = await prisma.box.findUnique({
    where: { id: boxId },
  });

  if (!box) {
    return { error: "Box not found" };
  }

  if (box.ownerId !== session.user.id) {
    return { error: "Only the box owner can unban members" };
  }

  await prisma.bannedMember.deleteMany({
    where: {
      boxId,
      userId,
    },
  });

  revalidatePath(`/boxes/${boxId}`);
  return { success: true };
}

export async function updateQuestionSettingsAction(
  questionId: string,
  data: {
    visibility?: "PUBLIC" | "PRIVATE";
    allowSelfVote?: boolean;
    votingEnabled?: boolean;
  }
): Promise<BoxActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { box: true },
  });

  if (!question) {
    return { error: "Question not found" };
  }

  if (question.box.ownerId !== session.user.id) {
    return { error: "Only the box owner can change question settings" };
  }

  if (question.box.status === "REVEALED") {
    return { error: "Cannot change settings after results are revealed" };
  }

  await prisma.question.update({
    where: { id: questionId },
    data,
  });

  revalidatePath(`/boxes/${question.boxId}`);
  return { success: true };
}

export async function getBoxWithDetails(boxId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [box, membership, userBan] = await Promise.all([
    prisma.box.findUnique({
      where: { id: boxId },
      include: {
        owner: {
          select: { id: true, username: true, avatarUrl: true, discordId: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, avatarUrl: true, discordId: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { questions: true },
        },
      },
    }),
    prisma.boxMember.findUnique({
      where: {
        boxId_userId: {
          boxId,
          userId: session.user.id,
        },
      },
    }),
    prisma.bannedMember.findUnique({
      where: {
        boxId_userId: {
          boxId,
          userId: session.user.id,
        },
      },
    }),
  ]);

  if (!box) return null;

  const isMember = !!membership;
  const isOwner = box.ownerId === session.user.id;
  const isBanned = !!userBan;

  return {
    id: box.id,
    title: box.title,
    status: box.status,
    inviteToken: box.inviteToken,
    createdAt: box.createdAt,
    votingStartedAt: box.votingStartedAt,
    revealedAt: box.revealedAt,
    owner: box.owner,
    members: box.members,
    bannedMembers: [] as Array<{
      userId: string;
      boxId: string;
      bannedAt: Date;
      user: {
        id: string;
        username: string;
        avatarUrl: string | null;
        discordId: string | null;
      };
    }>,
    _count: box._count,
    isMember,
    isOwner,
    isBanned,
    currentUserId: session.user.id,
  };
}

export async function getUserBoxes() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const memberships = await prisma.boxMember.findMany({
    where: { userId: session.user.id },
    include: {
      box: {
        include: {
          owner: {
            select: { id: true, username: true },
          },
          _count: {
            select: { questions: true, members: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    ...m.box,
    isOwner: m.box.ownerId === session.user.id,
  }));
}

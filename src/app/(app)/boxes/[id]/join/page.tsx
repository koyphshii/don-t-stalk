import { JoinForm } from "@/components/boxes/join-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

interface JoinPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
  const { id } = await params;
  const { token } = await searchParams;
  const session = await auth();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Invite Link</h2>
            <p className="text-muted-foreground">
              This invite link is missing a token.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session?.user) {
    redirect(`/login?callbackUrl=/boxes/${id}/join?token=${token}`);
  }

  // Find the box
  const box = await prisma.box.findUnique({
    where: { inviteToken: token },
    include: {
      owner: { select: { username: true } },
      _count: { select: { members: true } },
    },
  });

  if (!box || box.id !== id) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold mb-2">Invalid Invite</h2>
            <p className="text-muted-foreground">
              This invite link is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
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

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-primary/10 p-4 mb-2">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">You&apos;re Invited!</CardTitle>
          <CardDescription>
            <strong>{box.owner.username}</strong> invited you to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold">{box.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {box._count.members} member{box._count.members !== 1 ? "s" : ""}{" "}
              already joined
            </p>
          </div>

          <JoinForm token={token} />

          <p className="text-xs text-center text-muted-foreground">
            By joining, you&apos;ll be able to submit questions and vote on
            who&apos;s most likely to do them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MessageSquare, Crown, LogIn } from "lucide-react";
import { publicJoinBoxAction } from "@/app/actions/box-actions";

const statusVariantMap = {
  COLLECTING: "collecting" as const,
  VOTING: "voting" as const,
  REVEALED: "revealed" as const,
};

const statusLabelMap = {
  COLLECTING: "Collecting Questions",
  VOTING: "Voting",
  REVEALED: "Results Ready",
};

export default async function BoxesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const userMemberships = userId
    ? new Set(
        (await prisma.boxMember.findMany({
          where: { userId },
          select: { boxId: true },
        })).map((m) => m.boxId)
      )
    : new Set<string>();

  const boxes = await prisma.box.findMany({
    include: {
      owner: {
        select: { id: true, username: true },
      },
      _count: {
        select: { questions: true, members: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Boxes</h1>
          <p className="text-muted-foreground mt-1">
            All boxes — join any and start voting
          </p>
        </div>
        <Link href="/boxes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Box
          </Button>
        </Link>
      </div>

      {boxes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No boxes yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create the first box to start collecting &quot;most likely
              to&quot; questions.
            </p>
            <Link href="/boxes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Box
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {boxes.map((box) => {
            const isOwner = box.ownerId === userId;
            const isMember = userMemberships.has(box.id);
            return (
              <Card key={box.id} className="h-full flex flex-col">
                <Link href={isMember ? `/boxes/${box.id}` : "#"} className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {box.title}
                      </CardTitle>
                      <Badge variant={statusVariantMap[box.status]}>
                        {statusLabelMap[box.status]}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                      <Crown className="h-3 w-3" />
                      {box.owner.username}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {box._count.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {box._count.questions} questions
                      </span>
                    </div>
                  </CardContent>
                </Link>
                <div className="px-6 pb-4 pt-0">
                  {isOwner ? (
                    <Link href={`/boxes/${box.id}`}>
                      <Button size="sm" className="w-full gap-1.5">
                        <Crown className="h-3.5 w-3.5" />
                        Manage
                      </Button>
                    </Link>
                  ) : isMember ? (
                    <Link href={`/boxes/${box.id}`}>
                      <Button size="sm" variant="outline" className="w-full gap-1.5">
                        <LogIn className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                  ) : (
                    <form action={publicJoinBoxAction.bind(null, box.id) as unknown as (formData: FormData) => void}>
                      <Button type="submit" size="sm" variant="secondary" className="w-full gap-1.5">
                        <LogIn className="h-3.5 w-3.5" />
                        Join
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

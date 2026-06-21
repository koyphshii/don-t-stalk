import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, BoxIcon } from "lucide-react";

export default async function MembersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const members = await prisma.user.findMany({
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
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Members</h1>
        <p className="text-muted-foreground mt-1">
          All registered members — {members.length} total
        </p>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center gap-3 py-3 px-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback className="text-sm bg-secondary text-muted-foreground">
                  {member.username[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {member.username}
                  </span>
                  {member.discordId && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-[#5865F2] border-[#5865F2]/30">
                      Discord
                    </Badge>
                  )}
                  {member.id === session.user.id && (
                    <span className="text-[11px] text-muted-foreground">(you)</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <BoxIcon className="h-3 w-3" />
                    {member._count.ownedBoxes} boxes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {member._count.questions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {member._count.memberships} memberships
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

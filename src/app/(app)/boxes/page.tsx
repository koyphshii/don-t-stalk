import Link from "next/link";
import { getUserBoxes } from "@/lib/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MessageSquare, Crown } from "lucide-react";

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
  const boxes = await getUserBoxes();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Your Boxes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your voting boxes or join new ones
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
              Create your first box to start collecting &quot;most likely
              to&quot; questions, or join one via an invite link.
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
          {boxes.map((box) => (
            <Link key={box.id} href={`/boxes/${box.id}`}>
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {box.title}
                    </CardTitle>
                    <Badge variant={statusVariantMap[box.status]}>
                      {statusLabelMap[box.status]}
                    </Badge>
                  </div>
                  {box.isOwner && (
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Crown className="h-3 w-3" />
                      You own this box
                    </CardDescription>
                  )}
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
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/boxes" className="text-base font-display font-bold tracking-tight hover:text-primary/80 transition-colors">
              koshi the bloshi
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/members">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Members
                </Button>
              </Link>
              <Link href="/boxes/new">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  New Box
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-7 w-7">
                {session.user.avatarUrl && (
                  <AvatarImage src={session.user.avatarUrl} alt={session.user.username ?? ""} />
                )}
                <AvatarFallback className="text-[10px] bg-secondary text-muted-foreground">
                  {session.user.username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">
                {session.user.username}
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}

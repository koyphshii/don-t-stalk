import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus, Users, LogOut } from "lucide-react";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

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
      <header className="sticky top-0 z-50 w-full border-t-4 border-t-primary border-b border-border/50 bg-background/80 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/boxes" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="relative h-5 w-5 spin-yin-yang">
                <Image src="/images/taichi.svg" fill className="dark:invert opacity-75" alt="yin-yang" />
              </div>
              <span className="text-base font-[family-name:var(--font-pixel)] font-bold tracking-wider subtle-text">
                koshi the bloshi
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/members">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                  <Users className="h-4 w-4" />
                  Members
                </Button>
              </Link>
              <Link href="/boxes/new">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                  <Plus className="h-4 w-4" />
                  New Box
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                {session.user.avatarUrl && (
                  <AvatarImage src={session.user.avatarUrl} alt={session.user.username ?? ""} />
                )}
                <AvatarFallback className="text-[10px] bg-secondary text-primary">
                  {session.user.username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">
                {session.user.username}
              </span>
            </Link>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}

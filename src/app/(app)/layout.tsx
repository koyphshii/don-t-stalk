import { auth } from "@/auth";
import { signOut } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href="/boxes"
            className="text-xl font-display font-bold gradient-text"
          >
            koshi the bloshi
          </Link>

          <div className="flex items-center gap-3">
            {session?.user && (
              <>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      {session.user.avatarUrl && (
                        <AvatarImage src={session.user.avatarUrl} alt={session.user.username || ""} />
                      )}
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {session.user.username?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">
                      {session.user.username}
                    </span>
                  </Button>
                </Link>

                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 page-enter">
        {children}
      </main>
    </div>
  );
}

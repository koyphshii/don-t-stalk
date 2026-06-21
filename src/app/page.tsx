import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#050505] text-white/90 overflow-hidden grain-overlay flex flex-col">
      <div className="relative z-10 flex flex-col flex-1">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <span className="text-xl font-display font-bold text-white/90 tracking-tight">
            koshi the bloshi
          </span>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link href="/boxes">
                <Button variant="outline" size="sm" className="gap-1 border-white/20 text-white/70 hover:text-white hover:bg-white/5">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="neon" size="sm">
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-white/40 mb-8 animate-slide-up">
              your friend group&apos;s most unhinged takes, quantified
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-6 animate-slide-up [animation-delay:0.1s]">
              <span className="block">who&apos;s</span>
              <span className="block subtle-text">most likely</span>
              <span className="block">to</span>
              <span className="block text-white/30 text-3xl sm:text-5xl lg:text-6xl mt-2 font-mono italic">
                ________?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-10 animate-slide-up [animation-delay:0.2s]">
              Create a box. Drop your questions. Vote on your friends.
              <br />
              No cap, it&apos;s giving main character energy fr fr
            </p>

            <div className="flex items-center justify-center gap-4 animate-slide-up [animation-delay:0.3s]">
              {session?.user ? (
                <Link href="/boxes">
                  <Button variant="neon" size="xl">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="neon" size="xl">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="neon-outline" size="xl">
                      I Have an Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

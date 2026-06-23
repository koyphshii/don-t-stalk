import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#050505] text-white/90 overflow-hidden grain-overlay flex flex-col relative">
      {/* floating decorative particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[15%] left-[10%] w-1 h-1 rounded-full bg-white/10 animate-[twinkle_4s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/8 animate-[twinkle_3s_ease-in-out_infinite_1s]" />
        <div className="absolute top-[60%] left-[20%] w-1 h-1 rounded-full bg-white/6 animate-[twinkle_5s_ease-in-out_infinite_0.5s]" />
        <div className="absolute bottom-[25%] right-[25%] w-1 h-1 rounded-full bg-white/10 animate-[twinkle_4s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[45%] left-[60%] w-1.5 h-1.5 rounded-full bg-white/8 animate-[twinkle_3.5s_ease-in-out_infinite_1.5s]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <span className="text-xl font-display font-bold subtle-text tracking-tight">
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
                <Button variant="outline" size="sm" className="gap-1 border-white/20 text-white/70 hover:text-white hover:bg-white/5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* decorative divider */}
        <div className="max-w-6xl mx-auto w-full px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-sm text-white/40 mb-10 animate-slide-up backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-white/20" />
              your friend group&apos;s most unhinged takes, quantified
              <Sparkles className="h-3.5 w-3.5 text-white/20" />
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-6 animate-slide-up [animation-delay:0.1s]">
              <span className="block">who&apos;s</span>
              <span className="block subtle-text">most likely</span>
              <span className="block">to</span>
              <span className="block text-white/20 text-3xl sm:text-5xl lg:text-6xl mt-3 font-mono italic tracking-wider">
                ________?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/35 max-w-xl mx-auto mb-12 animate-slide-up [animation-delay:0.2s] leading-relaxed">
              Create a box. Drop your questions. Vote on your friends.
              <br />
              <span className="text-white/20 text-sm">no cap, it&apos;s giving main character energy fr fr</span>
            </p>

            <div className="flex items-center justify-center gap-4 animate-slide-up [animation-delay:0.3s]">
              {session?.user ? (
                <Link href="/boxes">
                  <Button variant="neon" size="xl" className="gap-2">
                    Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="neon" size="xl" className="gap-2">
                      <Sparkles className="h-4 w-4" />
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

        {/* footer accent */}
        <div className="max-w-6xl mx-auto w-full px-6 pb-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <p className="text-center text-[10px] text-white/10 mt-3 font-mono tracking-widest uppercase">
            ✦ 少女祈祷中 ✦
          </p>
        </div>
      </div>
    </div>
  );
}

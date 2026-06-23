import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background text-foreground/90 overflow-hidden grain-overlay flex flex-col relative">
      {/* Anime Banner background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] overflow-hidden pointer-events-none opacity-20 dark:opacity-30" aria-hidden="true">
        <Image 
          src="/images/banner.webp" 
          fill 
          priority 
          className="object-cover object-center" 
          alt="shrine banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 spin-yin-yang">
              <Image 
                src="/images/taichi.svg" 
                fill 
                className="dark:invert opacity-80" 
                alt="yin-yang" 
              />
            </div>
            <span className="text-xl font-[family-name:var(--font-pixel)] font-bold subtle-text tracking-wider">
              koshi the bloshi
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link href="/boxes">
                <Button variant="outline" size="sm" className="gap-1 border-primary/30 hover:border-primary/60 bg-card">
                  Dashboard
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-1 border-primary/30 hover:border-primary/60 bg-card">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Log In
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* decorative divider */}
        <div className="max-w-6xl mx-auto w-full px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6 py-12 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Reimu Pixel Art Badge */}
            <div className="inline-flex flex-col items-center mb-6 animate-slide-up">
              <div className="relative h-16 w-16 mb-2 hover:scale-110 transition-transform duration-300">
                <Image 
                  src="/images/reimu.png" 
                  fill 
                  className="object-contain" 
                  alt="reimu pixel avatar" 
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
                your friend group&apos;s most unhinged takes, quantified
                <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              </div>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-[family-name:var(--font-pixel)] font-bold leading-[0.95] mb-6 animate-slide-up [animation-delay:0.1s] tracking-tight">
              <span className="block text-foreground">who&apos;s</span>
              <span className="block subtle-text py-2">most likely</span>
              <span className="block text-foreground">to</span>
              <span className="block text-primary/30 text-3xl sm:text-5xl lg:text-6xl mt-4 font-mono italic tracking-widest">
                ________?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-slide-up [animation-delay:0.2s] leading-relaxed">
              Create a box. Drop your questions. Vote on your friends.
              <br />
              <span className="text-primary/40 text-sm font-mono block mt-2">
                ✦ lunatic difficulty voting — no cap, absolute main character energy ✦
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:0.3s]">
              {session?.user ? (
                <Link href="/boxes" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto gap-2 text-md font-bold px-8 py-6 talisman-card bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto gap-2 text-md font-bold px-8 py-6 talisman-card bg-primary hover:bg-primary/90 text-primary-foreground border-none">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto text-md font-bold px-8 py-6 border-2 border-primary/40 hover:border-primary/80 bg-background text-foreground hover:bg-primary/5">
                      I Have an Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* footer accent */}
        <div className="max-w-6xl mx-auto w-full px-6 pb-6 mt-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
          <p className="text-center text-[11px] text-primary/40 mt-4 font-mono tracking-widest uppercase flex items-center justify-center gap-2">
            <span>✦</span>
            <span>少女祈祷中</span>
            <span className="inline-block relative h-3.5 w-3.5 spin-yin-yang align-middle">
              <Image 
                src="/images/taichi-fill.svg" 
                fill 
                className="opacity-40 dark:invert" 
                alt="yin-yang badge" 
              />
            </span>
            <span>GIRLS ARE PRAYING NOW</span>
            <span>✦</span>
          </p>
        </div>
      </div>
    </div>
  );
}

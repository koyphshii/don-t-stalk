"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  swayDuration: number;
  swayWidth: number;
  opacity: number;
}

interface SakuraStyle extends React.CSSProperties {
  "--sway-width"?: string;
}

export function SakuraShower() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const petalCount = 20;
    const generated: Petal[] = [];
    for (let i = 0; i < petalCount; i++) {
      generated.push({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 10 + 6, // 6px to 16px
        duration: Math.random() * 10 + 10, // 10s to 20s
        delay: Math.random() * -20, // pre-distribute petals across screen height
        swayDuration: Math.random() * 3 + 3, // 3s to 6s
        swayWidth: Math.random() * 40 + 20, // 20px to 60px
        opacity: Math.random() * 0.4 + 0.4, // 0.4 to 0.8
      });
    }
    setPetals(generated);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sakura-fall {
          0% {
            top: -10%;
          }
          100% {
            top: 110%;
          }
        }
        @keyframes sakura-sway {
          0%, 100% {
            transform: translateX(0) rotate(0deg) rotateY(0deg);
          }
          50% {
            transform: translateX(var(--sway-width)) rotate(180deg) rotateY(180deg);
          }
        }
      `}} />
      <div className="sakura-container" aria-hidden="true">
        {petals.map((p) => (
          <div
            key={p.id}
            className="sakura-petal"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 0.8}px`,
              opacity: p.opacity,
              animation: `sakura-fall ${p.duration}s linear infinite, sakura-sway ${p.swayDuration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s, 0s`,
              "--sway-width": `${p.swayWidth}px`,
            } as SakuraStyle}
          />
        ))}
      </div>
    </>
  );
}

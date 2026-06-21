"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    tinygif: {
      url: string;
      dims: [number, number];
    };
  };
}

const SEARCH_TERMS = [
  "anime reaction",
  "anime pointing",
  "anime shock",
  "anime laugh",
  "anime stare",
  "anime wtf",
  "anime smug",
  "anime cry",
  "anime dance",
  "anime blush",
  "anime angry",
  "anime happy",
  "anime confused",
  "anime smug face",
  "anime teasing",
  "anime excited",
];

const FALLBACK_MESSAGES = [
  "watching anime at 3am instead of sleeping",
  "spending 4 hours customizing your MyAnimeList profile",
  "rewatching the same anime for the 5th time",
  "arguing about which waifu is the best",
  "knowing every frame of your favorite OP by heart",
  "running a tier list for fictional characters",
  "bringing up anime in every conversation",
  "having 500+ entries on your plan to watch list",
];

interface GifGridProps {
  count?: number;
  title?: string;
  subtitle?: string;
  variant?: "single" | "double";
}

export function GifGrid({
  count = 8,
  title,
  subtitle,
  variant = "double",
}: GifGridProps) {
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY;
    if (!apiKey) {
      setLoading(false);
      return;
    }

    const targetCount = Math.min(count, 12);

    const fetchPromises = [];
    const shuffledTerms = [...SEARCH_TERMS]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.ceil(targetCount / 4));

    for (const term of shuffledTerms) {
      const url = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(term)}&key=${apiKey}&limit=4&media_filter=tinygif&random=true`;
      fetchPromises.push(fetch(url).then((r) => r.json()));
    }

    Promise.all(fetchPromises)
      .then((results) => {
        const allGifs = results
          .flatMap((d) => d.results || [])
          .filter(Boolean)
          .slice(0, targetCount);
        setGifs(allGifs);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [count]);

  const gridCols =
    variant === "double"
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6";

  if (loading) {
    return (
      <div className="space-y-4">
        {title && (
          <div className="text-center">
            <h3 className="text-lg font-display font-bold text-white/80">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-white/40 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className={`grid ${gridCols} gap-3`}>
          {[...Array(count)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (gifs.length > 0) {
    return (
      <div className="space-y-4">
        {title && (
          <div className="text-center">
            <h3 className="text-lg font-display font-bold text-white/80">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-white/40 mt-1">{subtitle}</p>
            )}
          </div>
        )}
        <div className={`grid ${gridCols} gap-3`}>
          {gifs.map((gif, i) => (
            <div
              key={gif.id}
              className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.06] hover:border-white/20 transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
              style={{
                animation: `slide-up 0.4s ease-out ${i * 0.05}s both`,
              }}
            >
              <Image
                src={gif.media_formats.tinygif.url}
                alt={gif.title || "anime reaction"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-white/15">
          Powered by Tenor
        </p>
      </div>
    );
  }

  const shuffled = [...FALLBACK_MESSAGES]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-display font-bold text-white/80">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-white/40 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shuffled.map((text, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] transition-all hover:border-white/20 hover:scale-[1.02]"
            style={{
              animation: `slide-up 0.4s ease-out ${i * 0.05}s both`,
            }}
          >
            <div className="w-full aspect-square rounded-md bg-white/[0.03] flex items-center justify-center mb-3 overflow-hidden">
              <span className="text-4xl opacity-30 select-none">
                {["🎬", "📺", "🎌", "⛩️", "🌸", "🗡️", "⚡", "🌙"][i % 8]}
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed italic">
              &ldquo;{text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

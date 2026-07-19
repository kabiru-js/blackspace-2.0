"use client";

import { useAppStore } from "@/lib/store";
import { SwipeDeck } from "@/components/SwipeDeck";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export default function SwipePage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `blackspace_streak_${user.id}`;
    const stored = localStorage.getItem(key);
    const today = new Date().toDateString();
    let data = stored ? JSON.parse(stored) : { dates: [] };

    // Add today if not already
    if (!data.dates.includes(today)) {
      data.dates.push(today);
    }

    // Keep only last 30 days
    data.dates = data.dates.filter((d: string) => {
      const diff = (Date.now() - new Date(d).getTime()) / 86400000;
      return diff <= 30;
    });

    // Count consecutive days
    data.dates.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    let count = 0;
    let check = new Date();
    for (const d of data.dates) {
      const date = new Date(d);
      if (date.toDateString() === check.toDateString()) {
        count++;
        check.setDate(check.getDate() - 1);
      } else if (new Date(date).getTime() >= check.getTime() - 86400000) {
        count++;
        check = new Date(date);
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }

    setStreak(count);
    localStorage.setItem(key, JSON.stringify(data));
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Discover</h1>
              <p className="text-xs text-zinc-500">
                Swipe right to save, left to skip
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-400">{streak}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-accent-light" />
              <span className="text-xs font-medium text-accent-light">
                {user.full_name?.split(" ")[0] || "Scholar"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe deck */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <SwipeDeck />
      </div>

      {/* Hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
        <p className="text-xs text-zinc-600 text-center">
          Swipe right to match &bull; Swipe left to pass
        </p>
      </div>
    </div>
  );
}

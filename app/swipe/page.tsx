"use client";

import { useAppStore } from "@/lib/store";
import { SwipeDeck } from "@/components/SwipeDeck";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Flame, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AISearch } from "@/components/AISearch";
import { OpportunityCategory, CATEGORY_LABELS } from "@/lib/types";

const CATEGORIES: (OpportunityCategory | "all")[] = [
  "all", "academic", "career", "creative", "athletic",
];

export default function SwipePage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState<"smart" | "search">("smart");
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | "all">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("bs_last_category") as OpportunityCategory | "all") || "all";
    }
    return "all";
  });

  const handleCategoryChange = (cat: OpportunityCategory | "all") => {
    setActiveCategory(cat);
    localStorage.setItem("bs_last_category", cat);
  };

  useEffect(() => {
    if (!user) return;
    const key = `blackspace_streak_${user.id}`;
    const stored = localStorage.getItem(key);
    const today = new Date().toDateString();
    let data = stored ? JSON.parse(stored) : { dates: [] };
    if (!data.dates.includes(today)) data.dates.push(today);
    data.dates = data.dates.filter((d: string) => (Date.now() - new Date(d).getTime()) / 86400000 <= 30);
    data.dates.sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    let count = 0, check = new Date();
    for (const d of data.dates) {
      const date = new Date(d);
      if (date.toDateString() === check.toDateString()) { count++; check.setDate(check.getDate() - 1); }
      else if (new Date(date).getTime() >= check.getTime() - 86400000) { count++; check = new Date(date); check.setDate(check.getDate() - 1); }
      else break;
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
        <div className="max-w-lg mx-auto px-4 py-3 space-y-3">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Discover</h1>
              {/* Personalization signal */}
              {user.category_focus && user.category_focus.length > 0 && (
                <span className="hidden sm:inline text-xs text-zinc-500">
                  for {user.category_focus.map(c => CATEGORY_LABELS[c as OpportunityCategory]).join(", ")}
                </span>
              )}
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
                  {user.full_name?.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Mode toggle + Category filter */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
                    activeCategory === cat
                      ? "bg-accent/20 border-accent/50 text-accent-light"
                      : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 flex-shrink-0">
              <button
                onClick={() => setMode("smart")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "smart" ? "bg-accent text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMode("search")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  mode === "search" ? "bg-accent text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4">
        {mode === "smart" ? (
          <SwipeDeck activeCategory={activeCategory} />
        ) : (
          <AISearch userId={user.id} />
        )}
      </div>

      {/* Hint */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2">
        <p className="text-xs text-zinc-600 text-center">
          {mode === "smart" ? "Swipe right to match · Swipe left to pass" : "Describe what you want"}
        </p>
      </div>
    </div>
  );
}

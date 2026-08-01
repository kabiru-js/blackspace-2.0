"use client";

import { useAppStore } from "@/lib/store";
import { SwipeDeck } from "@/components/SwipeDeck";
import { useRouter } from "next/navigation";
import { Flame, Sparkles, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { AISearch } from "@/components/AISearch";
import { updateAffinity } from "@/lib/matching";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

export default function SwipePage() {
  const { user } = useAppStore();
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState<"smart" | "search">("smart");
  const [affinity, setAffinity] = useState<Record<string, number>>({});
  const [skippedTags, setSkippedTags] = useState<Set<string>>(new Set());

  // For swipe feedback
  const handleSwipeFeedback = (opportunityId: string, liked: boolean, tags: string[]) => {
    const action = liked ? "save" : "skip";
    setAffinity((prev) => updateAffinity(prev, tags, action));
    if (!liked) {
      setSkippedTags((prev) => {
        const next = new Set(prev);
        tags.forEach((t) => next.add(t.toLowerCase()));
        return next;
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    // Load affinity from localStorage
    const key = `bs_affinity_${user.id}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) setAffinity(JSON.parse(stored));
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const key = `bs_affinity_${user.id}`;
    localStorage.setItem(key, JSON.stringify(affinity));
  }, [affinity, user]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const userInterests = user.interests || [];
  const contextLine = userInterests.length > 0
    ? `Because you're interested in ${userInterests.slice(0, 3).join(", ")}`
    : "Opportunities are ranked for you as you explore";

  return (
    <div className="min-h-screen" style={{ background: "var(--black)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "var(--black)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto px-4 py-3 space-y-2.5">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold flex items-center gap-2" style={{ ...display, color: "var(--text)" }}>
                <Sparkles className="w-5 h-5" style={{ color: "var(--lime)" }} />
                For You
              </h1>
              <p className="text-[11px] leading-tight mt-0.5" style={{ ...mono, color: "var(--faint)" }}>
                {contextLine}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border" style={{ borderColor: "rgba(255,122,69,.25)", background: "rgba(255,122,69,.08)" }}>
                  <Flame className="w-3.5 h-3.5" style={{ color: "var(--orange)" }} />
                  <span className="text-xs font-bold" style={{ ...mono, color: "var(--orange)" }}>{streak}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: "rgba(214,255,63,.2)", background: "rgba(214,255,63,.06)" }}>
                <span className="text-xs font-medium" style={{ ...mono, color: "var(--lime)" }}>
                  {user.full_name?.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] leading-tight" style={{ ...mono, color: "var(--faint)" }}>
              Swipe to explore — save what fits
            </p>
            <div className="flex items-center rounded-lg p-0.5 flex-shrink-0" style={{ background: "var(--card)" }}>
              <button onClick={() => setMode("smart")}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{ ...mono, background: mode === "smart" ? "var(--lime)" : "transparent", color: mode === "smart" ? "#050506" : "var(--faint)" }}>
                <Zap className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setMode("search")}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{ ...mono, background: mode === "search" ? "var(--lime)" : "transparent", color: mode === "search" ? "#050506" : "var(--faint)" }}>
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editable interests */}
          {userInterests.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Your interests:</span>
              {userInterests.slice(0, 5).map((interest) => (
                <span key={interest} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.04em]"
                  style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--muted)", background: "var(--card)" }}>
                  {interest}
                </span>
              ))}
              <button onClick={() => router.push("/profile")} className="text-[10px] uppercase tracking-[0.06em] transition-colors hover:text-[var(--lime)]"
                style={{ ...mono, color: "var(--faint)" }}>
                [+ edit]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4">
        {mode === "smart" ? (
          <SwipeDeck
            affinity={affinity}
            skippedTags={skippedTags}
            onSwipeFeedback={handleSwipeFeedback}
          />
        ) : (
          <AISearch userId={user.id} />
        )}
      </div>

      {/* Hint — hidden on short screens so it can't collide with the bottom nav */}
      <div className="hidden min-[400px]:block fixed bottom-24 left-1/2 -translate-x-1/2">
        <p className="text-xs text-center" style={{ ...mono, color: "var(--faint)" }}>
          {mode === "smart" ? "← Not for me   ·   Save →" : "Describe what you're looking for"}
        </p>
      </div>
    </div>
  );
}

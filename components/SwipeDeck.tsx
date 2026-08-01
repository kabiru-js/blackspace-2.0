"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, RefreshCw, Sparkles, CheckCircle2, Globe, ThumbsUp, ThumbsDown } from "lucide-react";
import { SwipeCard } from "./SwipeCard";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { sortOpportunitiesByMatch, rankForFeed, intentPillToExploration } from "@/lib/matching";
import { Opportunity, OpportunityWithMatch } from "@/lib/types";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

interface SwipeDeckProps {
  affinity: Record<string, number>;
  skippedTags: Set<string>;
  onSwipeFeedback: (opportunityId: string, liked: boolean, tags: string[]) => void;
}

export function SwipeDeck({ affinity, skippedTags, onSwipeFeedback }: SwipeDeckProps) {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; onUndo?: () => void } | null>(null);
  const [lastSwiped, setLastSwiped] = useState<{ id: string; liked: boolean; tags: string[] } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Finding your matches...");
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const { user, opportunities, setOpportunities } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  // The feed is fully agnostic — no category/type filter tabs exposed to
  // the user. Active intent is always "for you" internally: fetch broadly,
  // then rank by the scoring engine. Type/category are hints, never gates.
  const explorationLevel = intentPillToExploration("for_you");

  const availableOpportunities = opportunities.filter((o) => !swipedIds.has(o.id));
  const currentCard = availableOpportunities[0];

  // ── Smart loading messages ──
  useEffect(() => {
    if (!loading) return;
    const interests = user?.interests || [];
    if (interests.length === 0) {
      setLoadingMessage("Finding your matches...");
      return;
    }
    const messages = [
      `Finding opportunities for ${interests[0]}...`,
      `Looking for ${interests.slice(0, 2).join(" and ")} opportunities...`,
      `Searching across ${interests.length} interests...`,
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[i % messages.length]);
      i++;
    }, 1800);
    return () => clearInterval(interval);
  }, [loading, user]);

  const loadScholarships = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      let query = supabase.from("scholarships").select("*");
      // No hard type/category filter — fetch everything and let the
      // scoring engine rank it. Type/category are hints, never gates.
      const { data: allOpportunities, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      const { data: userSwipes } = await supabase.from("swipes").select("scholarship_id").eq("user_id", user.id);
      const alreadySwiped = new Set<string>(((userSwipes as any[]) || []).map((s: any) => s.scholarship_id));
      const unscored = ((allOpportunities as Opportunity[]) || []).filter((o) => !alreadySwiped.has(o.id));

      // Apply exploration level + relevance floor. rankForFeed keeps a
      // culinary user's deck full of culinary (and genuinely related)
      // cards — STEM scholarships and football trials sink below the
      // relevance floor instead of filling the deck.
      const userForScoring = { ...user, exploration_level: explorationLevel };
      const scored = rankForFeed(unscored, userForScoring, affinity, skippedTags);
      setOpportunities(scored);
      setSwipedIds(alreadySwiped);
    } catch (err) {
      console.error("Error loading:", err);
      setError("Failed to load. Please try again.");
    } finally { setLoading(false); }
  }, [user, setOpportunities, affinity, skippedTags]);

  const discoverScholarships = useCallback(async () => {
    if (!user || availableOpportunities.length > 3 || discovering) return;
    setDiscovering(true);
    try {
      const res = await fetch("/api/generate-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          interests: user.interests || [],
          intents: user.intents || [],
          preferredCountries: user.preferred_countries || [],
          explorationLevel,
        }),
      });
      if (!res.ok) return;
      const { scholarships: newScholarships } = await res.json();
      if (!newScholarships?.length) return;
      const toInsert = newScholarships.map((s: any) => ({
        title: s.title, provider: s.provider, country: s.country,
        category: s.category || "academic", type: s.type || "scholarship",
        level: s.level || "all", field: s.field || user.field_of_study,
        funding_type: s.funding_type || "partial", skills: s.skills || [],
        is_remote: s.is_remote || false,
        deadline: s.deadline || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        description: s.description || "", eligibility: s.eligibility || "",
        requirements: s.requirements || "", application_link: s.application_link || "",
        tags: s.tags || [],
      }));
      const { data: inserted } = await supabase.from("scholarships").insert(toInsert as any).select();
      if (inserted?.length) {
        const userForScoring = { ...user, exploration_level: explorationLevel };
        const scored = sortOpportunitiesByMatch(
          (inserted as Opportunity[]).filter((o) => !swipedIds.has(o.id)),
          userForScoring, affinity, skippedTags
        );
        setOpportunities([...opportunities, ...scored]);
      }
    } catch (err) { console.error("Discovery error:", err); }
    finally { setDiscovering(false); }
  }, [user, availableOpportunities.length, swipedIds, opportunities, discovering, affinity, skippedTags]);

  useEffect(() => { if (!loading && availableOpportunities.length <= 3) discoverScholarships(); }, [availableOpportunities.length, loading]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
      if (e.key === "Escape") handleSwipe("left");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentCard, user]);
  useEffect(() => { loadScholarships(); }, [loadScholarships]);

  const generateApplication = async (opportunity: OpportunityWithMatch) => {
    if (!user) return;
    setGeneratingFor(opportunity.id);
    try {
      const res = await fetch("/api/generate-essay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, scholarshipId: opportunity.id }) });
      if (!res.ok) throw new Error("Generation failed");
      const { content, essay, letter } = await res.json();
      await supabase.from("applications").insert({ user_id: user.id, scholarship_id: opportunity.id, status: "draft", generated_essay: content || `## Personal Statement\n\n${essay}\n\n---\n\n## Motivation Letter\n\n${letter}` } as any);
      setToast({ message: "Application generated! Check your Saved tab.", type: "success" });
      track("ai_application_generated", { scholarship_id: opportunity.id, scholarship_title: opportunity.title });
    } catch (err) {
      console.error("Auto-apply error:", err);
      setToast({ message: "Swiped right, but AI generation failed. Apply manually in Saved.", type: "error" });
    } finally { setGeneratingFor(null); }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentCard || !user) return;
    const liked = direction === "right";
    track(liked ? "swipe_right" : "swipe_left", { scholarship_id: currentCard.id, scholarship_title: currentCard.title, match_score: currentCard.match_score });
    setSwipedIds((prev) => new Set(prev).add(currentCard.id));
    if (liked) useAppStore.getState().addLikedId(currentCard.id);

    const swipedCard = { id: currentCard.id, liked, tags: currentCard.tags || [] };
    setLastSwiped(swipedCard);
    onSwipeFeedback(currentCard.id, liked, currentCard.tags || []);

    try { await supabase.from("swipes").insert({ user_id: user.id, scholarship_id: currentCard.id, liked } as any); }
    catch (err) { console.error("Error saving swipe:", err); }

    if (liked) generateApplication(currentCard);

    // Show feedback prompt after every few swipes
    setShowFeedback(null);
    if (Math.random() < 0.3) {
      setTimeout(() => setShowFeedback(currentCard.id), 800);
    }

    setToast({ message: liked ? "Saved!" : "Skipped", type: "success", onUndo: () => undoLastSwipe(swipedCard) });
  };

  const undoLastSwipe = async (card: { id: string; liked: boolean; tags: string[] }) => {
    setSwipedIds((prev) => { const next = new Set(prev); next.delete(card.id); return next; });
    if (card.liked) useAppStore.getState().setLikedIds(Array.from(useAppStore.getState().likedIds).filter((id) => id !== card.id));
    try {
      const uid = user?.id as string;
      await (supabase as any).from("swipes").delete().eq("user_id", uid).eq("scholarship_id", card.id);
      await (supabase as any).from("applications").delete().eq("user_id", uid).eq("scholarship_id", card.id);
      // Reverse affinity
      onSwipeFeedback(card.id, !card.liked, card.tags);
    } catch (err) { console.error("Undo error:", err); }
    setLastSwiped(null); setToast(null); setShowFeedback(null);
  };

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t); } }, [toast]);

  // ─── LOADING ───
  if (loading) {
    const interests = user?.interests || [];
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime)", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ ...mono, color: "var(--faint)" }}>{loadingMessage}</p>
          {interests.length > 0 && (
            <p className="text-[11px]" style={{ ...mono, color: "var(--faint)", opacity: 0.5 }}>
              Based on: {interests.slice(0, 3).join(", ")}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ─── ERROR ───
  if (error) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <p className="text-sm" style={{ color: "var(--muted)" }}>{error}</p>
          <button onClick={loadScholarships} className="btn btn-primary" style={{ padding: "10px 20px" }}>
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const noMoreCards = availableOpportunities.length === 0;

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 pb-20">
      {/* AI generation indicator */}
      {generatingFor && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 rounded-full border flex items-center gap-2"
          style={{ background: "rgba(214,255,63,.08)", borderColor: "rgba(214,255,63,.2)" }}>
          <Sparkles className="w-4 h-4 animate-pulse" style={{ color: "var(--lime)" }} />
          <span className="text-sm" style={{ color: "var(--lime)", ...mono }}>Generating application with AI...</span>
        </motion.div>
      )}

      {/* Discovery indicator */}
      {discovering && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 rounded-full border flex items-center gap-2"
          style={{ background: "rgba(42,245,207,.08)", borderColor: "rgba(42,245,207,.2)" }}>
          <Globe className="w-4 h-4 animate-pulse" style={{ color: "var(--cyan)" }} />
          <span className="text-sm" style={{ color: "var(--cyan)", ...mono }}>Finding new opportunities...</span>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-full shadow-lg backdrop-blur-md border text-sm flex items-center"
            style={{
              background: toast.type === "success" ? "rgba(26,174,57,.15)" : "rgba(224,49,49,.15)",
              borderColor: toast.type === "success" ? "rgba(26,174,57,.3)" : "rgba(224,49,49,.3)",
              color: toast.type === "success" ? "var(--lime)" : "var(--magenta)",
              ...mono,
            }}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 mr-2" /> : null}
            {toast.message}
            {toast.onUndo && (
              <button onClick={(e) => { e.stopPropagation(); toast.onUndo?.(); }}
                className="ml-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,.1)", color: "var(--text)" }}>
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback prompt */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="mb-3 px-4 py-2 rounded-full border flex items-center gap-3"
            style={{ background: "var(--card)", borderColor: "var(--line-strong)" }}>
            <span className="text-xs" style={{ ...mono, color: "var(--muted)" }}>Want more like this?</span>
            <button onClick={() => { onSwipeFeedback("feedback_" + Date.now(), true, currentCard?.tags || []); setShowFeedback(null); }}
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{ background: "var(--lime)", color: "#050506", ...mono }}>
              <ThumbsUp className="w-3 h-3" /> Yes
            </button>
            <button onClick={() => setShowFeedback(null)}
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              style={{ background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--faint)", ...mono }}>
              <ThumbsDown className="w-3 h-3" /> Not really
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stacked cards — height adapts to viewport so the deck + buttons
          + bottom nav never overflow on small phones */}
      <div className="relative w-full max-w-sm h-[clamp(380px,calc(100dvh-300px),550px)] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {noMoreCards ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center px-8">
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full blur-xl" style={{ background: "radial-gradient(circle, rgba(214,255,63,.2), transparent 70%)" }} />
                <div className="relative w-full h-full rounded-full border flex items-center justify-center" style={{ background: "rgba(214,255,63,.06)", borderColor: "rgba(214,255,63,.15)" }}>
                  <Sparkles className="w-10 h-10" style={{ color: "var(--lime)" }} />
                </div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--lime)" }} />
                <div className="absolute bottom-2 left-1 w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--cyan)", animationDelay: "0.5s" }} />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{ ...display, color: "var(--text)" }}>All Caught Up!</h2>
              <p className="text-sm mb-2 leading-relaxed" style={{ color: "var(--muted)" }}>You've reviewed every opportunity available.</p>
              <p className="text-xs mb-8 max-w-xs mx-auto" style={{ color: "var(--faint)" }}>AI is discovering new ones for you — check back soon or browse your saved matches.</p>
              <div className="flex flex-col items-center gap-3">
                <button onClick={() => router.push("/saved")} className="btn btn-primary" style={{ padding: "12px 24px" }}>
                  View Saved Matches
                </button>
                <button onClick={() => { setSwipedIds(new Set()); loadScholarships(); }}
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{ background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--muted)", ...mono }}>
                  <RefreshCw className="w-4 h-4 inline mr-2" /> Discover More
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {availableOpportunities.slice(1, 4).reverse().map((o, i) => (
                <SwipeCard key={o.id} opportunity={o} onSwipe={() => {}} isTop={false} stackIndex={i} />
              ))}
              {currentCard && (
                <SwipeCard key={currentCard.id} opportunity={currentCard} onSwipe={handleSwipe} isTop={true} onApplyAI={() => generateApplication(currentCard)} />
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!noMoreCards && (
        <div className="flex items-center gap-5 sm:gap-6 mt-4 sm:mt-6">
          <button onClick={() => handleSwipe("left")}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all active:scale-90"
            style={{ background: "var(--card)", borderColor: "var(--line-strong)" }}>
            <X className="w-6 h-6 sm:w-7 sm:h-7 transition-transform hover:scale-110" style={{ color: "var(--faint)" }} />
          </button>
          <button onClick={() => handleSwipe("right")}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(214,255,63,.08)", borderColor: "rgba(214,255,63,.25)" }}>
            <Heart className="w-6 h-6 sm:w-7 sm:h-7 transition-transform hover:scale-110" style={{ color: "var(--lime)" }} />
          </button>
        </div>
      )}
    </div>
  );
}

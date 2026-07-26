"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, RefreshCw, Sparkles, CheckCircle2, Globe } from "lucide-react";
import { SwipeCard } from "./SwipeCard";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { sortOpportunitiesByMatch } from "@/lib/matching";
import { Opportunity, OpportunityWithMatch } from "@/lib/types";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

export function SwipeDeck({ activeCategory }: { activeCategory: string }) {
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; onUndo?: () => void } | null>(null);
  const [lastSwiped, setLastSwiped] = useState<{ id: string; liked: boolean } | null>(null);

  const { user, opportunities, setOpportunities } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  const availableOpportunities = opportunities.filter(
    (o) => !swipedIds.has(o.id)
  );
  const currentCard = availableOpportunities[0];

  const loadScholarships = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("scholarships").select("*");
      if (activeCategory && activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }
      const { data: allOpportunities, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const { data: userSwipes } = await supabase
        .from("swipes")
        .select("scholarship_id")
        .eq("user_id", user.id);
      const swipesData = userSwipes as { scholarship_id: string }[] | null;

      const alreadySwiped = new Set<string>(
        (swipesData || []).map((s) => s.scholarship_id)
      );

      const unscored = ((allOpportunities as Opportunity[]) || []).filter(
        (o) => !alreadySwiped.has(o.id)
      );

      const scored = sortOpportunitiesByMatch(unscored, user);
      setOpportunities(scored);
      setSwipedIds(alreadySwiped);
    } catch (err) {
      console.error("Error loading scholarships:", err);
      setError("Failed to load scholarships. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, setOpportunities, activeCategory]);

  const discoverScholarships = useCallback(async () => {
    if (!user || availableOpportunities.length > 3 || discovering) return;

    setDiscovering(true);
    try {
      const res = await fetch("/api/discover-scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: user.level,
          field: user.field_of_study,
          preferredCountries: user.preferred_countries || [],
          userId: user.id,
        }),
      });

      if (!res.ok) return;

      const { scholarships: newScholarships } = await res.json();
      if (!newScholarships?.length) return;

      const toInsert = newScholarships.map((s: any) => ({
        title: s.title,
        provider: s.provider,
        country: s.country,
        category: s.category || "academic",
        type: s.type || "scholarship",
        level: s.level || user.level,
        field: s.field || user.field_of_study,
        funding_type: s.funding_type || "partial",
        skills: s.skills || [],
        is_remote: s.is_remote || false,
        deadline: s.deadline || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
        description: s.description || "",
        eligibility: s.eligibility || "",
        requirements: s.requirements || "",
        application_link: s.application_link || "",
        tags: s.tags || [],
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("scholarships")
        .insert(toInsert as any)
        .select();

      if (insertError) return;

      if (inserted?.length) {
        const scored = sortOpportunitiesByMatch(
          (inserted as Opportunity[]).filter((o) => !swipedIds.has(o.id)),
          user
        );
        setOpportunities([...opportunities, ...scored]);
      }
    } catch (err) {
      console.error("Discovery error:", err);
    } finally {
      setDiscovering(false);
    }
  }, [user, availableOpportunities.length, swipedIds, opportunities, discovering]);

  // Trigger discovery when deck is low
  useEffect(() => {
    if (!loading && availableOpportunities.length <= 3) {
      discoverScholarships();
    }
  }, [availableOpportunities.length, loading, discoverScholarships]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleSwipe("left");
      if (e.key === "ArrowRight") handleSwipe("right");
      if (e.key === "Escape") handleSwipe("left");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentCard, user]);

  useEffect(() => {
    loadScholarships();
  }, [loadScholarships]);

  const generateApplication = async (opportunity: OpportunityWithMatch) => {
    if (!user) return;

    setGeneratingFor(opportunity.id);

    try {
      const res = await fetch("/api/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          scholarshipId: opportunity.id,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const { content, essay, letter } = await res.json();
      const fullContent = content || `## Personal Statement\n\n${essay}\n\n---\n\n## Motivation Letter\n\n${letter}`;

      await supabase.from("applications").insert({
        user_id: user.id,
        scholarship_id: opportunity.id,
        status: "draft",
        generated_essay: fullContent,
      } as any);

      setToast({
        message: "Application generated! Check your Saved tab.",
        type: "success",
      });

      track("ai_application_generated", {
        scholarship_id: opportunity.id,
        scholarship_title: opportunity.title,
      });
    } catch (err) {
      console.error("Auto-apply error:", err);
      setToast({
        message: "Swiped right, but AI generation failed. Apply manually in Saved.",
        type: "error",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentCard || !user) return;

    const liked = direction === "right";

    // Analytics
    track(liked ? "swipe_right" : "swipe_left", {
      scholarship_id: currentCard.id,
      scholarship_title: currentCard.title,
      match_score: currentCard.match_score,
    });

    setSwipedIds((prev) => new Set(prev).add(currentCard.id));

    if (liked) {
      useAppStore.getState().addLikedId(currentCard.id);
    }

    // Save for undo
    const swipedCard = { id: currentCard.id, liked };
    setLastSwiped(swipedCard);

    try {
      await supabase.from("swipes").insert({
        user_id: user.id,
        scholarship_id: currentCard.id,
        liked,
      } as any);
    } catch (err) {
      console.error("Error saving swipe:", err);
    }

    // Auto-generate application on right swipe
    if (liked) {
      generateApplication(currentCard);
    }

    // Show undo toast
    setToast({
      message: liked ? "Saved!" : "Skipped",
      type: "success",
      onUndo: () => undoLastSwipe(swipedCard),
    });
  };

  const undoLastSwipe = async (card: { id: string; liked: boolean }) => {
    // Remove from swiped set
    setSwipedIds((prev) => {
      const next = new Set(prev);
      next.delete(card.id);
      return next;
    });

    // Remove from liked
    if (card.liked) {
      useAppStore.getState().setLikedIds(
        Array.from(useAppStore.getState().likedIds).filter((id) => id !== card.id)
      );
    }

    // Delete from DB
    try {
      const uid = user?.id as string;
      await (supabase as any).from("swipes").delete().eq("user_id", uid).eq("scholarship_id", card.id);
      await (supabase as any).from("applications").delete().eq("user_id", uid).eq("scholarship_id", card.id);
    } catch (err) {
      console.error("Undo error:", err);
    }

    setLastSwiped(null);
    setToast(null);
  };

  // Clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-zinc-500 text-sm">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full pt-16">
        <div className="flex flex-col items-center gap-4 text-center px-8">
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={loadScholarships}
            className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg text-white hover:bg-accent-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const noMoreCards = availableOpportunities.length === 0;

  return (
    <div className="flex flex-col items-center justify-center h-full pt-4 pb-20">
      {/* Auto-apply indicator */}
      {generatingFor && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 bg-accent/20 border border-accent/30 rounded-full flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-accent-light animate-pulse" />
          <span className="text-sm text-accent-light">
            Generating application with AI...
          </span>
        </motion.div>
      )}

      {/* Discovery indicator */}
      {discovering && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2"
        >
          <Globe className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="text-sm text-blue-300">
            Finding new scholarships...
          </span>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border text-sm ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/30 text-green-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
            ) : null}
            {toast.message}
            {toast.onUndo && (
              <button
                onClick={(e) => { e.stopPropagation(); toast.onUndo?.(); }}
                className="ml-3 px-2 py-0.5 bg-white/10 rounded-md text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stacked cards */}
      <div className="relative w-full max-w-sm h-[550px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {noMoreCards ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-8"
            >
              {/* Illustration */}
              <div className="relative w-28 h-28 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-accent-dark/20 to-blue-500/10 rounded-full blur-xl" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-accent/20 to-accent-dark/30 border border-accent/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-accent-light" />
                </div>
                {/* Orbiting dots */}
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent-light rounded-full animate-pulse" />
                <div className="absolute bottom-2 left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                All Caught Up!
              </h2>
              <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
                You&apos;ve reviewed every scholarship available.
              </p>
              <p className="text-xs text-zinc-600 mb-8 max-w-xs mx-auto">
                AI is discovering new ones for you — check back soon or browse your saved matches.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => router.push("/saved")}
                  className="w-full max-w-[200px] px-6 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors active:scale-[0.98]"
                >
                  View Saved Matches
                </button>
                <button
                  onClick={() => { setSwipedIds(new Set()); loadScholarships(); }}
                  className="px-6 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Discover More
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {availableOpportunities
                .slice(1, 4)
                .reverse()
                .map((o, i) => (
                  <SwipeCard
                    key={o.id}
                    opportunity={o}
                    onSwipe={() => {}}
                    isTop={false}
                    stackIndex={i}
                  />
                ))}

              {currentCard && (
                <SwipeCard
                  key={currentCard.id}
                  opportunity={currentCard}
                  onSwipe={handleSwipe}
                  isTop={true}
                  onApplyAI={() => generateApplication(currentCard)}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      {!noMoreCards && (
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={() => handleSwipe("left")}
            className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-all active:scale-90 group"
          >
            <X className="w-7 h-7 text-red-400 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => handleSwipe("right")}
            className="w-14 h-14 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center hover:bg-accent/30 transition-all active:scale-90 group"
          >
            <Heart className="w-7 h-7 text-accent-light group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}

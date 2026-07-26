"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { Opportunity } from "@/lib/types";

const ApplicationModal = dynamic(
  () => import("@/components/ApplicationModal").then((m) => m.ApplicationModal),
  { ssr: false, loading: () => null }
);

const JobApplyModal = dynamic(
  () => import("@/components/JobApplyModal").then((m) => m.JobApplyModal),
  { ssr: false, loading: () => null }
);
import {
  Heart,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface LikedScholarship extends Opportunity {
  swipe_id: string;
  hasApplication: boolean;
}

export default function SavedPage() {
  const [likedScholarships, setLikedScholarships] = useState<
    LikedScholarship[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"match" | "deadline">("match");
  const [selectedScholarship, setSelectedScholarship] =
    useState<Opportunity | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { user } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadLikedScholarships();
  }, [user]);

  const loadLikedScholarships = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data: swipes } = await supabase
        .from("swipes")
        .select("*")
        .eq("user_id", user.id)
        .eq("liked", true)
        .order("created_at", { ascending: false });
      const swipesData = swipes as { id: string; scholarship_id: string }[] | null;

      if (!swipesData || swipesData.length === 0) {
        setLikedScholarships([]);
        return;
      }

      const scholarshipIds = swipesData.map((s) => s.scholarship_id);

      const { data: scholarships } = await supabase
        .from("scholarships")
        .select("*")
        .in("id", scholarshipIds);
      const scholarshipData = scholarships as (Opportunity & { id: string })[] | null;

      if (!scholarshipData) {
        setLikedScholarships([]);
        return;
      }

      const combined: LikedScholarship[] = scholarshipData.map(
        (s) => ({
          ...s,
          swipe_id: swipesData.find(
            (sw) => sw.scholarship_id === s.id
          )!.id,
          hasApplication: false,
        })
      );

      // Fetch applications to check which already have generated content
      const { data: applications } = await supabase
        .from("applications")
        .select("scholarship_id")
        .eq("user_id", user.id);

      const appliedIds = new Set((applications || []).map((a: { scholarship_id: string }) => a.scholarship_id));

      combined.forEach((c) => {
        c.hasApplication = appliedIds.has(c.id);
      });

      // Preserve the swipe order
      combined.sort(
        (a, b) =>
          scholarshipIds.indexOf(a.id) - scholarshipIds.indexOf(b.id)
      );

      setLikedScholarships(combined);
    } catch (err) {
      console.error("Error loading liked scholarships:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWithAI = (opportunity: Opportunity) => {
    setSelectedScholarship(opportunity);
    setShowModal(true);
  };

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
              <h1 className="text-lg font-bold text-white">Saved</h1>
              <p className="text-xs text-zinc-500">
                {likedScholarships.length} opportunity
                {likedScholarships.length !== 1 ? "s" : ""} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            {likedScholarships.length > 0 && (
              <button
                onClick={() => setSortBy(sortBy === "match" ? "deadline" : "match")}
                className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {sortBy === "match" ? "Sort: Best Match" : "Sort: Soonest Deadline"}
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full">
              <Heart className="w-3.5 h-3.5 text-accent-light" />
              <span className="text-xs font-medium text-accent-light">
                {likedScholarships.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : likedScholarships.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            {/* Illustration */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-blue-500/10 rounded-3xl rotate-6" />
              <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center">
                <div className="relative">
                  {/* Tinder-style card stack */}
                  <div className="w-12 h-16 bg-zinc-800 rounded-lg border border-zinc-700 absolute -top-1 -left-1 rotate-[-8deg]" />
                  <div className="w-12 h-16 bg-zinc-800 rounded-lg border border-zinc-700 absolute top-0 left-0 rotate-[-3deg]" />
                  <div className="w-12 h-16 bg-zinc-900 rounded-lg border border-zinc-600 relative flex items-center justify-center">
                    <Heart className="w-5 h-5 text-accent-light" />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Your Match List is Empty
            </h2>
            <p className="text-sm text-zinc-500 mb-2 max-w-xs mx-auto leading-relaxed">
              Swipe right on scholarships that catch your eye.
            </p>
            <p className="text-xs text-zinc-600 mb-8 max-w-xs mx-auto">
              Every right swipe auto-generates your application with AI — no writing required.
            </p>
            <button
              onClick={() => router.push("/swipe")}
              className="px-8 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors inline-flex items-center gap-2 active:scale-[0.98]"
            >
              Start Discovering
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {(sortBy === "deadline"
              ? [...likedScholarships].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              : likedScholarships
            ).map((scholarship, i) => {
              const daysLeft = Math.ceil(
                (new Date(scholarship.deadline).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysLeft > 0 && daysLeft <= 3;

              return (
                <motion.div
                  key={scholarship.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Card header */}
                  <div className="h-32 bg-gradient-to-br from-accent/20 via-accent-dark/10 to-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                    {scholarship.funding_type === "full" && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-[10px] font-semibold text-green-400 backdrop-blur-sm">
                        FULLY FUNDED
                      </span>
                    )}

                    {scholarship.hasApplication && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-accent/20 border border-accent/40 rounded-full text-[10px] font-semibold text-accent-light backdrop-blur-sm">
                        APP READY
                      </span>
                    )}

                    <h2 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white drop-shadow-lg">
                      {scholarship.title}
                    </h2>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {scholarship.provider}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {scholarship.country}
                      </span>
                      {daysLeft > 0 && (
                        <span
                          className={`flex items-center gap-1 ${
                            isUrgent ? "text-red-400" : ""
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {daysLeft} days left
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {scholarship.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-[10px] text-zinc-400 capitalize">
                        {scholarship.level}
                      </span>
                      <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-[10px] text-zinc-400">
                        {scholarship.field}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {scholarship.hasApplication ? (
                        <>
                          {/* Mini checklist */}
                          <div className="w-full mb-2 flex items-center gap-3 text-[10px] text-zinc-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Essay ready
                            </span>
                          </div>
                          <div className="flex items-center gap-2 w-full">
                          <a
                            href={scholarship.application_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-accent rounded-xl text-sm font-medium text-white hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Submit Application
                          </a>
                          <button
                            onClick={() => handleApplyWithAI(scholarship)}
                            className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                            title="Regenerate AI content"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const res = await fetch(`/api/share?title=${encodeURIComponent(scholarship.title)}&provider=${encodeURIComponent(scholarship.provider)}&country=${encodeURIComponent(scholarship.country)}`);
                              const { text } = await res.json();
                              await navigator.clipboard.writeText(text);
                              alert("Copied to clipboard! Share it with friends.");
                            }}
                            className="px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <a
                            href={scholarship.application_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Apply Now
                          </a>
                          <button
                            onClick={() => handleApplyWithAI(scholarship)}
                            className="flex-1 py-2.5 bg-accent rounded-xl text-sm font-medium text-white hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Apply with AI
                      </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {selectedScholarship && (selectedScholarship.type === "job" || selectedScholarship.type === "internship" ? (
        <JobApplyModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedScholarship(null);
          }}
          opportunity={selectedScholarship}
        />
      ) : (
        <ApplicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedScholarship(null);
          }}
          scholarship={selectedScholarship as any}
          userId={user.id}
        />
      ))}
    </div>
  );
}

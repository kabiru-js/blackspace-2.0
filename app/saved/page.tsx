"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { Opportunity } from "@/lib/types";

const ApplicationModal = dynamic(() => import("@/components/ApplicationModal").then((m) => m.ApplicationModal), { ssr: false, loading: () => null });
const JobApplyModal = dynamic(() => import("@/components/JobApplyModal").then((m) => m.JobApplyModal), { ssr: false, loading: () => null });

import { Heart, MapPin, Building2, Clock, Sparkles, ExternalLink, Share2, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface LikedScholarship extends Opportunity {
  swipe_id: string;
  hasApplication: boolean;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

export default function SavedPage() {
  const [likedScholarships, setLikedScholarships] = useState<LikedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"match" | "deadline">("match");
  const [selectedScholarship, setSelectedScholarship] = useState<Opportunity | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { user } = useAppStore();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { if (!user) return; loadLikedScholarships(); }, [user]);

  const loadLikedScholarships = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: swipes } = await supabase.from("swipes").select("*").eq("user_id", user.id).eq("liked", true).order("created_at", { ascending: false });
      const swipesData = swipes as { id: string; scholarship_id: string }[] | null;
      if (!swipesData || swipesData.length === 0) { setLikedScholarships([]); return; }
      const scholarshipIds = swipesData.map((s) => s.scholarship_id);
      const { data: scholarships } = await supabase.from("scholarships").select("*").in("id", scholarshipIds);
      const scholarshipData = scholarships as (Opportunity & { id: string })[] | null;
      if (!scholarshipData) { setLikedScholarships([]); return; }
      const combined: LikedScholarship[] = scholarshipData.map((s) => ({
        ...s,
        swipe_id: swipesData.find((sw) => sw.scholarship_id === s.id)!.id,
        hasApplication: false,
      }));
      const { data: applications } = await supabase.from("applications").select("scholarship_id").eq("user_id", user.id);
      const appliedIds = new Set((applications || []).map((a: any) => a.scholarship_id));
      combined.forEach((c) => { c.hasApplication = appliedIds.has(c.id); });
      combined.sort((a, b) => scholarshipIds.indexOf(a.id) - scholarshipIds.indexOf(b.id));
      setLikedScholarships(combined);
    } catch (err) { console.error("Error loading liked scholarships:", err); }
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const cardBg = { background: "linear-gradient(160deg, var(--card2), var(--card))" };
  const cardBorder = { border: "1px solid var(--line-strong)", borderRadius: "18px" };

  return (
    <div className="min-h-screen" style={{ background: "var(--black)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(5,5,6,.75)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>Saved</h1>
            <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>
              {likedScholarships.length} opportunity{likedScholarships.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {likedScholarships.length > 0 && (
              <button onClick={() => setSortBy(sortBy === "match" ? "deadline" : "match")}
                className="px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--faint)" }}>
                {sortBy === "match" ? "Sort: Best Match" : "Sort: Deadline"}
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: "rgba(214,255,63,.2)", background: "rgba(214,255,63,.06)" }}>
              <Heart className="w-3.5 h-3.5" style={{ color: "var(--lime)" }} />
              <span className="text-xs font-medium" style={{ ...mono, color: "var(--lime)" }}>{likedScholarships.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--lime)" }} />
          </div>
        ) : likedScholarships.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-3xl rotate-6" style={{ background: "linear-gradient(135deg, rgba(214,255,63,.1), rgba(42,245,207,.05))" }} />
              <div className="absolute inset-0 rounded-3xl flex items-center justify-center" style={{ ...cardBg, ...cardBorder }}>
                <div className="relative">
                  <div className="w-12 h-16 rounded-lg border absolute -top-1 -left-1 rotate-[-8deg]" style={{ background: "var(--card)", borderColor: "var(--line-strong)" }} />
                  <div className="w-12 h-16 rounded-lg border absolute top-0 left-0 rotate-[-3deg]" style={{ background: "var(--card)", borderColor: "var(--line-strong)" }} />
                  <div className="w-12 h-16 rounded-lg border relative flex items-center justify-center" style={{ background: "var(--card2)", borderColor: "var(--lime)" }}>
                    <Heart className="w-5 h-5" style={{ color: "var(--lime)" }} />
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ ...display, color: "var(--text)" }}>Nothing saved yet</h2>
            <p className="text-sm mb-2 max-w-xs mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>Start exploring and save opportunities you like.</p>
            <p className="text-xs mb-8 max-w-xs mx-auto" style={{ color: "var(--faint)" }}>Every right swipe auto-generates your application with AI.</p>
            <button onClick={() => router.push("/swipe")} className="btn btn-primary" style={{ padding: "12px 24px" }}>
              Start Discovering <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {(sortBy === "deadline"
              ? [...likedScholarships].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
              : likedScholarships
            ).map((scholarship, i) => {
              const daysLeft = Math.ceil((new Date(scholarship.deadline).getTime() - Date.now()) / 86400000);
              const isUrgent = daysLeft > 0 && daysLeft <= 3;

              return (
                <motion.div key={scholarship.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden transition-colors" style={{ ...cardBg, ...cardBorder }}>
                  {/* Gradient header */}
                  <div className="h-28 relative overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(214,255,63,.08), rgba(42,245,207,.04), transparent)" }}>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--card2), transparent)" }} />
                    {scholarship.funding_type === "full" && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "rgba(26,174,57,.3)", color: "var(--lime)", background: "rgba(26,174,57,.08)" }}>
                        Fully Funded
                      </span>
                    )}
                    {scholarship.hasApplication && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "rgba(214,255,63,.25)", color: "var(--lime)", background: "rgba(214,255,63,.08)" }}>
                        App Ready
                      </span>
                    )}
                    <h2 className="absolute bottom-3 left-4 right-4 text-lg font-bold" style={{ ...display, color: "var(--text)" }}>
                      {scholarship.title}
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ ...mono, color: "var(--faint)" }}>
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{scholarship.provider}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{scholarship.country}</span>
                      {daysLeft > 0 && (
                        <span className="flex items-center gap-1" style={isUrgent ? { color: "var(--magenta)" } : {}}>
                          <Clock className="w-3.5 h-3.5" />{daysLeft}d left
                        </span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2" style={{ color: "var(--muted)" }}>{scholarship.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", color: "var(--faint)" }}>{scholarship.level}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", color: "var(--faint)" }}>{scholarship.field}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {scholarship.hasApplication ? (
                        <div className="flex items-center gap-2 w-full">
                          <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer"
                            className="flex-1 btn btn-primary justify-center" style={{ padding: "10px 16px", fontSize: "12px" }}>
                            <ExternalLink className="w-3.5 h-3.5" /> Submit
                          </a>
                          <button onClick={() => { setSelectedScholarship(scholarship); setShowModal(true); }}
                            className="px-3 py-2.5 rounded-full border text-sm flex items-center justify-center transition-colors"
                            style={{ background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}
                            title="Regenerate AI content">
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={async () => {
                            const res = await fetch(`/api/share?title=${encodeURIComponent(scholarship.title)}&provider=${encodeURIComponent(scholarship.provider)}&country=${encodeURIComponent(scholarship.country)}`);
                            const { text } = await res.json();
                            await navigator.clipboard.writeText(text);
                            alert("Copied to clipboard!");
                          }}
                            className="px-3 py-2.5 rounded-full border text-sm flex items-center justify-center transition-colors"
                            style={{ background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}
                            title="Share">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer"
                            className="flex-1 py-2.5 rounded-full border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                            style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--muted)" }}>
                            <ExternalLink className="w-3.5 h-3.5" /> Apply Now
                          </a>
                          <button onClick={() => { setSelectedScholarship(scholarship); setShowModal(true); }}
                            className="flex-1 btn btn-primary justify-center" style={{ padding: "10px 16px", fontSize: "12px" }}>
                            <Sparkles className="w-3.5 h-3.5" /> Apply with AI
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedScholarship && (selectedScholarship.type === "job" || selectedScholarship.type === "internship" ? (
        <JobApplyModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedScholarship(null); }} opportunity={selectedScholarship} />
      ) : (
        <ApplicationModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedScholarship(null); }} scholarship={selectedScholarship as any} userId={user.id} />
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, CheckCircle2, Copy, Edit3, Save, Briefcase, Zap, User, ArrowLeftRight, Info, AlertTriangle, TrendingUp, Repeat } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { Opportunity } from "@/lib/types";
import { useAppStore } from "@/lib/store";

type Tone = "professional" | "confident" | "friendly";

const TONES: { value: Tone; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "professional", label: "Professional", description: "Polished and traditional", icon: <Briefcase className="w-4 h-4" /> },
  { value: "confident", label: "Confident", description: "Bold and self-assured", icon: <Zap className="w-4 h-4" /> },
  { value: "friendly", label: "Friendly", description: "Warm and approachable", icon: <User className="w-4 h-4" /> },
];

const REFINE_OPTIONS = [
  { label: "Make it shorter", instruction: "Rewrite this to be significantly shorter and more concise.", icon: "✂️" },
  { label: "More confident", instruction: "Rewrite this with more confidence and conviction.", icon: "💪" },
  { label: "Focus on skills", instruction: "Rewrite to emphasize specific skills.", icon: "🎯" },
  { label: "More personal", instruction: "Rewrite with more personality.", icon: "✨" },
];

const LOADING_STEPS = ["Analyzing job requirements...", "Matching your skills...", "Writing your introduction...", "Aligning with company culture...", "Polishing final draft..."];

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };
const cardBg = { background: "linear-gradient(160deg, var(--card2), var(--card))" };
const inputStyle = { background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--text)", fontFamily: "'JetBrains Mono', monospace" };

interface JobApplyModalProps { isOpen: boolean; onClose: () => void; opportunity: Opportunity; }

export function JobApplyModal({ isOpen, onClose, opportunity }: JobApplyModalProps) {
  const { user } = useAppStore();
  const [step, setStep] = useState<"preview" | "generating" | "review" | "saved">("preview");
  const [tone, setTone] = useState<Tone>(() => (typeof window !== "undefined" ? (localStorage.getItem("bs_preferred_tone") as Tone) || "professional" : "professional"));
  const [letter, setLetter] = useState(""); const [letterB, setLetterB] = useState("");
  const [activeVariant, setActiveVariant] = useState<"A" | "B">("A");
  const [editing, setEditing] = useState(false); const [editedLetter, setEditedLetter] = useState("");
  const [copied, setCopied] = useState(false); const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0); const [appCount, setAppCount] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const supabase = createClient();

  const extractJobSkills = () => {
    const desc = opportunity.description + " " + (opportunity.requirements || "");
    const lower = desc.toLowerCase();
    const commonTools = ["react","typescript","python","java","node","aws","docker","kubernetes","figma","sql","graphql","rust","go","swift","kotlin","excel","tableau","power bi","terraform","jenkins"];
    const tools = commonTools.filter((t) => lower.includes(t));
    const skillWords = desc.match(/\b(\w+)\b/g) || [];
    const stopWords = new Set(["the","and","for","with","you","are","our","your","will","have","from","this","that","work","role","team"]);
    const keywords = [...new Set(skillWords.filter((w) => w.length > 4 && !stopWords.has(w)).slice(0, 5))];
    return { skills: keywords, tools, isFormal: !/casual|chill|relaxed|fun|vibe/i.test(desc) };
  };

  const jobIntel = extractJobSkills();
  const userSkillNames = (user?.skills || []).map((s) => s.toLowerCase());
  const missingSkills = jobIntel.tools.filter((t) => !userSkillNames.includes(t)).slice(0, 3);
  const matchingSkills = jobIntel.tools.filter((t) => userSkillNames.includes(t));

  const matchBreakdown = [
    { label: "Skills match", score: matchingSkills.length, max: Math.max(jobIntel.tools.length, 1) },
    { label: "Experience level", score: opportunity.level === user?.level ? 1 : 0, max: 1 },
    { label: "Location", score: (opportunity.is_remote || opportunity.country === user?.country) ? 1 : 0, max: 1 },
  ];
  const totalMatch = Math.round((matchBreakdown.reduce((s, b) => s + b.score, 0) / matchBreakdown.reduce((s, b) => s + b.max, 0)) * 100);

  useEffect(() => { if (!isOpen || !user) return; setAppCount(parseInt(localStorage.getItem(`bs_app_count_${user.id}`) || "0")); }, [isOpen, user]);

  useEffect(() => { if (step !== "generating") return; const i = setInterval(() => { setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length); }, 1500); return () => clearInterval(i); }, [step]);

  const callAPI = async (customPrompt: string): Promise<string> => {
    const res = await fetch("/api/cover-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobTitle: opportunity.title, company: opportunity.provider, description: opportunity.description, userName: user?.full_name, skills: user?.skills || opportunity.skills, experienceLevel: user?.experience_level || "experienced", achievements: user?.goals, tone, prompt: customPrompt }) });
    const data = await res.json(); return data.letter || data.error || "Failed to generate";
  };

  const handleGenerate = async () => {
    setStep("generating"); setLoadingStep(0); setError(null);
    try {
      const [letterA, letterBResult] = await Promise.all([callAPI("professional cover letter"), callAPI("cover letter with varied opening")]);
      setLetter(letterA); setLetterB(letterBResult); setActiveVariant("A"); setEditedLetter(letterA); setStep("review");
    } catch (err: any) { setError(err.message); setStep("preview"); }
  };

  const handleSave = async () => {
    try {
      await (supabase as any).from("applications").insert({ user_id: user?.id, scholarship_id: opportunity.id, status: "draft", generated_essay: editing ? editedLetter : getActiveLetter() });
      if (user) { const nc = appCount + 1; localStorage.setItem(`bs_app_count_${user.id}`, String(nc)); setAppCount(nc); }
      localStorage.setItem("bs_preferred_tone", tone);
      setStep("saved");
    } catch { setError("Failed to save."); }
  };

  const getActiveLetter = () => activeVariant === "A" ? letter : letterB;
  const handleCopy = async () => { await navigator.clipboard.writeText(editing ? editedLetter : getActiveLetter()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const switchVariant = () => { const nv = activeVariant === "A" ? "B" : "A"; setActiveVariant(nv); setEditedLetter(nv === "A" ? letter : letterB); };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50" style={{ background: "rgba(5,5,6,.85)", backdropFilter: "blur(8px)" }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[22px]"
        style={{ ...cardBg, border: "1px solid var(--line-strong)" }}>
        {/* Header */}
        <div className="sticky top-0 p-4 flex items-center justify-between z-10 border-b rounded-t-[22px]" style={{ background: "rgba(5,5,6,.85)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
          <div>
            <h2 className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>Apply with AI</h2>
            <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>{opportunity.title} at {opportunity.provider}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--faint)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && <div className="p-3 rounded-2xl border text-sm" style={{ background: "rgba(255,46,159,.06)", borderColor: "rgba(255,46,159,.15)", color: "var(--magenta)", ...mono }}>{error}</div>}

          {/* Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--lime)", ...mono }}><Briefcase className="w-4 h-4" />Job Details</div>
                <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{opportunity.title}</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{opportunity.provider} · {opportunity.country}</p>
                <p className="text-xs line-clamp-2" style={{ color: "var(--faint)" }}>{opportunity.description}</p>
              </div>
              <div className="rounded-2xl p-4 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                <p className="text-sm font-semibold" style={{ ...display, color: "var(--text)" }}>Your Profile</p>
                <p className="text-xs" style={{ color: "var(--muted)" }}>{user?.full_name} · {user?.experience_level || user?.level} · {user?.field_of_study}</p>
                {(user?.skills?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(user?.skills || []).slice(0, 5).map((s) => <span key={s} className="px-2 py-0.5 rounded-full text-[10px]" style={{ ...mono, background: "var(--card2)", color: "var(--faint)", border: "1px solid var(--line)" }}>{s}</span>)}
                  </div>
                )}
              </div>
              {/* Tone */}
              <div className="space-y-2">
                <p className="text-sm font-semibold" style={{ ...display, color: "var(--text)" }}>Tone</p>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button key={t.value} onClick={() => { setTone(t.value); localStorage.setItem("bs_preferred_tone", t.value); }}
                      className="py-3 px-2 rounded-2xl text-xs font-medium border transition-all flex flex-col items-center gap-1"
                      style={{ ...mono, background: tone === t.value ? "rgba(214,255,63,.08)" : "var(--card)", borderColor: tone === t.value ? "rgba(214,255,63,.25)" : "var(--line-strong)", color: tone === t.value ? "var(--lime)" : "var(--faint)" }}>
                      {t.icon}{t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px]" style={{ ...mono, color: "var(--faint)" }}>{TONES.find((t) => t.value === tone)?.description}</p>
              </div>
              {/* Match */}
              <div className="rounded-2xl p-3 space-y-2" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ ...mono, color: "var(--muted)" }}>Match</span>
                  <span className="text-xs font-bold" style={{ ...mono, color: totalMatch >= 60 ? "var(--lime)" : "var(--faint)" }}>{totalMatch}%</span>
                </div>
                {matchBreakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-[10px] w-24" style={{ ...mono, color: "var(--faint)" }}>{b.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(b.score / b.max) * 100}%`, background: b.score > 0 ? "var(--lime)" : "var(--line-strong)" }} />
                    </div>
                  </div>
                ))}
              </div>
              {missingSkills.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border" style={{ background: "rgba(255,122,69,.06)", borderColor: "rgba(255,122,69,.15)" }}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--orange)" }} />
                  <span className="text-[10px]" style={{ color: "var(--orange)", ...mono }}>May be missing: {missingSkills.join(", ")}</span>
                </div>
              )}
              <button onClick={() => handleGenerate()} className="btn btn-primary w-full justify-center" style={{ padding: "12px 0" }}>
                <Sparkles className="w-4 h-4" /> Generate Cover Letter
              </button>
            </div>
          )}

          {/* Generating */}
          {step === "generating" && (
            <div className="py-8 space-y-6">
              <div className="space-y-3">
                {LOADING_STEPS.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0.2 }} animate={{ opacity: i <= loadingStep ? 1 : 0.2 }} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: i <= loadingStep ? "var(--lime)" : "var(--line-strong)" }} />
                    <span className="text-sm" style={{ color: i <= loadingStep ? "var(--text)" : "var(--faint)" }}>{msg}</span>
                    {i === loadingStep && <Loader2 className="w-3 h-3 animate-spin ml-auto" style={{ color: "var(--lime)" }} />}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Review */}
          {step === "review" && (
            <div className="space-y-4">
              {letterB && (
                <div className="flex items-center gap-2">
                  <button onClick={switchVariant} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors"
                    style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--muted)" }}>
                    <ArrowLeftRight className="w-3.5 h-3.5" /> Version {activeVariant === "A" ? "B" : "A"}
                  </button>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: activeVariant === "A" ? "var(--lime)" : "var(--line-strong)" }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: activeVariant === "B" ? "var(--lime)" : "var(--line-strong)" }} />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {editing ? (
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ ...mono, background: "rgba(214,255,63,.08)", border: "1px solid rgba(214,255,63,.15)", color: "var(--lime)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Done
                  </button>
                ) : (
                  <button onClick={() => { setEditing(true); setEditedLetter(getActiveLetter()); }} className="px-3 py-1.5 rounded-full border text-xs font-medium" style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}>
                    <Edit3 className="w-3.5 h-3.5 inline mr-1" />Edit
                  </button>
                )}
                <button onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors`}
                  style={{ ...mono, background: copied ? "rgba(26,174,57,.08)" : "var(--card)", border: `1px solid ${copied ? "rgba(26,174,57,.15)" : "var(--line-strong)"}`, color: copied ? "var(--lime)" : "var(--faint)" }}>
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Copied!</> : <><Copy className="w-3.5 h-3.5 inline mr-1" />Copy</>}
                </button>
              </div>
              <motion.div key={activeVariant} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 max-h-[300px] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
                {editing ? (
                  <textarea value={editedLetter} onChange={(e) => setEditedLetter(e.target.value)}
                    className="w-full rounded-xl p-3 text-sm min-h-[280px] whitespace-pre-wrap leading-relaxed resize-none outline-none" style={inputStyle} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--muted)" }}>{getActiveLetter()}</p>
                )}
              </motion.div>
              <div className="grid grid-cols-2 gap-1.5">
                {REFINE_OPTIONS.map((opt) => (
                  <button key={opt.label} onClick={() => callAPI(opt.instruction).then(r => { if (activeVariant === "A") setLetter(r); else setLetterB(r); setEditedLetter(r); })}
                    className="px-3 py-2 rounded-full border text-xs transition-all text-left"
                    style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}>
                    <span className="mr-1">{opt.icon}</span>{opt.label}
                  </button>
                ))}
              </div>
              <button onClick={handleSave} className="btn btn-primary w-full justify-center" style={{ padding: "12px 0" }}>
                <Save className="w-4 h-4" /> Save Application
              </button>
            </div>
          )}

          {/* Saved */}
          {step === "saved" && (
            <div className="text-center py-8 space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: "rgba(26,174,57,.08)", border: "1px solid rgba(26,174,57,.15)" }}>
                <CheckCircle2 className="w-8 h-8" style={{ color: "var(--lime)" }} />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold" style={{ ...display, color: "var(--text)" }}>Application Ready</h3>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>You can now apply directly</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>{appCount}</p>
                  <p className="text-[10px]" style={{ ...mono, color: "var(--faint)" }}>applications generated</p>
                </div>
              </div>
              <a href={opportunity.application_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex" style={{ padding: "12px 24px" }}>
                Apply Now
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

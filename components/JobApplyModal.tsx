"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Loader2, CheckCircle2, Copy, Edit3, Save, Briefcase,
  Zap, User, Target, ArrowLeftRight, Info, AlertTriangle, TrendingUp, Repeat,
} from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { Opportunity } from "@/lib/types";
import { useAppStore } from "@/lib/store";

interface JobApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
}

type Tone = "professional" | "confident" | "friendly";

const TONES: { value: Tone; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "professional", label: "Professional", description: "Polished and traditional", icon: <Briefcase className="w-4 h-4" /> },
  { value: "confident", label: "Confident", description: "Bold and self-assured", icon: <Zap className="w-4 h-4" /> },
  { value: "friendly", label: "Friendly", description: "Warm and approachable", icon: <User className="w-4 h-4" /> },
];

const REFINE_OPTIONS = [
  { label: "Make it shorter", instruction: "Rewrite this to be significantly shorter and more concise. Cut unnecessary words.", icon: "✂️" },
  { label: "More confident", instruction: "Rewrite this with more confidence and conviction. Use stronger language.", icon: "💪" },
  { label: "Focus on skills", instruction: "Rewrite this to emphasize specific skills and technical abilities more prominently.", icon: "🎯" },
  { label: "More personal", instruction: "Rewrite with more personality and personal anecdotes. Make it warmer and more human.", icon: "✨" },
];

const LOADING_STEPS = [
  "Analyzing job requirements...",
  "Matching your skills...",
  "Writing your introduction...",
  "Aligning with company culture...",
  "Polishing final draft...",
];

export function JobApplyModal({ isOpen, onClose, opportunity }: JobApplyModalProps) {
  const { user } = useAppStore();
  const [step, setStep] = useState<"preview" | "generating" | "review" | "saved">("preview");
  const [tone, setTone] = useState<Tone>(() => {
    // Load preferred tone from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("bs_preferred_tone") : null;
    return (saved as Tone) || "professional";
  });
  const [letter, setLetter] = useState("");
  const [letterB, setLetterB] = useState(""); // Variant B
  const [activeVariant, setActiveVariant] = useState<"A" | "B">("A");
  const [editing, setEditing] = useState(false);
  const [editedLetter, setEditedLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const supabase = createClient();

  // Extract skills from job description
  const extractJobSkills = (): { skills: string[]; tools: string[]; isFormal: boolean } => {
    const desc = opportunity.description + " " + (opportunity.requirements || "");
    const lower = desc.toLowerCase();
    const commonTools = ["react", "typescript", "python", "java", "node", "aws", "docker", "kubernetes", "figma", "sql", "graphql", "rust", "go", "swift", "kotlin", "excel", "tableau", "power bi", "terraform", "jenkins"];
    const tools = commonTools.filter((t) => lower.includes(t));
    const skillWords = desc.match(/\b(\w+)\b/g) || [];
    const stopWords = new Set(["the", "and", "for", "with", "you", "are", "our", "your", "will", "have", "from", "this", "that", "work", "role", "team"]);
    const keywords = [...new Set(skillWords.filter((w) => w.length > 4 && !stopWords.has(w)).slice(0, 5))];
    const isFormal = !/casual|chill|relaxed|fun|vibe/i.test(desc);
    return { skills: keywords, tools, isFormal };
  };

  const jobIntel = extractJobSkills();

  // Skill gap detection
  const userSkillNames = (user?.skills || []).map((s) => s.toLowerCase());
  const missingSkills = jobIntel.tools.filter((t) => !userSkillNames.includes(t)).slice(0, 3);
  const matchingSkills = jobIntel.tools.filter((t) => userSkillNames.includes(t));

  // Match score breakdown
  const computeMatchBreakdown = () => {
    const breakdown: { label: string; score: number; max: number }[] = [];
    if (matchingSkills.length > 0) breakdown.push({ label: "Skills match", score: matchingSkills.length, max: Math.max(jobIntel.tools.length, 1) });
    else breakdown.push({ label: "Skills match", score: 0, max: Math.max(jobIntel.tools.length, 1) });
    breakdown.push({ label: "Experience level", score: opportunity.level === user?.level ? 1 : 0, max: 1 });
    const isRemoteMatch = opportunity.is_remote && (user?.preferred_countries || []).length > 0;
    breakdown.push({ label: "Location", score: isRemoteMatch || opportunity.country === user?.country ? 1 : 0, max: 1 });
    return breakdown;
  };

  const matchBreakdown = computeMatchBreakdown();
  const totalMatch = Math.round((matchBreakdown.reduce((s, b) => s + b.score, 0) / matchBreakdown.reduce((s, b) => s + b.max, 0)) * 100);

  // Generate "why this works" insights
  const getWhyItWorks = (): string[] => {
    const insights: string[] = [];
    if (matchingSkills.length > 0) {
      insights.push(`Highlights your ${matchingSkills.slice(0, 3).join(", ")} skills relevant to the role`);
    }
    if (tone === "confident") insights.push("Uses confident tone suited for experienced professionals");
    if (tone === "friendly") insights.push("Warm, approachable tone that fits collaborative team cultures");
    if (opportunity.is_remote) insights.push("Aligned with remote-first job requirements");
    if (jobIntel.isFormal) insights.push("Matches the formal tone of the job description");
    if (missingSkills.length > 0) {
      insights.push(`Acknowledges ${missingSkills.slice(0, 2).join(", ")} as growth areas, showing self-awareness`);
    }
    if (insights.length === 0) insights.push("Tailored specifically to the role and your experience");
    return insights;
  };

  // Load saved app count
  useEffect(() => {
    if (!isOpen || !user) return;
    const count = parseInt(localStorage.getItem(`bs_app_count_${user.id}`) || "0");
    setAppCount(count);
  }, [isOpen, user]);

  // Progressive loading animation
  useEffect(() => {
    if (step !== "generating") return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  const buildPrompt = (
    base: { jobTitle: string; company: string; description: string },
    userData: { name: string; skills: string[]; level: string; achievements: string },
    selectedTone: Tone,
    extraInstruction?: string
  ) => {
    const toneMap: Record<string, string> = {
      professional: "Formal, polished, business-appropriate.",
      confident: "Bold and self-assured. Strong conviction, no arrogance.",
      friendly: "Warm, approachable, conversational yet professional.",
    };

    const jobKeywords = jobIntel.tools.length > 0
      ? `The job mentions these tools/tech: ${jobIntel.tools.join(", ")}. MUST reference at least 2 of them naturally in the letter.`
      : "";

    const skillGapNote = missingSkills.length > 0
      ? `The candidate may be missing: ${missingSkills.join(", ")}. If relevant, briefly mention adjacent experience or eagerness to learn. Don't over-apologize.`
      : "";

    const structureVariation = Math.random() > 0.5
      ? "Start with a compelling achievement or insight, not an introduction."
      : "Open with a direct statement about the company's work and why it resonates.";

    return `Write a concise, human-sounding cover letter. Vary your structure — do NOT use predictable patterns.

Role: ${base.jobTitle}
Company: ${base.company}
Description: ${base.description || "Not provided"}
Candidate: ${userData.name}
Skills: ${userData.skills.join(", ") || "Relevant skills"}
Experience: ${userData.level}
Achievements: ${userData.achievements || "Track record of delivering results"}
Tone: ${toneMap[selectedTone]}
${jobKeywords}
${skillGapNote}
${extraInstruction ? `ADDITIONAL INSTRUCTION: ${extraInstruction}` : ""}

CRITICAL RULES:
- ${structureVariation}
- 3-5 paragraphs MAX, tight and impactful
- NEVER use "I am writing to apply for..."
- Reference the specific company and role by name
- Connect skills to VALUE, not just list them
- End with a clear, confident closing — no "I hope to hear from you"
- Sound like a real person, not AI spam
- Start with "Dear Hiring Team," or "Dear ${base.company} Team,"

Write the cover letter:`;
  };

  const callAPI = async (customPrompt: string): Promise<string> => {
    const res = await fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: opportunity.title,
        company: opportunity.provider,
        description: opportunity.description,
        userName: user?.full_name,
        skills: user?.skills || opportunity.skills,
        experienceLevel: user?.experience_level || "experienced",
        achievements: user?.goals,
        tone,
        prompt: customPrompt,
      }),
    });
    const data = await res.json();
    return data.letter || data.error || "Failed to generate";
  };

  const handleGenerate = async (extraInstruction?: string) => {
    setStep("generating");
    setLoadingStep(0);
    setError(null);

    try {
      if (!extraInstruction) {
        // First generation: generate two variants
        const promptA = buildPrompt(
          { jobTitle: opportunity.title, company: opportunity.provider, description: opportunity.description },
          { name: user?.full_name || "", skills: user?.skills || [], level: user?.experience_level || "experienced", achievements: user?.goals || "" },
          tone
        );

        // Variant B with slightly different instructions
        const promptB = buildPrompt(
          { jobTitle: opportunity.title, company: opportunity.provider, description: opportunity.description },
          { name: user?.full_name || "", skills: user?.skills || [], level: user?.experience_level || "experienced", achievements: user?.goals || "" },
          tone,
          "Use a slightly different opening and structure. Vary the paragraph flow."
        );

        const [letterA, letterBResult] = await Promise.all([callAPI(promptA), callAPI(promptB)]);
        setLetter(letterA);
        setLetterB(letterBResult);
        setActiveVariant("A");
      } else {
        // Refinement: regenerate current variant with instruction
        const currentLetter = activeVariant === "A" ? letter : letterB;
        const prompt = buildPrompt(
          { jobTitle: opportunity.title, company: opportunity.provider, description: opportunity.description },
          { name: user?.full_name || "", skills: user?.skills || [], level: user?.experience_level || "experienced", achievements: user?.goals || "" },
          tone,
          `${extraInstruction}\n\nHere is the current letter for reference:\n${currentLetter}`
        );

        const refined = await callAPI(prompt);
        if (activeVariant === "A") {
          setLetter(refined);
        } else {
          setLetterB(refined);
        }
      }

      setEditedLetter(activeVariant === "A" ? letter : letterB);
      setStep("review");
    } catch (err: any) {
      setError(err.message || "Generation failed");
      setStep("preview");
    }
  };

  const handleSave = async () => {
    const content = editing ? editedLetter : getActiveLetter();
    try {
      await (supabase as any).from("applications").insert({
        user_id: user?.id,
        scholarship_id: opportunity.id,
        status: "draft",
        generated_essay: content,
      });

      // Track count
      if (user) {
        const newCount = appCount + 1;
        localStorage.setItem(`bs_app_count_${user.id}`, String(newCount));
        setAppCount(newCount);
      }
      // Save tone preference
      localStorage.setItem("bs_preferred_tone", tone);

      setStep("saved");
    } catch (err: any) {
      setError("Failed to save. Please try again.");
    }
  };

  const getActiveLetter = () => activeVariant === "A" ? letter : letterB;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editing ? editedLetter : getActiveLetter());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const switchVariant = () => {
    const newVariant = activeVariant === "A" ? "B" : "A";
    setActiveVariant(newVariant);
    setEditedLetter(newVariant === "A" ? letter : letterB);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-zinc-900 border border-zinc-800"
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">Apply with AI</h2>
            <p className="text-xs text-zinc-400">{opportunity.title} at {opportunity.provider}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>
          )}

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-accent-light text-sm font-semibold">
                  <Briefcase className="w-4 h-4" />
                  Job Details
                </div>
                <p className="text-sm text-white font-medium">{opportunity.title}</p>
                <p className="text-xs text-zinc-400">{opportunity.provider} · {opportunity.country}</p>
                <p className="text-xs text-zinc-500 line-clamp-2">{opportunity.description}</p>
              </div>

              <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-white">Your Profile</p>
                <p className="text-xs text-zinc-400">
                  {user?.full_name} · {user?.experience_level || user?.level} · {user?.field_of_study}
                </p>
                {(user?.skills?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(user?.skills || []).slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-zinc-700 rounded text-[10px] text-zinc-300">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tone selector */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Tone</p>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setTone(t.value); localStorage.setItem("bs_preferred_tone", t.value); }}
                      className={`py-3 px-2 rounded-xl text-xs font-medium border transition-all flex flex-col items-center gap-1 ${
                        tone === t.value
                          ? "bg-accent/20 border-accent/50 text-accent-light"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500">{TONES.find((t) => t.value === tone)?.description}</p>
              </div>

              {/* Match breakdown */}
              <div className="bg-zinc-800/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Match</span>
                  <span className={`text-xs font-bold ${totalMatch >= 60 ? "text-green-400" : totalMatch >= 30 ? "text-amber-400" : "text-zinc-400"}`}>
                    {totalMatch}%
                  </span>
                </div>
                {matchBreakdown.map((b) => (
                  <div key={b.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 w-24">{b.label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${b.score > 0 ? "bg-accent-light" : "bg-zinc-600"}`} style={{ width: `${(b.score / b.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill gap warning */}
              {missingSkills.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="text-[10px] text-amber-300">
                    You may be missing: {missingSkills.join(", ")}. The AI will address this.
                  </span>
                </div>
              )}

              {/* Trust indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/30 rounded-lg">
                <Sparkles className="w-3.5 h-3.5 text-accent-light" />
                <span className="text-[10px] text-zinc-500">AI-assisted, editable · Tailored to this role</span>
              </div>

              <button
                onClick={() => handleGenerate()}
                className="w-full py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Cover Letter
              </button>
            </div>
          )}

          {/* Step: Generating */}
          {step === "generating" && (
            <div className="py-8 space-y-6">
              <div className="space-y-3">
                {LOADING_STEPS.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: i <= loadingStep ? 1 : 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-2 h-2 rounded-full ${i <= loadingStep ? "bg-accent-light" : "bg-zinc-700"}`} />
                    <span className={`text-sm ${i <= loadingStep ? "text-zinc-300" : "text-zinc-600"}`}>{msg}</span>
                    {i === loadingStep && (
                      <Loader2 className="w-3 h-3 text-accent-light animate-spin ml-auto" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-4">
              {/* Variant toggle */}
              {letterB && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={switchVariant}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Version {activeVariant === "A" ? "B" : "A"}
                  </button>
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${activeVariant === "A" ? "bg-accent-light" : "bg-zinc-600"}`} />
                    <div className={`w-2 h-2 rounded-full ${activeVariant === "B" ? "bg-accent-light" : "bg-zinc-600"}`} />
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-2">
                {editing ? (
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1.5 bg-accent/20 text-accent-light rounded-lg text-xs font-medium hover:bg-accent/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                    Done
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditing(true); setEditedLetter(getActiveLetter()); }}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700"
                  >
                    <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                    Edit
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {copied ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5 inline mr-1" />Copy</>
                  )}
                </button>
              </div>

              {/* Letter */}
              <motion.div
                key={activeVariant}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-800/50 rounded-xl p-4 max-h-[300px] overflow-y-auto"
              >
                {editing ? (
                  <textarea
                    value={editedLetter}
                    onChange={(e) => setEditedLetter(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 focus:outline-none focus:border-accent/50 min-h-[280px] whitespace-pre-wrap font-sans leading-relaxed resize-none"
                  />
                ) : (
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {getActiveLetter()}
                  </p>
                )}
              </motion.div>

              {/* Refine options */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-medium">Refine this version:</p>
                  <button
                    onClick={() => handleGenerate("Tighten the wording. Remove any fluff or filler. Increase clarity and impact. Make every sentence earn its place. Use stronger, more specific language throughout.")}
                    className="px-2.5 py-1 bg-accent/10 border border-accent/20 rounded text-[10px] text-accent-light font-medium hover:bg-accent/20 transition-colors flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    Make stronger
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {REFINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleGenerate(opt.instruction)}
                      className="px-3 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-left"
                    >
                      <span className="mr-1">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Why this works */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowWhy(!showWhy)}
                  className="w-full px-3 py-2 flex items-center justify-between bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info className="w-3.5 h-3.5 text-accent-light" />
                    Why this works
                  </span>
                  <span className="text-[10px] text-zinc-500">{showWhy ? "−" : "+"}</span>
                </button>
                {showWhy && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="px-3 py-2 space-y-1.5"
                  >
                    {getWhyItWorks().map((insight, i) => (
                      <p key={i} className="text-[10px] text-zinc-400 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-accent-light mt-0.5 flex-shrink-0" />
                        {insight}
                      </p>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Reuse engine */}
              <button
                onClick={() => {
                  handleGenerate(
                    `Rewrite this letter for a different company and role with a SIMILAR profile. Keep the structure and core strengths, but change:
- Company name and role
- Any company-specific references
- Slightly vary the opening
Maintain the same level of quality and personalization.`
                  );
                }}
                className="w-full py-2 bg-zinc-800/30 border border-zinc-700/30 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all flex items-center justify-center gap-1.5"
              >
                <Repeat className="w-3 h-3" />
                Reuse this structure for similar jobs
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                Save Application
              </button>
            </div>
          )}

          {/* Step: Saved */}
          {step === "saved" && (
            <div className="text-center py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-white">Application Ready</h3>
                <p className="text-sm text-zinc-400 mt-1">You can now apply directly</p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{appCount}</p>
                  <p className="text-[10px] text-zinc-500">applications generated</p>
                </div>
                {appCount >= 3 && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-accent-light">{appCount}</p>
                    <p className="text-[10px] text-zinc-500">ready to submit</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <a
                  href={opportunity.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors flex items-center gap-1.5"
                >
                  Open Application Link
                  <ExternalLinkIcon />
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

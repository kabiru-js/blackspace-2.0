"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { User, OpportunityCategory } from "@/lib/types";
import { inferIntents } from "@/lib/matching";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles, X } from "lucide-react";
import { track } from "@/lib/analytics";

const COUNTRIES = ["United Kingdom","United States","Germany","Canada","Australia","France","Netherlands","Japan","South Korea","Singapore","Sweden","Switzerland","Italy","Spain","Norway","Denmark","Brazil","India","Nigeria","Kenya","South Africa","Ghana","Egypt","Mexico"];

// ── Suggestion engine ────────────────────────────────────

interface Suggestion {
  key: string;
  label: string;
  icon: string;
  category: OpportunityCategory;
  type: string;
}

const ALL_SUGGESTIONS: Suggestion[] = [
  { key: "art_schools", label: "Art schools", icon: "🎨", category: "academic", type: "scholarship" },
  { key: "creative_grants", label: "Creative grants", icon: "💰", category: "creative", type: "grant" },
  { key: "design_internships", label: "Design internships", icon: "🚀", category: "creative", type: "internship" },
  { key: "exhibitions", label: "Exhibitions & residencies", icon: "🏛️", category: "creative", type: "creative_call" },
  { key: "football_trials", label: "Football trials", icon: "⚽", category: "athletic", type: "athletic_trial" },
  { key: "sports_scholarships", label: "Sports scholarships", icon: "🏅", category: "athletic", type: "scholarship" },
  { key: "athletic_programs", label: "Athletic programs", icon: "🏃", category: "athletic", type: "athletic_trial" },
  { key: "tech_internships", label: "Tech internships", icon: "💻", category: "career", type: "internship" },
  { key: "software_jobs", label: "Software jobs", icon: "👨‍💻", category: "career", type: "job" },
  { key: "coding_bootcamps", label: "Coding bootcamps", icon: "🖥️", category: "academic", type: "scholarship" },
  { key: "business_grants", label: "Business grants", icon: "📊", category: "career", type: "grant" },
  { key: "startup_funding", label: "Startup funding", icon: "🚀", category: "career", type: "grant" },
  { key: "mba_programs", label: "MBA programs", icon: "🎓", category: "academic", type: "fellowship" },
  { key: "scholarships", label: "Scholarships", icon: "🎓", category: "academic", type: "scholarship" },
  { key: "fellowships", label: "Fellowships", icon: "📚", category: "academic", type: "fellowship" },
  { key: "academic_programs", label: "Academic programs", icon: "🏫", category: "academic", type: "scholarship" },
  { key: "remote_jobs", label: "Remote jobs", icon: "🏠", category: "career", type: "job" },
  { key: "remote_internships", label: "Remote internships", icon: "🌍", category: "career", type: "internship" },
  { key: "creative_gigs", label: "Creative gigs", icon: "🎨", category: "creative", type: "creative_call" },
  { key: "casting_calls", label: "Casting calls", icon: "🎬", category: "creative", type: "casting_call" },
  { key: "film_grants", label: "Film grants", icon: "🎥", category: "creative", type: "grant" },
  { key: "music_programs", label: "Music programs", icon: "🎵", category: "creative", type: "scholarship" },
  { key: "culinary_programs", label: "Culinary programs", icon: "🍳", category: "career", type: "scholarship" },
  { key: "apprenticeships", label: "Apprenticeships", icon: "🔧", category: "career", type: "internship" },
  { key: "internships", label: "Internships", icon: "💼", category: "career", type: "internship" },
  { key: "full_time_jobs", label: "Full-time jobs", icon: "💼", category: "career", type: "job" },
  { key: "grants", label: "Grants", icon: "💰", category: "academic", type: "grant" },
  { key: "fashion_opportunities", label: "Fashion opportunities", icon: "👗", category: "creative", type: "creative_call" },
  { key: "modeling_gigs", label: "Modeling gigs", icon: "📸", category: "creative", type: "creative_call" },
  { key: "writing_fellowships", label: "Writing fellowships", icon: "✍️", category: "academic", type: "fellowship" },
  { key: "research_grants", label: "Research grants", icon: "🔬", category: "academic", type: "grant" },
  { key: "data_science_jobs", label: "Data science jobs", icon: "📈", category: "career", type: "job" },
  { key: "hackathons", label: "Hackathons", icon: "👾", category: "career", type: "hackathon" },
  { key: "game_jams", label: "Game jams", icon: "🎮", category: "creative", type: "hackathon" },
  { key: "startup_weekends", label: "Startup weekends", icon: "🚀", category: "career", type: "hackathon" },
  { key: "chess_tournaments", label: "Chess tournaments", icon: "♟️", category: "academic", type: "competition" },
  { key: "esports_competitions", label: "Esports competitions", icon: "🎮", category: "athletic", type: "competition" },
  { key: "debate_competitions", label: "Debate competitions", icon: "🎙️", category: "academic", type: "competition" },
  { key: "robotics_competitions", label: "Robotics competitions", icon: "🤖", category: "academic", type: "competition" },
  { key: "science_fairs", label: "Science fairs", icon: "🧪", category: "academic", type: "competition" },
];

// Keyword → suggestion matching
function matchSuggestions(query: string): Suggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const keywords: Record<string, string[]> = {
    art: ["art_schools", "creative_grants", "design_internships", "exhibitions", "creative_gigs"],
    paint: ["art_schools", "creative_grants", "exhibitions"],
    design: ["design_internships", "creative_gigs", "fashion_opportunities"],
    creative: ["creative_grants", "creative_gigs", "design_internships", "exhibitions", "casting_calls"],
    football: ["football_trials", "sports_scholarships"],
    sport: ["football_trials", "sports_scholarships", "athletic_programs"],
    athlet: ["football_trials", "sports_scholarships", "athletic_programs"],
    trial: ["football_trials", "athletic_programs"],
    tech: ["tech_internships", "software_jobs", "coding_bootcamps"],
    cod: ["coding_bootcamps", "software_jobs", "tech_internships"],
    software: ["software_jobs", "tech_internships"],
    engineer: ["software_jobs", "tech_internships"],
    develop: ["software_jobs", "tech_internships"],
    business: ["business_grants", "startup_funding", "mba_programs"],
    startup: ["startup_funding", "business_grants"],
    entrepreneur: ["startup_funding", "business_grants"],
    scholarship: ["scholarships", "fellowships", "academic_programs"],
    study: ["scholarships", "fellowships", "academic_programs", "art_schools"],
    universit: ["scholarships", "fellowships", "academic_programs"],
    college: ["scholarships", "academic_programs"],
    school: ["scholarships", "art_schools", "academic_programs"],
    remote: ["remote_jobs", "remote_internships"],
    "work from home": ["remote_jobs", "remote_internships"],
    music: ["music_programs", "creative_grants", "creative_gigs"],
    film: ["film_grants", "casting_calls", "creative_gigs"],
    act: ["casting_calls", "creative_gigs"],
    cast: ["casting_calls", "film_grants", "creative_gigs"],
    model: ["modeling_gigs", "fashion_opportunities", "casting_calls"],
    fashion: ["fashion_opportunities", "modeling_gigs", "creative_gigs"],
    chef: ["culinary_programs", "apprenticeships"],
    culinary: ["culinary_programs", "apprenticeships"],
    cook: ["culinary_programs", "apprenticeships"],
    intern: ["internships", "tech_internships", "design_internships", "remote_internships"],
    job: ["full_time_jobs", "software_jobs", "remote_jobs"],
    grant: ["grants", "creative_grants", "business_grants", "film_grants", "research_grants"],
    fellow: ["fellowships", "writing_fellowships"],
    research: ["research_grants", "fellowships"],
    write: ["writing_fellowships", "creative_grants"],
    data: ["data_science_jobs", "tech_internships", "software_jobs"],
    apprentice: ["apprenticeships", "culinary_programs"],
    gig: ["creative_gigs", "casting_calls", "modeling_gigs"],
    hackathon: ["hackathons", "game_jams", "startup_weekends"],
    hack: ["hackathons", "game_jams"],
    "game jam": ["game_jams", "hackathons"],
    chess: ["chess_tournaments"],
    esports: ["esports_competitions"],
    gaming: ["esports_competitions", "game_jams"],
    debate: ["debate_competitions"],
    robot: ["robotics_competitions"],
    science: ["science_fairs", "research_grants"],
    tournament: ["chess_tournaments", "esports_competitions"],
    competition: ["chess_tournaments", "esports_competitions", "debate_competitions", "robotics_competitions", "science_fairs"],
    compete: ["hackathons", "chess_tournaments", "esports_competitions"],
  };

  const matchedKeys = new Set<string>();
  for (const [keyword, keys] of Object.entries(keywords)) {
    if (q.includes(keyword)) {
      keys.forEach((k) => matchedKeys.add(k));
    }
  }

  // If nothing matched, return broad suggestions
  if (matchedKeys.size === 0) {
    return [
      { key: "scholarships", label: "Scholarships", icon: "🎓", category: "academic", type: "scholarship" },
      { key: "internships", label: "Internships", icon: "💼", category: "career", type: "internship" },
      { key: "grants", label: "Grants", icon: "💰", category: "academic", type: "grant" },
      { key: "creative_gigs", label: "Creative gigs", icon: "🎨", category: "creative", type: "creative_call" },
    ];
  }

  return ALL_SUGGESTIONS.filter((s) => matchedKeys.has(s.key)).slice(0, 8);
}

// ── Styles ──────────────────────────────────────────────

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

const inputStyleBase = {
  width: "100%",
  background: "transparent",
  border: "1px solid var(--line-strong)",
  borderRadius: "100px",
  padding: "16px 24px",
  color: "var(--text)",
  fontSize: "16px",
  fontFamily: "'JetBrains Mono', monospace",
  outline: "none",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

export default function OnboardingPage() {
  const router = useRouter();
  const supabase: any = createClient();
  const { setUser } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  // Step 1 fields
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  // Step 2: discovery input
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Step 3: countries
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const isGlobal = preferredCountries.includes("__global__");

  // Step 4: optional goals
  const [goals, setGoals] = useState("");

  const totalSteps = 4;

  const next = () => { setDirection(1); setStep(Math.min(totalSteps - 1, step + 1)); };
  const prev = () => { setDirection(-1); setStep(Math.max(0, step - 1)); };

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  // ── Step 2: Real-time suggestion engine ──────────────
  const handleDiscoveryInput = useCallback((value: string) => {
    setDiscoveryQuery(value);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      const matched = matchSuggestions(value);
      setSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    }, 200);
  }, []);

  const toggleSuggestion = (s: Suggestion) => {
    setSelectedInterests((prev) => {
      const exists = prev.find((p) => p.key === s.key);
      return exists ? prev.filter((p) => p.key !== s.key) : [...prev, s];
    });
  };

  const removeInterest = (key: string) => {
    setSelectedInterests((prev) => prev.filter((p) => p.key !== key));
  };

  // ── Step 3: Country handling ─────────────────────────
  const handleCountryToggle = (c: string) => {
    setPreferredCountries((prev) => {
      let next = [...prev];
      if (c === "__global__") {
        next = next.includes("__global__") ? [] : ["__global__", ...COUNTRIES];
      } else {
        next = next.filter((x) => x !== "__global__");
        next = toggleArr(next, c);
        if (next.length === COUNTRIES.length) next = ["__global__", ...COUNTRIES];
      }
      return next;
    });
  };

  // ── Submit ──────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return fullName.length > 0 && country.length > 0;
    if (step === 1) return true; // discovery is always optional
    if (step === 2) return preferredCountries.length > 0;
    if (step === 3) return true; // goals optional
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build category_focus from selected interests
      const categories = new Set<OpportunityCategory>();
      selectedInterests.forEach((s) => categories.add(s.category));
      const categoryFocus = categories.size > 0
        ? Array.from(categories)
        : (["academic", "career", "creative", "athletic"] as OpportunityCategory[]);

      const countries = preferredCountries.filter((c) => c !== "__global__");

      // Determine level from interests
      const hasAcademic = selectedInterests.some((s) => s.type === "scholarship" || s.type === "fellowship");
      const hasCareer = selectedInterests.some((s) => s.type === "job" || s.type === "internship");
      const level = hasAcademic && !hasCareer ? "undergraduate"
        : hasCareer && !hasAcademic ? "early_career"
        : "all";

      // Build interests from discovery query + selected chips
      const queryWords = discoveryQuery
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["what", "that", "this", "with", "from", "your", "have", "about", "looking", "want", "some", "like", "love"].includes(w))
        .slice(0, 8);
      const chipInterests = selectedInterests.map((s) => s.label.toLowerCase());
      const allInterests = [...new Set([...queryWords, ...chipInterests])].slice(0, 10);

      // Infer intents from selected interest types — uses the same
      // centralized, tag-aware inference as the matching engine and
      // SwipeDeck, so a chip like "Hackathon" (which isn't one of the
      // handful of hardcoded legacy types) still resolves to a real
      // intent instead of silently contributing nothing.
      const intentSet = new Set<string>();
      selectedInterests.forEach((s) => {
        inferIntents(s.type, [s.label.toLowerCase()]).forEach((i) => intentSet.add(i));
      });
      if (intentSet.size === 0) intentSet.add("explore");
      const intents = Array.from(intentSet);

      await supabase.from("users").upsert({
        id: user.id, email: user.email,
        full_name: fullName, country,
        level, field_of_study: "Various",
        preferred_countries: countries.length > 0 ? countries : COUNTRIES,
        goals: goals || discoveryQuery,
        category_focus: categoryFocus,
        skills: [],
        experience_level: level,
        interests: allInterests,
        intents: intents,
        exploration_level: "balanced",
      } as any, { onConflict: "id" });

      setUser({
        id: user.id, email: user.email || "",
        full_name: fullName, country,
        level: level as any,
        field_of_study: "Various",
        preferred_countries: countries.length > 0 ? countries : COUNTRIES,
        goals: goals || discoveryQuery,
        category_focus: categoryFocus,
        skills: [],
        interests: allInterests,
        intents: intents,
        exploration_level: "balanced",
        created_at: "",
      } as User);

      track("onboarding_complete", { discoveryQuery, interests: selectedInterests.map((s) => s.key).join(",") });
      router.push("/swipe");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally { setLoading(false); }
  };

  // ── Cleanup ─────────────────────────────────────────
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // ── Default suggestion chips (shown when input is empty) ──
  const defaultChips = [
    { key: "scholarships", label: "Scholarships", icon: "🎓" },
    { key: "internships", label: "Internships", icon: "💼" },
    { key: "grants", label: "Grants", icon: "💰" },
    { key: "creative_gigs", label: "Creative gigs", icon: "🎨" },
  ];

  // ── Render ──────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--black)" }}>
      <div className="w-full max-w-[420px]">
        {/* Progress */}
        <div className="flex gap-1 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 h-[2px] rounded-full transition-colors duration-300"
              style={{ background: i <= step ? "var(--lime)" : "var(--line)" }} />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {/* ──── STEP 1: Basic Info ──── */}
            {step === 0 && (
              <>
                <div className="flex items-center gap-[10px] text-[12px] uppercase tracking-[0.16em] mb-3" style={{ ...mono, color: "var(--lime)" }}>
                  <span className="w-[22px] h-px" style={{ background: "var(--lime)" }} />Step 1
                </div>
                <h2 className="text-[24px] font-bold leading-[1.19] mb-1.5" style={{ ...display, color: "var(--text)" }}>
                  Tell us about yourself
                </h2>
                <p className="text-[14px] mb-8 leading-[1.25]" style={{ color: "var(--muted)" }}>
                  Just the essentials — we'll personalise everything from here.
                </p>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-[12px] mb-1.5 uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-transparent border rounded-full px-4 py-3 text-[14px] outline-none transition-all"
                      style={{
                        borderColor: fullName ? "var(--lime)" : "var(--line-strong)",
                        boxShadow: fullName ? "0 0 0 4px rgba(214,255,63,.12)" : "none",
                        color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
                      }} />
                  </div>
                  <div>
                    <label className="block text-[12px] mb-1.5 uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Country</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-full px-4 py-3 text-[14px] outline-none transition-all"
                      style={{
                        background: "var(--black)", border: `1px solid ${country ? "var(--lime)" : "var(--line-strong)"}`,
                        color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
                        boxShadow: country ? "0 0 0 4px rgba(214,255,63,.12)" : "none",
                      }}>
                      <option value="" style={{ background: "var(--card)" }}>Select your country</option>
                      {COUNTRIES.map((c) => <option key={c} value={c} style={{ background: "var(--card)" }}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ──── STEP 2: Open Discovery ──── */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-[10px] text-[12px] uppercase tracking-[0.16em] mb-3" style={{ ...mono, color: "var(--lime)" }}>
                  <span className="w-[22px] h-px" style={{ background: "var(--lime)" }} />Step 2
                </div>
                <h2 className="text-[24px] font-bold leading-[1.19] mb-1.5" style={{ ...display, color: "var(--text)" }}>
                  What are you looking for?
                </h2>
                <p className="text-[14px] mb-8 leading-[1.25]" style={{ color: "var(--muted)" }}>
                  Describe what you want in your own words. We'll translate it into opportunities.
                </p>

                <div className="mb-6">
                  {/* Selected interests chips */}
                  {selectedInterests.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex flex-wrap gap-2 mb-4"
                    >
                      {selectedInterests.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => removeInterest(s.key)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                          style={{
                            borderColor: "var(--lime)",
                            background: "rgba(214,255,63,.08)",
                            color: "var(--lime)",
                            ...mono,
                          }}
                        >
                          <span>{s.icon}</span> {s.label}
                          <X className="w-3 h-3 ml-0.5" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={discoveryQuery}
                    onChange={(e) => handleDiscoveryInput(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0 || !discoveryQuery) setShowSuggestions(true); }}
                    placeholder='"I love painting and want to study art"'
                    style={inputStyleBase}
                    className="focus:border-[var(--lime)] focus:shadow-[0_0_0_4px_rgba(214,255,63,.12)]"
                  />

                  {/* Dynamic suggestions */}
                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mt-4"
                      >
                        {discoveryQuery.trim() ? (
                          // AI-interpreted suggestions
                          <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
                              <Sparkles className="w-3 h-3 inline mr-1" style={{ color: "var(--lime)" }} />
                              We found these for you
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {suggestions.map((s) => {
                                const isSelected = selectedInterests.some((si) => si.key === s.key);
                                return (
                                  <button
                                    key={s.key}
                                    onClick={() => toggleSuggestion(s)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all"
                                    style={{
                                      borderColor: isSelected ? "var(--lime)" : "var(--line-strong)",
                                      background: isSelected ? "rgba(214,255,63,.08)" : "transparent",
                                      color: isSelected ? "var(--lime)" : "var(--faint)",
                                      ...mono,
                                    }}
                                  >
                                    <span className="text-sm">{s.icon}</span> {s.label}
                                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          // Default suggestion chips when empty
                          <div className="space-y-2">
                            <p className="text-[11px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
                              Try starting with:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {defaultChips.map((chip) => (
                                <button
                                  key={chip.key}
                                  onClick={() => handleDiscoveryInput(chip.label)}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all"
                                  style={{
                                    borderColor: "var(--line-strong)",
                                    color: "var(--faint)",
                                    ...mono,
                                  }}
                                >
                                  <span className="text-sm">{chip.icon}</span> {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Example prompts */}
                  {!discoveryQuery && !showSuggestions && (
                    <div className="mt-4 space-y-1.5">
                      {[
                        "I love painting and want to study art",
                        "Looking for football trials in Europe",
                        "I want remote internships in tech",
                        "Grants for starting a small business",
                      ].map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => handleDiscoveryInput(ex)}
                          className="block w-full text-left text-[13px] py-1.5 transition-colors"
                          style={{ color: "var(--faint)", ...mono }}
                        >
                          "{ex}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ──── STEP 3: Location ──── */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-[10px] text-[12px] uppercase tracking-[0.16em] mb-3" style={{ ...mono, color: "var(--lime)" }}>
                  <span className="w-[22px] h-px" style={{ background: "var(--lime)" }} />Step 3
                </div>
                <h2 className="text-[24px] font-bold leading-[1.19] mb-1.5" style={{ ...display, color: "var(--text)" }}>
                  Where are you open to opportunities?
                </h2>
                <p className="text-[14px] mb-8 leading-[1.25]" style={{ color: "var(--muted)" }}>
                  Choose where you're open to opportunities
                </p>

                <div className="mb-8">
                  <label className="block text-[12px] mb-1.5 uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
                    {isGlobal ? "🌍 Anywhere" : `${preferredCountries.filter(c => c !== "__global__").length} country${preferredCountries.filter(c => c !== "__global__").length !== 1 ? "s" : ""} selected`}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    <button
                      onClick={() => handleCountryToggle("__global__")}
                      className="col-span-2 py-3 px-4 rounded-full border transition-all flex items-center justify-center gap-2"
                      style={{
                        borderColor: isGlobal ? "var(--lime)" : "var(--line-strong)",
                        background: isGlobal ? "rgba(214,255,63,.06)" : "transparent",
                        color: isGlobal ? "var(--lime)" : "var(--faint)",
                        ...mono, fontSize: "13px",
                      }}>
                      🌍 Anywhere (Global opportunities)
                    </button>
                    {COUNTRIES.map((c) => {
                      const selected = preferredCountries.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => !isGlobal && handleCountryToggle(c)}
                          className="py-2 px-3 rounded-full text-[11px] text-left border transition-all font-medium uppercase tracking-[0.04em]"
                          style={{
                            ...mono,
                            borderColor: selected ? "var(--lime)" : "var(--line-strong)",
                            color: selected ? "var(--lime)" : "var(--faint)",
                            background: selected ? "rgba(214,255,63,.06)" : "transparent",
                            opacity: isGlobal && !selected ? 0.3 : 1,
                            cursor: isGlobal ? "default" : "pointer",
                          }}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ──── STEP 4: Optional Goals ──── */}
            {step === 3 && (
              <>
                <div className="flex items-center gap-[10px] text-[12px] uppercase tracking-[0.16em] mb-3" style={{ ...mono, color: "var(--lime)" }}>
                  <span className="w-[22px] h-px" style={{ background: "var(--lime)" }} />Step 4
                </div>
                <h2 className="text-[24px] font-bold leading-[1.19] mb-1.5" style={{ ...display, color: "var(--text)" }}>
                  Want even better matches?
                </h2>
                <p className="text-[14px] mb-8 leading-[1.25]" style={{ color: "var(--muted)" }}>
                  Optional — add more detail and we'll refine your feed. Or skip straight to discovering.
                </p>

                <div className="mb-8">
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Tell us more about what you're working towards..."
                    rows={4}
                    className="w-full bg-transparent border rounded-2xl px-4 py-3 text-[14px] outline-none resize-none transition-all"
                    style={{
                      borderColor: goals ? "var(--lime)" : "var(--line-strong)",
                      boxShadow: goals ? "0 0 0 4px rgba(214,255,63,.12)" : "none",
                      color: "var(--text)", fontFamily: "'JetBrains Mono', monospace",
                    }} />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="text-[13px] mb-4 rounded-full px-4 py-2.5" style={{ ...mono, color: "var(--magenta)", background: "rgba(255,46,159,.06)", border: "1px solid rgba(255,46,159,.15)" }}>
            {error}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prev} className={`text-[14px] transition-colors ${step === 0 ? "invisible" : ""}`} style={{ ...mono, color: "var(--faint)" }}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          {step < totalSteps - 1 ? (
            <button onClick={next} disabled={!canProceed()} className="btn btn-primary" style={{ opacity: canProceed() ? 1 : 0.3 }}>
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
                style={{ opacity: loading ? 0.5 : 1, padding: "12px 24px" }}>
                {loading ? "Saving..." : <><Sparkles className="w-4 h-4" /> Start Discovering</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

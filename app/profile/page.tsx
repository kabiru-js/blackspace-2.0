"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { User } from "@/lib/types";
import { Save, Loader2, Globe, Target, CheckCircle2, Sparkles, X, Plus, User as UserIcon, Search } from "lucide-react";
import { matchSuggestions, buildInterests, DiscoverySuggestion } from "@/lib/discovery";
import { inferIntents } from "@/lib/matching";

const COUNTRIES = [
  "United Kingdom", "United States", "Germany", "Canada", "Australia", "France",
  "Netherlands", "Japan", "South Korea", "Singapore", "Sweden", "Switzerland",
  "Italy", "Spain", "Norway", "Denmark", "Finland", "Belgium", "Austria",
  "New Zealand", "Ireland", "China", "India", "Brazil", "Mexico", "South Africa",
  "Turkey", "Poland", "Hungary", "Czech Republic",
];

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };
const sectionStyle = { background: "linear-gradient(160deg, var(--card2), var(--card))", border: "1px solid var(--line-strong)", borderRadius: "18px" };
const inputStyle = {
  background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--text)",
  fontFamily: "'JetBrains Mono', monospace", outline: "none",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

export default function ProfilePage() {
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Form state — fully agnostic, expressed in the user's own words ──
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [seekingQuery, setSeekingQuery] = useState("");       // free text: "what are you looking for?"
  const [selectedSuggestions, setSelectedSuggestions] = useState<DiscoverySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [goals, setGoals] = useState("");

  const isGlobal = preferredCountries.includes("__global__");

  // Seed form from existing profile
  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name || "");
    setCountry(user.country || "");
    setGoals(user.goals || "");
    setSkills(user.skills || []);
    setPreferredCountries(user.preferred_countries?.length ? [...user.preferred_countries] : []);

    // Rebuild selected suggestions from stored interests where possible
    const storedInterests = user.interests || [];
    if (storedInterests.length > 0) {
      const seeded = storedInterests
        .slice(0, 5)
        .map((interest) => matchSuggestions(interest)[0])
        .filter(Boolean) as DiscoverySuggestion[];
      setSelectedSuggestions(seeded);
    }
  }, [user]);

  const handleSeekingChange = (value: string) => {
    setSeekingQuery(value);
    if (!value.trim()) { setShowSuggestions(false); return; }
    const matched = matchSuggestions(value);
    setShowSuggestions(matched.length > 0);
    // Keep it simple: auto-toggle suggestions inline as the user types.
    // We also cache the last matched set for the "We found these" list.
    window.clearTimeout((window as any)._bs_profile_suggest_timer);
    (window as any)._bs_profile_suggest_timer = window.setTimeout(() => {
      const m = matchSuggestions(value);
      setShowSuggestions(m.length > 0);
    }, 200);
  };

  const toggleSuggestion = (s: DiscoverySuggestion) => {
    setSelectedSuggestions((prev) => {
      const exists = prev.find((p) => p.key === s.key);
      return exists ? prev.filter((p) => p.key !== s.key) : [...prev, s];
    });
  };

  const addSkill = () => {
    const v = skillsInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillsInput("");
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((s) => s !== skill));

  const toggleCountry = (c: string) => {
    setPreferredCountries((prev) => {
      let next = [...prev];
      if (c === "__global__") {
        next = next.includes("__global__") ? [] : ["__global__", ...COUNTRIES];
      } else {
        next = next.filter((x) => x !== "__global__");
        next = next.includes(c) ? next.filter((x) => x !== c) : [...next, c];
        if (next.length === COUNTRIES.length) next = ["__global__", ...COUNTRIES];
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setError(null);
    try {
      // Build interests from free text + tapped suggestions
      const interests = buildInterests(seekingQuery, selectedSuggestions.map((s) => s.label));
      const effectiveInterests = interests.length > 0 ? interests : (user.interests || []);

      // Infer intents from selected suggestion types (centralized, tag-aware)
      const intentSet = new Set<string>();
      selectedSuggestions.forEach((s) => {
        inferIntents(s.type, [s.label.toLowerCase()]).forEach((i) => intentSet.add(i));
      });
      const intents = intentSet.size > 0 ? Array.from(intentSet) : (user.intents || []);

      const countries = preferredCountries.filter((c) => c !== "__global__");

      const { error: updateError } = await (supabase as any).from("users").update({
        full_name: fullName,
        country,
        goals: goals || seekingQuery,
        skills,
        interests: effectiveInterests,
        intents,
        preferred_countries: countries,
        exploration_level: "balanced",
      }).eq("id", user.id);
      if (updateError) throw updateError;

      setUser({
        ...user,
        full_name: fullName,
        country,
        goals: goals || seekingQuery,
        skills,
        interests: effectiveInterests,
        intents,
        preferred_countries: countries,
        exploration_level: "balanced" as const,
      } as User);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--black)" }}>
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--lime)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--black)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 border-b" style={{ background: "rgba(5,5,6,.75)", backdropFilter: "blur(14px)", borderColor: "var(--line)" }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>Profile</h1>
            <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>Tell Blackspace what matters to you</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 transition-all"
            style={{
              ...mono,
              background: saved ? "rgba(26,174,57,.15)" : "var(--lime)",
              border: saved ? "1px solid rgba(26,174,57,.3)" : "none",
              color: saved ? "var(--lime)" : "#050506",
              opacity: saving ? 0.5 : 1,
            }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {error && (
          <div className="p-3 rounded-full border text-sm" style={{ background: "rgba(255,46,159,.06)", borderColor: "rgba(255,46,159,.15)", color: "var(--magenta)", ...mono }}>
            {error}
          </div>
        )}

        {/* ── About you ── */}
        <div className="rounded-2xl p-5 space-y-3" style={sectionStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--lime)" }}>
            <UserIcon className="w-5 h-5" />
            <h3 className="font-semibold" style={{ ...display, color: "var(--text)" }}>About you</h3>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm" style={{ color: "var(--faint)" }}>Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name"
              className="w-full rounded-full py-2.5 px-4 text-sm"
              style={{ ...inputStyle, borderColor: fullName ? "var(--lime)" : "var(--line-strong)" }} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm" style={{ color: "var(--faint)" }}>Based in</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-full py-2.5 px-4 text-sm"
              style={{ ...inputStyle, background: "var(--card)" }}>
              <option value="" style={{ background: "var(--card)" }}>Select your country</option>
              {COUNTRIES.map((c) => <option key={c} value={c} style={{ background: "var(--card)" }}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── What are you looking for? ── */}
        <div className="rounded-2xl p-5 space-y-3" style={sectionStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--lime)" }}>
            <Search className="w-5 h-5" />
            <h3 className="font-semibold" style={{ ...display, color: "var(--text)" }}>What are you looking for?</h3>
          </div>
          <p className="text-xs" style={{ color: "var(--faint)" }}>
            Describe it in your own words — anything from &quot;art school&quot; to &quot;football trials&quot; to &quot;start my own bakery&quot;.
          </p>

          {/* Selected interests */}
          {selectedSuggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-wrap gap-2">
              {selectedSuggestions.map((s) => (
                <button key={s.key} onClick={() => toggleSuggestion(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all"
                  style={{ ...mono, borderColor: "var(--lime)", background: "rgba(214,255,63,.08)", color: "var(--lime)" }}>
                  <span>{s.icon}</span> {s.label}
                  <X className="w-3 h-3 ml-0.5" />
                </button>
              ))}
            </motion.div>
          )}

          <input
            type="text"
            value={seekingQuery}
            onChange={(e) => handleSeekingChange(e.target.value)}
            onFocus={() => { if (seekingQuery.trim()) setShowSuggestions(true); }}
            placeholder='"I want to study fine arts"'
            className="w-full rounded-full py-3 px-4 text-sm"
            style={{ ...inputStyle, borderColor: seekingQuery ? "var(--lime)" : "var(--line-strong)", boxShadow: seekingQuery ? "0 0 0 4px rgba(214,255,63,.12)" : "none" }}
          />

          {/* Dynamic suggestions */}
          {showSuggestions && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
                <Sparkles className="w-3 h-3 inline mr-1" style={{ color: "var(--lime)" }} /> We found these
              </p>
              <div className="flex flex-wrap gap-2">
                {matchSuggestions(seekingQuery).map((s) => {
                  const isSelected = selectedSuggestions.some((si) => si.key === s.key);
                  return (
                    <button key={s.key} onClick={() => toggleSuggestion(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-all"
                      style={{ ...mono, borderColor: isSelected ? "var(--lime)" : "var(--line-strong)", background: isSelected ? "rgba(214,255,63,.08)" : "transparent", color: isSelected ? "var(--lime)" : "var(--faint)" }}>
                      <span className="text-sm">{s.icon}</span> {s.label}
                      {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Skills & talents ── */}
        <div className="rounded-2xl p-5 space-y-3" style={sectionStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--lime)" }}>
            <Target className="w-5 h-5" />
            <h3 className="font-semibold" style={{ ...display, color: "var(--text)" }}>Skills &amp; talents</h3>
          </div>
          <p className="text-xs" style={{ color: "var(--faint)" }}>
            Anything you bring to the table — coding, cooking, painting, languages, leadership...
          </p>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs uppercase tracking-[0.04em]"
                  style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--muted)", background: "var(--card)" }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="opacity-60 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
              placeholder="Add a skill and press Enter"
              className="flex-1 rounded-full py-2.5 px-4 text-sm"
              style={inputStyle}
            />
            <button onClick={addSkill}
              className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
              style={{ borderColor: skillsInput.trim() ? "var(--lime)" : "var(--line-strong)", color: skillsInput.trim() ? "var(--lime)" : "var(--faint)", background: "var(--card)" }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Where are you open to? ── */}
        <div className="rounded-2xl p-5 space-y-3" style={sectionStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--lime)" }}>
            <Globe className="w-5 h-5" />
            <h3 className="font-semibold" style={{ ...display, color: "var(--text)" }}>Where are you open to?</h3>
          </div>
          <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>
            {isGlobal ? "🌍 Anywhere" : `${preferredCountries.filter((c) => c !== "__global__").length} country${preferredCountries.filter((c) => c !== "__global__").length !== 1 ? "s" : ""} selected`}
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            <button onClick={() => toggleCountry("__global__")}
              className="col-span-2 py-3 px-4 rounded-full border transition-all flex items-center justify-center gap-2 text-[13px]"
              style={{ ...mono, borderColor: isGlobal ? "var(--lime)" : "var(--line-strong)", background: isGlobal ? "rgba(214,255,63,.06)" : "transparent", color: isGlobal ? "var(--lime)" : "var(--faint)" }}>
              🌍 Anywhere (Global)
            </button>
            {COUNTRIES.map((c) => {
              const selected = preferredCountries.includes(c);
              return (
                <button key={c} onClick={() => !isGlobal && toggleCountry(c)}
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

        {/* ── Goals (optional) ── */}
        <div className="rounded-2xl p-5 space-y-3" style={sectionStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--lime)" }}>
            <Target className="w-5 h-5" />
            <h3 className="font-semibold" style={{ ...display, color: "var(--text)" }}>What are you working towards?</h3>
          </div>
          <textarea value={goals} onChange={(e) => setGoals(e.target.value)}
            placeholder="Optional — the more you share, the smarter your feed gets"
            rows={4}
            className="w-full rounded-xl py-3 px-4 text-sm outline-none resize-none transition-all"
            style={inputStyle} />
        </div>
      </div>
    </div>
  );
}

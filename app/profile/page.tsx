"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { User, StudyLevel } from "@/lib/types";
import {
  ArrowLeft,
  Save,
  Loader2,
  GraduationCap,
  BookOpen,
  Globe,
  Target,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

const COUNTRIES = [
  "United Kingdom", "United States", "Germany", "Canada", "Australia", "France",
  "Netherlands", "Japan", "South Korea", "Singapore", "Sweden", "Switzerland",
  "Italy", "Spain", "Norway", "Denmark", "Finland", "Belgium", "Austria",
  "New Zealand", "Ireland", "China", "India", "Brazil", "Mexico", "South Africa",
  "Turkey", "Poland", "Hungary", "Czech Republic",
];

const STUDY_LEVELS: StudyLevel[] = ["undergraduate", "masters", "phd"];

const FIELDS = [
  "Accounting", "Agriculture", "Architecture", "Artificial Intelligence",
  "Biology", "Biomedical Engineering", "Biotechnology", "Business",
  "Chemical Engineering", "Chemistry", "Civil Engineering", "Computer Science",
  "Data Science", "Design", "Economics", "Education", "Electrical Engineering",
  "Energy", "Engineering", "Environmental Science", "Environmental Studies",
  "Finance", "History", "Information Technology", "International Business",
  "International Relations", "Law", "Marine Biology", "Marketing", "Mathematics",
  "Mechanical Engineering", "Medicine", "Neuroscience", "Nursing",
  "Pharmacy", "Philosophy", "Physics", "Political Science", "Psychology",
  "Public Health", "Public Policy", "Renewable Energy", "Robotics",
  "Sociology", "Software Engineering", "Statistics", "Sustainable Development",
  "Urban Planning", "Various", "Water Management",
];

export default function ProfilePage() {
  const { user, setUser } = useAppStore();
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    level: "" as StudyLevel | "",
    field_of_study: "",
    gpa: "",
    preferred_countries: [] as string[],
    goals: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        country: user.country || "",
        level: user.level || "",
        field_of_study: user.field_of_study || "",
        gpa: user.gpa || "",
        preferred_countries: user.preferred_countries || [],
        goals: user.goals || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoadingSuggestions(true);
    fetch("/api/enrich-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: user.full_name,
        country: user.country,
        level: user.level,
        field_of_study: user.field_of_study,
        goals: user.goals,
        preferred_countries: user.preferred_countries,
      }),
    })
      .then((r) => r.json())
      .then((d) => setSuggestions(d.suggestions || []))
      .finally(() => setLoadingSuggestions(false));
  }, [user?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await (supabase as any)
        .from("users")
        .update({
          full_name: formData.full_name,
          country: formData.country,
          level: formData.level,
          field_of_study: formData.field_of_study,
          gpa: formData.gpa || null,
          preferred_countries: formData.preferred_countries,
          goals: formData.goals,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setUser({ ...user, ...formData, level: formData.level as StudyLevel });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const toggleCountry = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_countries: prev.preferred_countries.includes(country)
        ? prev.preferred_countries.filter((c) => c !== country)
        : [...prev.preferred_countries, country],
    }));
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
            <h1 className="text-lg font-bold text-white">Your Profile</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all ${
              saved
                ? "bg-green-500/20 text-green-400"
                : "bg-accent text-white hover:bg-accent-dark"
            } disabled:opacity-50`}
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-6">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {/* AI Profile Suggestions */}
        {!loadingSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-accent/5 border border-accent/20 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent-light" />
              <span className="text-sm font-semibold text-accent-light">AI Suggestions</span>
            </div>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                  <span className="text-accent-light mt-1">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Personal Info */}
        <Section icon={<GraduationCap className="w-5 h-5" />} title="Personal Info">
          <Input
            label="Full Name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          />
          <Select
            label="Your Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            options={COUNTRIES}
            placeholder="Select country"
          />
        </Section>

        {/* Academics */}
        <Section icon={<BookOpen className="w-5 h-5" />} title="Academics">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Study Level</label>
            <div className="grid grid-cols-3 gap-2">
              {STUDY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setFormData({ ...formData, level })}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    formData.level === level
                      ? "bg-accent/20 border-accent/50 text-accent-light"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Select
            label="Field of Study"
            value={formData.field_of_study}
            onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
            options={FIELDS}
            placeholder="Select field"
          />
          <Input
            label="GPA (optional)"
            value={formData.gpa}
            onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
            placeholder="e.g. 3.7 / 4.0"
          />
        </Section>

        {/* Preferences */}
        <Section icon={<Globe className="w-5 h-5" />} title="Preferred Countries">
          <p className="text-xs text-zinc-500 mb-3">
            {formData.preferred_countries.length} selected
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => toggleCountry(country)}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                  formData.preferred_countries.includes(country)
                    ? "bg-accent/20 border-accent/50 text-accent-light"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </Section>

        {/* Goals */}
        <Section icon={<Target className="w-5 h-5" />} title="Career Goals">
          <textarea
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="What are your career and life goals?"
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
          />
        </Section>
      </div>
    </div>
  );
}

// Mini components
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-center gap-2 text-accent-light">
        {icon}
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
      >
        {placeholder && (
          <option value="" className="bg-zinc-900">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-zinc-900">
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

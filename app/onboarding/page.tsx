"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import { User, StudyLevel } from "@/lib/types";
import { track } from "@/lib/analytics";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Globe,
  GraduationCap,
  BookOpen,
  Target,
  Loader2,
} from "lucide-react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Cambodia", "Cameroon", "Canada", "Chile", "China",
  "Colombia", "Costa Rica", "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia",
  "Finland", "France", "Germany", "Ghana", "Greece", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya",
  "Malaysia", "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saudi Arabia", "Singapore", "South Africa", "South Korea",
  "Spain", "Sri Lanka", "Sweden", "Switzerland", "Taiwan", "Tanzania", "Thailand",
  "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Vietnam", "Zambia", "Zimbabwe",
];

const STUDY_LEVELS: StudyLevel[] = ["undergraduate", "masters", "phd"];

const FIELDS = [
  "Accounting", "Agriculture", "Anthropology", "Architecture", "Art History",
  "Artificial Intelligence", "Astronomy", "Biochemistry", "Biology", "Biomedical Engineering",
  "Biotechnology", "Business", "Chemical Engineering", "Chemistry", "Civil Engineering",
  "Classics", "Computer Science", "Data Science", "Design", "Development Studies",
  "Economics", "Education", "Electrical Engineering", "Energy", "Engineering",
  "English Literature", "Environmental Science", "Environmental Studies", "Fashion",
  "Film Studies", "Finance", "Fine Arts", "Geography", "Geology", "Graphic Design",
  "History", "Information Technology", "International Business", "International Law",
  "International Relations", "International Trade", "Journalism", "Law", "Linguistics",
  "Marine Biology", "Marketing", "Materials Science", "Mathematics", "Mechanical Engineering",
  "Media Studies", "Medicine", "Music", "Nanotechnology", "Neuroscience", "Nursing",
  "Pharmacy", "Philosophy", "Photography", "Physics", "Political Science", "Psychology",
  "Public Health", "Public Policy", "Renewable Energy", "Robotics", "Sociology",
  "Software Engineering", "Statistics", "Sustainable Development", "Urban Planning",
  "Various", "Veterinary Science", "Water Management", "Web Development", "Zoology",
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useAppStore();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    level: "" as StudyLevel | "",
    field_of_study: "",
    gpa: "",
    preferred_countries: [] as string[],
    goals: "",
  });

  const totalSteps = 4;

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePreferredCountry = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_countries: prev.preferred_countries.includes(country)
        ? prev.preferred_countries.filter((c) => c !== country)
        : [...prev.preferred_countries, country],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.full_name.trim().length > 0 && formData.country;
      case 1:
        return formData.level && formData.field_of_study;
      case 2:
        return formData.preferred_countries.length > 0;
      case 3:
        return formData.goals.trim().length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error: upsertError } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: formData.full_name,
          country: formData.country,
          level: formData.level,
          field_of_study: formData.field_of_study,
          gpa: formData.gpa || null,
          preferred_countries: formData.preferred_countries,
          goals: formData.goals,
        } as any,
        { onConflict: "id" }
      );

      if (upsertError) throw upsertError;

      setUser({
        id: user.id,
        email: user.email || "",
        full_name: formData.full_name,
        country: formData.country,
        level: formData.level as StudyLevel,
        field_of_study: formData.field_of_study,
        gpa: formData.gpa,
        preferred_countries: formData.preferred_countries,
        goals: formData.goals,
        created_at: new Date().toISOString(),
      } as User);

      track("onboarding_complete", { level: formData.level, field: formData.field_of_study });

      router.push("/swipe");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Welcome! Who are you?",
      description: "Let's get to know you better.",
      icon: <Sparkles className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Your full name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Your Country</label>
            <select
              value={formData.country}
              onChange={(e) => updateField("country", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="" className="bg-zinc-900">
                Select your country
              </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Your Academic Profile",
      description: "What are you studying?",
      icon: <GraduationCap className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Study Level</label>
            <div className="grid grid-cols-3 gap-2">
              {STUDY_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => updateField("level", level)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-all ${
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

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Field of Study</label>
            <select
              value={formData.field_of_study}
              onChange={(e) => updateField("field_of_study", e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            >
              <option value="" className="bg-zinc-900">
                Select your field
              </option>
              {FIELDS.map((f) => (
                <option key={f} value={f} className="bg-zinc-900">
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              GPA (optional)
            </label>
            <input
              type="text"
              value={formData.gpa}
              onChange={(e) => updateField("gpa", e.target.value)}
              placeholder="e.g. 3.7 / 4.0"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Where do you want to study?",
      description: "Select countries you're interested in.",
      icon: <Globe className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">
            Select all that apply ({formData.preferred_countries.length} selected)
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => togglePreferredCountry(country)}
                className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all text-left ${
                  formData.preferred_countries.includes(country)
                    ? "bg-accent/20 border-accent/50 text-accent-light"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "What are your goals?",
      description: "Share your aspirations.",
      icon: <Target className="w-5 h-5" />,
      content: (
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">
            Your career and life goals
          </label>
          <textarea
            value={formData.goals}
            onChange={(e) => updateField("goals", e.target.value)}
            placeholder="I want to use my education in environmental science to develop sustainable solutions for my community..."
            rows={5}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
          />
          <p className="text-xs text-zinc-500">
            This will help us match you with relevant scholarships and
            generate personalized applications.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-accent" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent-light">
            {steps[step].icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {steps[step].title}
            </h2>
            <p className="text-sm text-zinc-500">
              {steps[step].description}
            </p>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5"
        >
          {steps[step].content}

          {error && (
            <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors ${
              step === 0 ? "invisible" : ""
            }`}
          >
            Back
          </button>

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="px-6 py-2.5 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Start Discovering
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Blackspace v4 — Open-ended discovery suggestion engine.
// Shared by onboarding and profile. This is the "interpret, don't
// categorize" layer: it turns free-form words into tappable opportunity
// suggestions. It is intentionally NOT a closed category system — the
// list below is just seed vocabulary; new interests are matched by
// keyword overlap and fall through to broad suggestions otherwise.

import { OpportunityCategory } from "./types";

export interface DiscoverySuggestion {
  key: string;
  label: string;
  icon: string;
  category: OpportunityCategory | string;
  type: string;
}

export const ALL_SUGGESTIONS: DiscoverySuggestion[] = [
  { key: "art_schools", label: "Art schools", icon: "🎨", category: "academic", type: "scholarship" },
  { key: "creative_grants", label: "Creative grants", icon: "💰", category: "creative", type: "grant" },
  { key: "design_internships", label: "Design internships", icon: "🚀", category: "creative", type: "internship" },
  { key: "exhibitions", label: "Exhibitions & residencies", icon: "🏛️", category: "creative", type: "residency" },
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
  { key: "cooking_competitions", label: "Cooking competitions", icon: "🍳", category: "creative", type: "competition" },
  { key: "poetry_slams", label: "Poetry slams", icon: "📝", category: "creative", type: "creative_call" },
  { key: "marathons", label: "Marathons & races", icon: "🏃", category: "athletic", type: "athletic_trial" },
];

// Keyword → suggestion matching. Anything not covered here falls through
// to extractInterestWords() + broad suggestions — never a dead end.
export function matchSuggestions(query: string): DiscoverySuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const keywords: Record<string, string[]> = {
    art: ["art_schools", "creative_grants", "design_internships", "exhibitions", "creative_gigs"],
    paint: ["art_schools", "creative_grants", "exhibitions"],
    design: ["design_internships", "creative_gigs", "fashion_opportunities"],
    creative: ["creative_grants", "creative_gigs", "design_internships", "exhibitions", "casting_calls"],
    football: ["football_trials", "sports_scholarships"],
    sport: ["football_trials", "sports_scholarships", "athletic_programs", "marathons"],
    athlet: ["football_trials", "sports_scholarships", "athletic_programs"],
    trial: ["football_trials", "athletic_programs"],
    tech: ["tech_internships", "software_jobs", "coding_bootcamps"],
    cod: ["coding_bootcamps", "software_jobs", "tech_internships"],
    software: ["software_jobs", "tech_internships"],
    engineer: ["software_jobs", "tech_internships"],
    develop: ["software_jobs", "tech_internships"],
    business: ["business_grants", "startup_funding", "mba_programs"],
    startup: ["startup_funding", "business_grants", "startup_weekends"],
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
    chef: ["culinary_programs", "apprenticeships", "cooking_competitions"],
    culinary: ["culinary_programs", "apprenticeships", "cooking_competitions"],
    cook: ["culinary_programs", "apprenticeships", "cooking_competitions"],
    intern: ["internships", "tech_internships", "design_internships", "remote_internships"],
    job: ["full_time_jobs", "software_jobs", "remote_jobs"],
    grant: ["grants", "creative_grants", "business_grants", "film_grants", "research_grants"],
    fellow: ["fellowships", "writing_fellowships"],
    research: ["research_grants", "fellowships"],
    write: ["writing_fellowships", "creative_grants", "poetry_slams"],
    poetry: ["poetry_slams", "writing_fellowships", "creative_grants"],
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
    competition: ["chess_tournaments", "esports_competitions", "debate_competitions", "robotics_competitions", "science_fairs", "cooking_competitions"],
    compete: ["hackathons", "chess_tournaments", "esports_competitions"],
    marath: ["marathons"],
    run: ["marathons", "athletic_programs"],
    dance: ["casting_calls", "creative_gigs"],
    sing: ["music_programs", "casting_calls"],
    photography: ["creative_grants", "creative_gigs", "exhibitions"],
    teach: ["coding_bootcamps", "apprenticeships", "academic_programs"],
    language: ["writing_fellowships", "academic_programs"],
    volunteer: ["grants", "apprenticeships"],
    beauty: ["fashion_opportunities", "modeling_gigs"],
    hair: ["apprenticeships", "culinary_programs"],
  };

  const matchedKeys = new Set<string>();
  for (const [keyword, keys] of Object.entries(keywords)) {
    if (q.includes(keyword)) {
      keys.forEach((k) => matchedKeys.add(k));
    }
  }

  // If nothing matched, return broad suggestions so the user is NEVER
  // left with an empty state (no dead ends).
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

// Pulls meaningful words out of any free-text phrase. Used to seed
// user.interests from what the user actually typed.
export function extractInterestWords(text: string): string[] {
  const stopWords = new Set([
    "what", "that", "this", "with", "from", "your", "have", "about",
    "looking", "want", "some", "like", "love", "wanting", "looking for",
    "for", "the", "and", "any", "get", "find", "need", "opportunities",
    "opportunity", "please", "where", "can", "into",
  ]);
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  )].slice(0, 10);
}

// Builds the interests array the same way regardless of whether the user
// typed free text, tapped chips, or both.
export function buildInterests(freeText: string, selectedLabels: string[]): string[] {
  const fromText = extractInterestWords(freeText);
  const fromChips = selectedLabels.map((l) => l.toLowerCase());
  return [...new Set([...fromText, ...fromChips])].slice(0, 12);
}

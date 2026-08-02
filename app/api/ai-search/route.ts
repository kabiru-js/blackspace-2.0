import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";
import {
  normalizeQuery,
  expandKeywords,
  baselineSearch,
  aiExpandCached,
  progressiveFallback,
  scoreResults,
} from "@/lib/search";

// Query normalisation map — common phrases → structured filters.
// NOTE: this is a fast-path pre-processor, not the source of truth.
// category/type/level here are SOFT ranking hints, never hard filters.
const QUERY_NORMS: Record<string, Partial<ParsedIntent>> = {
  "football trial": { type: "athletic_trial", category: "athletic" },
  "soccer trial": { type: "athletic_trial", category: "athletic" },
  "basketball trial": { type: "athletic_trial", category: "athletic" },
  "sport trial": { type: "athletic_trial", category: "athletic" },
  "modelling agenc": { type: "creative_call", category: "creative", field: "Modeling" },
  "modeling agenc": { type: "creative_call", category: "creative", field: "Modeling" },
  "casting": { type: "creative_call", category: "creative" },
  "audition": { type: "creative_call", category: "creative" },
  "remote job": { is_remote: true, type: "job" },
  "work from home": { is_remote: true },
  "remote intern": { is_remote: true, type: "internship" },
  "remote design": { is_remote: true, category: "creative" },
  "fully funded": { funding_type: "full" },
  "paid intern": { funding_type: "paid", type: "internship" },
  "artist residenc": { type: "residency", category: "creative" },
  "film grant": { type: "grant", category: "creative" },
  "photography grant": { type: "grant", category: "creative" },
  "startup grant": { type: "grant", category: "career" },
  "research grant": { type: "grant", category: "academic" },
  "phd": { level: "phd", category: "academic" },
  "masters": { level: "masters", category: "academic" },
  "undergrad": { level: "undergraduate", category: "academic" },
  "bachelor": { level: "undergraduate", category: "academic" },
  "entry level": { level: "early_career" },
  "beginner": { level: "early_career" },
  "junior": { level: "early_career" },
  "senior": { level: "mid_career" },
  "experienced": { level: "mid_career" },
  "visa sponsor": { category: "career", type: "job" },
  "scholarship": { type: "scholarship", category: "academic" },
  "fellowship": { type: "fellowship" },
  "hackathon": { type: "hackathon", category: "career", keywords: ["hackathon", "coding", "build"] },
  "hack day": { type: "hackathon", category: "career" },
  "game jam": { type: "hackathon", category: "creative", keywords: ["gamejam", "game design"] },
  "chess tournament": { type: "competition", category: "academic", keywords: ["chess", "tournament"] },
  "spelling bee": { type: "competition", category: "academic", keywords: ["spelling", "competition"] },
  "debate competition": { type: "competition", category: "academic", keywords: ["debate"] },
  "robotics competition": { type: "competition", category: "academic", keywords: ["robotics"] },
  "science fair": { type: "competition", category: "academic", keywords: ["science", "fair"] },
  "esports": { type: "competition", category: "athletic", keywords: ["esports", "gaming"] },
  "marathon": { type: "athletic_trial", category: "athletic", keywords: ["running", "marathon"] },
  "cooking competition": { type: "competition", category: "creative", keywords: ["cooking", "culinary"] },
  "poetry slam": { type: "creative_call", category: "creative", keywords: ["poetry", "writing"] },
  "art residenc": { type: "residency", category: "creative" },
  "startup weekend": { type: "hackathon", category: "career", keywords: ["startup", "pitch"] },
};

interface ParsedIntent {
  category: string | null;
  type: string | null;
  keywords: string[];
  location: string | null;
  is_remote: boolean | null;
  funding_type: string | null;
  level: string | null;
  field: string | null;
  age_under: number | null;
  country: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(ip, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { query, userId } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // ── 1. Deterministic keyword layer (works with NO AI) ──
    const baseWords = normalizeQuery(query);
    const baseKeywords = expandKeywords(baseWords);

    // ── 2. Controlled AI expansion (optional, cached, never blocks) ──
    let aiKeywords: string[] = [];
    try {
      aiKeywords = await aiExpandCached(query);
    } catch { /* AI is a bonus, never a dependency */ }

    const finalKeywords = Array.from(new Set([...baseKeywords, ...aiKeywords])).slice(0, 12);

    // ── 3. Rule overrides (category/type/level as SOFT hints) ──
    let normOverrides: Partial<ParsedIntent> = {};
    const lower = query.toLowerCase();
    for (const [pattern, overrides] of Object.entries(QUERY_NORMS)) {
      if (lower.includes(pattern)) normOverrides = { ...normOverrides, ...overrides };
    }
    const ageMatch = lower.match(/under\s+(\d{1,2})/);
    if (ageMatch) normOverrides.age_under = parseInt(ageMatch[1]);

    const parsed = { ...defaultIntent(), ...normOverrides };
    // Guarantee keywords from the query are always in the parsed result
    parsed.keywords = finalKeywords;

    // ── 4. Baseline search (deterministic, multi-strategy) ──
    let results = await baselineSearch(supabase, finalKeywords);
    let fallbackUsed = results.length === 0;

    if (fallbackUsed) {
      results = await progressiveFallback(supabase, finalKeywords, parsed.category);
    }

    // ── 5. Score + diversify + rank ──
    const scored = scoreResults(results, finalKeywords, parsed);

    // ── 6. Log (observability — never blocks the response) ──
    try {
      await supabase.from("search_logs").insert({
        query,
        keywords: finalKeywords,
        result_count: scored.length,
        fallback_used: fallbackUsed,
      } as any);
    } catch { /* logging must never break search */ }

    return NextResponse.json({
      parsed,
      results: scored,
      searchedKeywords: finalKeywords,
      fallbackUsed,
      query,
      hasAiParsing: aiKeywords.length > 0,
    });
  } catch (error: any) {
    console.error("ai-search error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Search failed" }, { status: 500 });
  }
}

function defaultIntent(): ParsedIntent {
  return {
    category: null, type: null, keywords: [], location: null,
    is_remote: null, funding_type: null, level: null, field: null,
    age_under: null, country: null,
  };
}

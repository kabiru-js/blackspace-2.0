import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

// Query normalisation map — common phrases → structured filters.
// NOTE: this is a fast-path pre-processor, not the source of truth.
// If a query doesn't match anything here, `keywords`/`tags` still always
// gets populated (see getBasicParsing / parseIntent below) — category and
// type are allowed to stay null. A null category/type must NEVER mean
// "no results" — it just means "score by tags/keywords instead."
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
  // ── Previously missing — the exact gap that caused "hackathon" to
  // return category:null, type:null. Every entry below closes one gap,
  // but the REAL fix is that getBasicParsing() and the LLM prompt no
  // longer require a match here to produce a useful, tag-rich result. ──
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
    const rl = rateLimit(ip, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { query, userId } = await request.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Step 1: Query normalization (rule-based pre-processing, fast path)
    let normOverrides: Partial<ParsedIntent> = {};
    const lower = query.toLowerCase();
    for (const [pattern, overrides] of Object.entries(QUERY_NORMS)) {
      if (lower.includes(pattern)) {
        normOverrides = { ...normOverrides, ...overrides };
      }
    }

    // Extract age constraints (under 21, under 18, etc.)
    const ageMatch = lower.match(/under\s+(\d{1,2})/);
    if (ageMatch) normOverrides.age_under = parseInt(ageMatch[1]);

    // Step 2: DeepSeek intent parsing (open-ended — see parseIntent)
    const parsed = await parseIntent(query);

    // Step 3: Merge normalized overrides with AI parsing
    const merged = { ...parsed, ...normOverrides };
    if (normOverrides.keywords) {
      merged.keywords = [...new Set([...(parsed.keywords || []), ...(normOverrides.keywords || [])])];
    }

    // Step 4: Guarantee keywords are NEVER empty. Even if category/type
    // stay null because nothing matched, the raw significant words from
    // the query always become tags — this is what keeps the product
    // "opportunity-agnostic" for literally any interest, not just the
    // ones we thought to hardcode.
    if (!merged.keywords || merged.keywords.length === 0) {
      merged.keywords = extractKeywords(query);
    }

    // Step 5: Actually fetch matching opportunities from the DB, scored
    // against THIS query (not the profile). This is what makes search
    // useful — chips alone weren't results.
    const results = await searchOpportunities(merged, userId);

    return NextResponse.json({ parsed: merged, results, query, hasAiParsing: !!process.env.DEEPSEEK_API_KEY });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ── Opportunity retrieval + query-relevance scoring ───────────
// Builds a Supabase query from the parsed intent, then scores every hit
// against the QUERY itself (not the user profile) so results are ranked
// by how well they match what the user asked for.
async function searchOpportunities(parsed: ParsedIntent, userId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);

  try {
    let query = supabase.from("scholarships").select("*");

    // Exclude opportunities this user already swiped on
    const { data: swipes } = await supabase
      .from("swipes")
      .select("scholarship_id")
      .eq("user_id", userId);
    const swipedIds = new Set((swipes || []).map((s: any) => s.scholarship_id));

    // Tag/keyword overlap — the primary signal. Uses array overlap so a
    // "culinary" query matches opportunities tagged ["culinary", ...]
    // even when their type/category say nothing about food.
    const keywords = (parsed.keywords || []).slice(0, 6);
    if (keywords.length > 0) {
      query = query.overlaps("tags", keywords);
    } else if (parsed.category || parsed.type) {
      // No keywords but we have a category/type — match on those instead.
      const filters: string[] = [];
      if (parsed.type) filters.push(`type.eq.${parsed.type}`);
      if (parsed.category) filters.push(`category.eq.${parsed.category}`);
      query = query.or(filters.join(","));
    }

    // Secondary hard filters from the parsed intent
    if (parsed.category) query = query.eq("category", parsed.category);
    if (parsed.type) query = query.eq("type", parsed.type);
    if (parsed.is_remote) query = query.eq("is_remote", true);
    if (parsed.funding_type) query = query.eq("funding_type", parsed.funding_type);
    if (parsed.country) query = query.eq("country", parsed.country);
    if (parsed.level && parsed.level !== "all") query = query.eq("level", parsed.level);

    query = query.limit(30);

    const { data, error } = await query;
    if (error) {
      console.error("ai-search DB error:", error.message);
      return [];
    }

    const items = (data as any[] || [])
      .filter((o) => !swipedIds.has(o.id));

    // Score against the QUERY: interest (keywords vs tags) 50%, category 15%,
    // type 15%, location 10%, funding/remote 10%.
    const kwLower = keywords.map((k) => k.toLowerCase());
    const scored = items.map((o) => {
      let score = 0;

      const tags = (o.tags || []).map((t: string) => t.toLowerCase());
      const matchedKw = kwLower.filter((k) =>
        tags.some((t: string) => t.includes(k) || k.includes(t)) ||
        o.title?.toLowerCase().includes(k)
      );
      score += (matchedKw.length / Math.max(kwLower.length, 1)) * 50;

      if (parsed.category && o.category === parsed.category) score += 15;
      if (parsed.type && o.type === parsed.type) score += 15;
      if (parsed.country && o.country === parsed.country) score += 10;
      if (parsed.funding_type && o.funding_type === parsed.funding_type) score += 5;
      if (parsed.is_remote && o.is_remote) score += 5;

      return { ...o, match_score: Math.round(Math.min(score, 100)) };
    });

    return scored
      .sort((a: any, b: any) => b.match_score - a.match_score)
      .slice(0, 20);
  } catch (err) {
    console.error("ai-search retrieval error:", err);
    return [];
  }
}

async function parseIntent(query: string): Promise<ParsedIntent> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return getBasicParsing(query);

  // IMPORTANT: category/type are offered as *suggestions*, not a closed
  // enum the model must squeeze the answer into. If the opportunity the
  // user describes doesn't cleanly fit any of them (hackathons, chess
  // tournaments, esports, spelling bees, game jams...), the model is
  // explicitly told to invent a short, sensible type string instead of
  // forcing a bad fit or returning null. `keywords` must always be
  // populated regardless of how category/type resolve.
  const prompt = `Parse this opportunity-seeking query into structured filters.

Query: "${query}"

Common categories (not exhaustive): academic, career, creative, athletic
Common types (not exhaustive): scholarship, fellowship, job, internship, grant, creative_call, athletic_trial, hackathon, competition, residency

If the query describes something that doesn't cleanly fit one of the common
categories/types above (e.g. "chess tournament", "esports team", "spelling
bee", "game jam", "cooking competition"), do NOT force it into the closest
common value and do NOT return null. Instead invent a short, lowercase,
snake_case type/category that accurately describes it (e.g.
type: "chess_tournament", category: "academic").

Always populate "keywords" with 3-6 specific, meaningful words from the
query, regardless of how category/type resolve.

Return ONLY JSON:
{
  "category": "short snake_case string or null",
  "type": "short snake_case string or null",
  "keywords": ["k1","k2","k3"],
  "location": "city/country/remote/null",
  "country": "specific country if mentioned or null",
  "is_remote": true|false|null,
  "funding_type": "full"|"partial"|"paid"|null,
  "level": "undergraduate"|"masters"|"phd"|"early_career"|"mid_career"|"all"|null,
  "field": "broad field name or null"
}
JSON:`;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 256,
      }),
    });

    if (!res.ok) return getBasicParsing(query);

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) cleaned = cleaned.replace(/```\w*\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);
    if (!result.keywords || result.keywords.length === 0) {
      result.keywords = extractKeywords(query);
    }
    return result;
  } catch {
    return getBasicParsing(query);
  }
}

// Pulls meaningful words out of any free-text query. This is the fallback
// that guarantees a query about ANYTHING — no matter how obscure or
// unanticipated — still produces usable tags for scoring, even when
// category/type can't be determined.
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "the", "and", "for", "with", "that", "this", "from", "want", "looking",
    "opportunities", "opportunity", "some", "have", "about", "your", "like",
    "find", "need", "any", "get",
  ]);
  return [...new Set(
    query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  )].slice(0, 6);
}

function getBasicParsing(query: string): ParsedIntent {
  const lower = query.toLowerCase();
  const result: ParsedIntent = { keywords: [], category: null, type: null, location: null, is_remote: null, funding_type: null, level: null, field: null, age_under: null, country: null };

  result.keywords = extractKeywords(query);

  if (lower.includes("remote") || lower.includes("work from home")) result.is_remote = true;
  if (lower.includes("full") && (lower.includes("funded") || lower.includes("scholarship"))) result.funding_type = "full";
  if (lower.includes("paid")) result.funding_type = "paid";

  // ── Type detection — broadened net. Anything not caught here simply
  // stays null; it will still be scored via keywords/tags, never dropped. ──
  if (lower.includes("intern")) result.type = "internship";
  else if (lower.includes("scholarship")) { result.type = "scholarship"; result.category = "academic"; }
  else if (lower.includes("job") || lower.includes("hire") || lower.includes("position")) result.type = "job";
  else if (lower.includes("grant")) result.type = "grant";
  else if (lower.includes("fellowship")) result.type = "fellowship";
  else if (lower.includes("hackathon") || lower.includes("hack day") || lower.includes("game jam")) { result.type = "hackathon"; result.category = "career"; }
  else if (lower.includes("tournament") || lower.includes("championship") || lower.includes("chess") || lower.includes("spelling bee") || lower.includes("debate") || lower.includes("science fair") || lower.includes("esports")) { result.type = "competition"; }
  else if (lower.includes("residenc")) { result.type = "residency"; result.category = "creative"; }
  else if (lower.includes("trial") || lower.includes("sport") || lower.includes("athlet") || lower.includes("football") || lower.includes("basketball") || lower.includes("marathon")) { result.type = "athletic_trial"; result.category = "athletic"; }

  // ── Category detection (independent of type — an opportunity can have
  // a recognized category with an unrecognized type, or vice versa) ──
  if (!result.category) {
    if (lower.includes("creative") || lower.includes("artist") || lower.includes("film") || lower.includes("design") || lower.includes("music") || lower.includes("cooking") || lower.includes("fashion") || lower.includes("model")) result.category = "creative";
    else if (lower.includes("academic") || lower.includes("study") || lower.includes("university") || lower.includes("college") || lower.includes("chess") || lower.includes("spelling") || lower.includes("debate") || lower.includes("science")) result.category = "academic";
    else if (lower.includes("job") || lower.includes("career") || lower.includes("position") || lower.includes("developer") || lower.includes("engineer") || lower.includes("startup")) result.category = "career";
    else if (lower.includes("sport") || lower.includes("athlet") || lower.includes("esports")) result.category = "athletic";
  }

  if (lower.includes("beginner") || lower.includes("entry")) result.level = "early_career";
  if (lower.includes("senior")) result.level = "mid_career";

  return result;
}

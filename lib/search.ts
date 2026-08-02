// Blackspace v4 — deterministic-first search core.
// Order of trust: keywords/synonyms (no AI) → FTS → ilike → tags →
// controlled AI expansion (optional) → progressive fallback → never empty.
//
// The design goal: search NEVER depends on the LLM, NEVER returns empty,
// and ALWAYS tells you what it understood (keywords are returned to the UI).

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// ── Deterministic query normalization (no AI) ──────────────
export function normalizeQuery(query: string): string[] {
  return [...new Set(
    query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  )];
}

// ── Controlled synonym map (cheap, predictable, patchable) ──
const SYNONYMS: Record<string, string[]> = {
  ai: ["artificial_intelligence", "machine_learning", "data_science"],
  "machine learning": ["ai", "artificial_intelligence", "data_science"],
  culinary: ["cooking", "chef", "hospitality", "food", "culinary_arts"],
  cooking: ["culinary", "chef", "hospitality", "food"],
  chef: ["culinary", "cooking", "hospitality", "food"],
  language: ["linguistics", "translation", "language_learning"],
  languages: ["linguistics", "translation", "language_learning"],
  business: ["management", "finance", "entrepreneurship", "commerce"],
  finance: ["business", "management", "economics", "accounting"],
  football: ["soccer", "athletic_trial", "football_trial"],
  soccer: ["football", "athletic_trial"],
  sport: ["athletic", "football", "soccer"],
  creative: ["design", "art", "media", "artistic"],
  art: ["creative", "design", "fine_arts", "artistic"],
  design: ["creative", "art", "ux", "ui", "graphic_design"],
  music: ["creative", "performing_arts", "musicianship"],
  film: ["creative", "cinema", "media", "video"],
  fashion: ["creative", "design", "apparel", "modeling"],
  model: ["modeling", "fashion", "creative"],
  tech: ["technology", "software", "computer_science", "it"],
  technology: ["tech", "software", "computer_science"],
  software: ["technology", "tech", "coding", "programming"],
  coding: ["programming", "software", "technology"],
  programming: ["coding", "software", "development"],
  data: ["data_science", "analytics", "statistics"],
  statistics: ["data", "data_science", "analytics"],
  hackathon: ["competition", "coding", "buildathon", "game_jam"],
  esports: ["gaming", "competition", "athletic"],
  gaming: ["esports", "competition"],
  chess: ["strategy", "competition"],
  scholarship: ["funding", "financial_aid", "bursary"],
  grant: ["funding", "scholarship", "award"],
  internship: ["placement", "work_experience", "trainee"],
  job: ["career", "employment", "position", "work"],
  career: ["job", "employment", "professional"],
  research: ["academic", "science", "fellowship"],
  science: ["research", "stem", "academic"],
  engineering: ["stem", "technology", "tech"],
  medicine: ["healthcare", "medical", "health"],
  law: ["legal", "jurisprudence"],
  writing: ["journalism", "author", "creative"],
  photography: ["visual_arts", "creative", "media"],
  dance: ["performing_arts", "creative"],
  entrepreneur: ["startup", "business", "founder"],
  startup: ["entrepreneur", "business", "venture"],
  remote: ["work_from_home", "online", "virtual"],
  volunteer: ["community", "nonprofit", "service"],
  education: ["teaching", "academic", "learning"],
  teaching: ["education", "academic"],
  environment: ["sustainability", "climate", "green"],
  agriculture: ["farming", "rural", "sustainability"],
};

export function expandKeywords(words: string[]): string[] {
  const expanded = new Set<string>();
  words.forEach((w) => {
    expanded.add(w);
    const syns = SYNONYMS[w];
    if (syns) syns.forEach((s) => expanded.add(s));
    // Also expand each word against the map keys (multi-word matching)
    Object.entries(SYNONYMS).forEach(([key, values]) => {
      if (words.includes(key) || key.includes(w)) values.forEach((v) => expanded.add(v));
    });
  });
  return Array.from(expanded);
}

// ── Baseline retrieval: FTS + ilike + tags, parallel, tolerant ──
export async function baselineSearch(
  supabase: SupabaseClient<Database>,
  keywords: string[]
) {
  const seen = new Map<string, any>();
  const kw = keywords.slice(0, 10);

  // 1) Full-text search (stemming). Safe to fail (column may not exist yet).
  try {
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .textSearch("search_vector", kw.join(" "), { type: "plain" })
      .limit(30);
    (data || []).forEach((r: any) => seen.set(r.id, r));
  } catch { /* FTS column missing — fall through to ilike/tags */ }

  // 2) ilike across title + description (works on any schema)
  if (kw.length > 0) {
    try {
      const orFilters = kw.map((k) => `title.ilike.%${k}%,description.ilike.%${k}%`).join(",");
      const { data } = await supabase
        .from("scholarships")
        .select("*")
        .or(orFilters)
        .limit(30);
      (data || []).forEach((r: any) => seen.set(r.id, r));
    } catch { /* noop */ }
  }

  // 3) Array overlap on tags (exact-tag match)
  if (kw.length > 0) {
    try {
      const { data } = await supabase
        .from("scholarships")
        .select("*")
        .overlaps("tags", kw)
        .limit(30);
      (data || []).forEach((r: any) => seen.set(r.id, r));
    } catch { /* noop */ }
  }

  return Array.from(seen.values());
}

// ── Controlled AI expansion (optional, never blocking) ──
export async function aiExpand(query: string): Promise<string[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return [];

  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{
        role: "user",
        content: `Expand this opportunity-seeking query into search keywords.

Query: "${query}"

Rules:
- return 5-8 keywords
- include synonyms and closely related terms
- lowercase only, no punctuation
- be specific

Return ONLY JSON: { "keywords": ["..."] }`,
      }],
      temperature: 0.4,
      max_tokens: 128,
    }),
  });

  if (!res.ok) return [];
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || "";
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) cleaned = cleaned.replace(/```\w*\n?/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const kw = Array.isArray(parsed?.keywords) ? parsed.keywords : [];
  // Sanitize: only safe lowercase alphanumeric/space tokens
  return kw
    .map((k: string) => String(k).toLowerCase().replace(/[^a-z0-9_ ]/g, "").trim())
    .filter((k: string) => k.length > 2 && k.length <= 30)
    .slice(0, 8);
}

// ── Progressive fallback: never return empty ──
export async function progressiveFallback(
  supabase: SupabaseClient<Database>,
  keywords: string[],
  category: string | null
) {
  // Tier 1: retry with base keywords only (no AI words, no synonyms)
  const baseOnly = normalizeQuery(keywords.join(" ")).slice(0, 3);
  if (baseOnly.length > 0) {
    const res = await baselineSearch(supabase, baseOnly);
    if (res.length > 0) return res;
  }

  // Tier 2: single strongest keyword (loosest lexical net)
  if (keywords.length > 1) {
    const single = keywords.slice(0, 1);
    const res = await baselineSearch(supabase, single);
    if (res.length > 0) return res;
  }

  // Tier 3: category-only match
  if (category) {
    try {
      const { data } = await supabase
        .from("scholarships")
        .select("*")
        .eq("category", category)
        .limit(20);
      if (data && data.length > 0) return data as any[];
    } catch { /* noop */ }
  }

  // Tier 4: most recent (guaranteed non-empty if table has any rows)
  const { data } = await supabase
    .from("scholarships")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []) as any[];
}

// ── Ranking: keyword overlap (title+description+tags) + soft boosts ──
export function scoreResults(
  items: any[],
  keywords: string[],
  parsed: any
) {
  const kwLower = keywords.map((k) => k.toLowerCase());
  const scored = items.map((o) => {
    let score = 0;
    const title = (o.title || "").toLowerCase();
    const desc = (o.description || "").toLowerCase();
    const tags = (o.tags || []).map((t: string) => t.toLowerCase());
    const haystack = `${title} ${desc} ${tags.join(" ")}`;

    const matched = kwLower.filter((k) => haystack.includes(k));
    score += (matched.length / Math.max(kwLower.length, 1)) * 50;

    if (parsed?.category && o.category === parsed.category) score += 15;
    if (parsed?.type && o.type === parsed.type) score += 15;
    if (parsed?.country && o.country === parsed.country) score += 10;
    if (parsed?.funding_type && o.funding_type === parsed.funding_type) score += 5;
    if (parsed?.is_remote && o.is_remote) score += 5;

    return { ...o, match_score: Math.round(Math.min(score, 100)) };
  });

  scored.sort((a: any, b: any) => b.match_score - a.match_score);

  // Diversity: at most 2 per provider, keeps the deck from feeling samey
  const byProvider = new Map<string, number>();
  const diverse: any[] = [];
  for (const item of scored) {
    const p = item.provider || "unknown";
    const count = byProvider.get(p) || 0;
    if (count < 2) {
      byProvider.set(p, count + 1);
      diverse.push(item);
    }
    if (diverse.length >= 20) break;
  }
  return diverse.length > 0 ? diverse : scored.slice(0, 20);
}

// ── Simple in-memory AI cache (per warm instance, 24h TTL) ──
const aiCache = new Map<string, { value: string[]; expires: number }>();
export async function aiExpandCached(query: string): Promise<string[]> {
  const key = `ai:${query.toLowerCase().trim()}`;
  const hit = aiCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = await aiExpand(query);
  aiCache.set(key, { value, expires: Date.now() + 24 * 60 * 60 * 1000 });
  return value;
}

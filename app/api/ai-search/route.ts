import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

// Query normalisation map — common phrases → structured filters
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
  "artist residenc": { type: "creative_call", category: "creative" },
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

    // Step 1: Query normalization (rule-based pre-processing)
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

    // Step 2: DeepSeek intent parsing
    const parsed = await parseIntent(query);

    // Step 3: Merge normalized overrides with AI parsing
    const merged = { ...parsed, ...normOverrides };
    if (normOverrides.keywords) {
      merged.keywords = [...new Set([...(parsed.keywords || []), ...(normOverrides.keywords || [])])];
    }

    return NextResponse.json({ parsed: merged, query, hasAiParsing: !!process.env.DEEPSEEK_API_KEY });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function parseIntent(query: string): Promise<ParsedIntent> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return getBasicParsing(query);

  const prompt = `Parse this query into structured opportunity filters.

Query: "${query}"

Categories: academic, career, creative, athletic
Types: scholarship, fellowship, job, internship, grant, creative_call, athletic_trial

Return ONLY JSON:
{
  "category": "career"|"creative"|"academic"|"athletic"|null,
  "type": "job"|"internship"|"scholarship"|"fellowship"|"grant"|"creative_call"|"athletic_trial"|null,
  "keywords": ["k1","k2"],
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
    return JSON.parse(cleaned);
  } catch {
    return getBasicParsing(query);
  }
}

function getBasicParsing(query: string): ParsedIntent {
  const lower = query.toLowerCase();
  const result: ParsedIntent = { keywords: [], category: null, type: null, location: null, is_remote: null, funding_type: null, level: null, field: null, age_under: null, country: null };

  const words = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !["the","and","for","with","that","this","from"].includes(w));
  result.keywords = [...new Set(words)].slice(0, 5);

  if (lower.includes("remote") || lower.includes("work from home")) result.is_remote = true;
  if (lower.includes("full") && (lower.includes("funded") || lower.includes("scholarship"))) result.funding_type = "full";
  if (lower.includes("paid")) result.funding_type = "paid";
  if (lower.includes("intern")) result.type = "internship";
  if (lower.includes("scholarship")) { result.type = "scholarship"; result.category = "academic"; }
  if (lower.includes("job") || lower.includes("hire") || lower.includes("position")) result.type = "job";
  if (lower.includes("grant")) result.type = "grant";
  if (lower.includes("fellowship")) result.type = "fellowship";
  if (lower.includes("creative")||lower.includes("artist")||lower.includes("film")||lower.includes("design")) result.category = "creative";
  if (lower.includes("sport")||lower.includes("athlet")||lower.includes("football")||lower.includes("basketball")||lower.includes("trial")) result.category = "athletic";
  if (lower.includes("academic")||lower.includes("study")||lower.includes("university")||lower.includes("college")) result.category = "academic";
  if (lower.includes("job")||lower.includes("career")||lower.includes("position")||lower.includes("developer")||lower.includes("engineer")) result.category = "career";
  if (lower.includes("beginner")||lower.includes("entry")) result.level = "early_career";
  if (lower.includes("senior")) result.level = "mid_career";

  return result;
}

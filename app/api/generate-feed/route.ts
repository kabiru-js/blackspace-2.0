import { NextResponse } from "next/server";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId, interests, intents, preferredCountries, explorationLevel } = await req.json();

    if (!interests?.length && !intents?.length) {
      // Fallback: return empty, caller will use existing DB query
      return NextResponse.json({ scholarships: [] });
    }

    // ── Build the LLM prompt ──
    const interestList = (interests || []).join(", ");
    const intentList = (intents || []).join(", ");
    const locationPref = (preferredCountries || []).length === 0
      ? "global"
      : (preferredCountries || []).join(", ");

    const prompt = `You are an expert opportunity discovery assistant.

Your job is to convert a user's interests and goals into highly relevant search queries that will retrieve real-world opportunities.

User interests: ${interestList || "various"}
User goals: ${intentList || "explore"}
Location preference: ${locationPref}

Generate 8-12 highly relevant search queries for finding opportunities.

Include:
- formal opportunities (schools, programs, jobs)
- informal opportunities (grants, residencies, competitions, gigs)
- global variations

Avoid generic queries like "opportunities" or "things to do".

Be specific and realistic.

Return ONLY a JSON array of search queries. No markdown, no explanations.`;

    // ── Call DeepSeek ──
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ scholarships: [] });
    }

    const llmRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 512,
      }),
    });

    if (!llmRes.ok) {
      return NextResponse.json({ scholarships: [] });
    }

    const llmData = await llmRes.json();
    const rawContent = llmData.choices?.[0]?.message?.content || "[]";

    // Parse queries from LLM response
    let queries: string[] = [];
    try {
      queries = JSON.parse(rawContent);
    } catch {
      // Try to extract array from markdown
      const match = rawContent.match(/\[[\s\S]*\]/);
      if (match) {
        try { queries = JSON.parse(match[0]); } catch {}
      }
    }

    if (!queries.length) {
      return NextResponse.json({ scholarships: [] });
    }

    // ── For now, transform queries into opportunity stubs ──
    // In production, these queries would search an external API or DB
    const now = new Date();
    const scholarships = queries.slice(0, 8).map((query, i) => {
      // Infer category and type from query. Unlike the old version, an
      // unmatched query NEVER silently defaults to "academic"/"scholarship"
      // — that was actively mislabeling things (a "chess tournament" query
      // would have been stored as a scholarship). category/type stay null
      // when nothing matches; `tags` always carries the real signal, and
      // the matching engine scores on tags regardless of type/category.
      const q = query.toLowerCase();
      let category: string | null = null;
      let type: string | null = null;

      if (q.includes("job") || q.includes("career") || q.includes("hire")) { category = "career"; type = "job"; }
      else if (q.includes("intern") || q.includes("apprentice")) { category = "career"; type = "internship"; }
      else if (q.includes("hackathon") || q.includes("hack day") || q.includes("game jam") || q.includes("startup weekend")) { category = "career"; type = "hackathon"; }
      else if (q.includes("grant") || q.includes("funding")) { category = "academic"; type = "grant"; }
      else if (q.includes("art") || q.includes("design") || q.includes("creative") || q.includes("film") || q.includes("music") || q.includes("fashion") || q.includes("model") || q.includes("cooking") || q.includes("culinary")) { category = "creative"; type = "creative_call"; }
      else if (q.includes("residenc")) { category = "creative"; type = "residency"; }
      else if (q.includes("fellow") || q.includes("research")) { category = "academic"; type = "fellowship"; }
      else if (q.includes("scholarship")) { category = "academic"; type = "scholarship"; }
      else if (q.includes("chess") || q.includes("spelling") || q.includes("debate") || q.includes("science fair")) { category = "academic"; type = "competition"; }
      else if (q.includes("esports") || q.includes("gaming tournament")) { category = "athletic"; type = "competition"; }
      else if (q.includes("sport") || q.includes("football") || q.includes("athlet") || q.includes("trial") || q.includes("marathon")) { category = "athletic"; type = "athletic_trial"; }
      else if (q.includes("tournament") || q.includes("contest") || q.includes("competition") || q.includes("championship")) { type = "competition"; }

      // Extract tags from query — this ALWAYS runs, independent of whether
      // category/type resolved above. Tags are the real classification
      // signal used by the matching engine.
      const tags = q
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["international", "students", "programs", "global", "opportunities", "highly", "relevant"].includes(w.toLowerCase()))
        .slice(0, 5);

      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + 14 + Math.floor(Math.random() * 60));

      return {
        title: query.charAt(0).toUpperCase() + query.slice(1),
        provider: "AI-Discovered",
        country: preferredCountries?.[0] || "Global",
        category,
        type,
        level: "all",
        field: "Various",
        funding_type: Math.random() > 0.5 ? "full" : "partial",
        skills: [],
        is_remote: q.includes("remote"),
        deadline: deadline.toISOString().split("T")[0],
        description: `AI-discovered opportunity: ${query}. This was generated based on your interests.`,
        eligibility: "Open to all eligible candidates",
        requirements: "Check official listing for requirements",
        application_link: "",
        tags,
      };
    });

    return NextResponse.json({ scholarships });
  } catch (err) {
    console.error("generate-feed error:", err);
    return NextResponse.json({ scholarships: [] });
  }
}

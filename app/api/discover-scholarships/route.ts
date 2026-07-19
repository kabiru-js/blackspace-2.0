import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(ip, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const { level, field, preferredCountries, userId } = await request.json();

    if (!level || !field || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: level, field, userId" },
        { status: 400 }
      );
    }

    const countries =
      preferredCountries?.length > 0
        ? preferredCountries.slice(0, 3).join(", ")
        : "various countries";

    const prompt = `Find 5 real, currently-open or upcoming (2025-2026) scholarship programs for a ${level} student studying ${field}.

Preferred countries: ${countries}.

Return ONLY a valid JSON array of objects. No markdown, no explanations. Each object must have exactly these fields:
- title (string): full scholarship name
- provider (string): organization offering it
- country (string): host country
- level (string): "${level}" or close
- field (string): "${field}" or close
- funding_type (string): "full" or "partial"
- deadline (string): YYYY-MM-DD format, must be a future date
- description (string): 1-2 sentence summary
- eligibility (string): 1 sentence about requirements
- application_link (string): a plausible URL for the official application page
- tags (array of strings): 3-5 relevant tags

Rules:
- All scholarships MUST be real, known programs (Chevening, DAAD, Fulbright, Erasmus, etc.)
- Deadlines must be in the future (2025 or 2026)
- Descriptions must be factual and specific
- Application links must look real (use actual domain names of known scholarship providers where possible)

Return the JSON array now:`;

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (!deepseekKey) {
      return NextResponse.json(
        { error: "DeepSeek API key not configured" },
        { status: 500 }
      );
    }

    const aiResponse = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are a scholarship database API. You return ONLY valid JSON arrays. No markdown, no code fences, no explanations.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!aiResponse.ok) {
      throw new Error(`DeepSeek API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawText = aiData.choices?.[0]?.message?.content || "";

    // Try to parse JSON — clean up common AI formatting issues
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
    if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    let scholarships;
    try {
      scholarships = JSON.parse(cleaned);
    } catch {
      // Try extracting array from text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          scholarships = JSON.parse(match[0]);
        } catch {
          return NextResponse.json(
            { error: "Failed to parse AI response", raw: cleaned.substring(0, 500) },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "No JSON array found in AI response", raw: cleaned.substring(0, 500) },
          { status: 500 }
        );
      }
    }

    if (!Array.isArray(scholarships) || scholarships.length === 0) {
      return NextResponse.json(
        { error: "AI returned empty or invalid scholarship list" },
        { status: 500 }
      );
    }

    return NextResponse.json({ scholarships });
  } catch (error: any) {
    console.error("Discover scholarships error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { full_name, country, level, field_of_study, goals, preferred_countries } =
      await request.json();

    const prompt = `A scholarship applicant has this profile:
- Name: ${full_name}
- Country: ${country}
- Level: ${level}
- Field: ${field_of_study}
- Goals: ${goals}
- Preferred countries: ${(preferred_countries || []).join(", ")}

Suggest 3 specific improvements they can make to their profile to increase their chances of matching with better scholarships. Be concise but actionable. Format each suggestion as a bullet point.`;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ suggestions: [] });
    }

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are a scholarship advisor. Give concise, actionable advice.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 256,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Parse bullet points
    const suggestions = text
      .split("\n")
      .filter((line: string) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line: string) => line.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}

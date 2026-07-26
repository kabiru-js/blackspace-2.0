import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(ip, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const {
      jobTitle,
      company,
      description,
      userName,
      skills,
      experienceLevel,
      achievements,
      tone,
      prompt: customPrompt,
    } = await request.json();

    // Use custom prompt if provided (for refinement)
    if (customPrompt) {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) return NextResponse.json({ letter: "AI not configured. Add DEEPSEEK_API_KEY." });

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are an expert cover letter writer. Letters are concise, human, tailored. No clichés." },
            { role: "user", content: customPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ letter: getFallbackLetter(jobTitle || "", company || "", userName || "", skills || []) });
      }

      const data = await response.json();
      return NextResponse.json({ letter: data.choices?.[0]?.message?.content || "" });
    }

    if (!jobTitle || !company) {
      return NextResponse.json({ error: "jobTitle and company are required" }, { status: 400 });
    }

    const toneMap: Record<string, string> = {
      professional: "Formal, polished, and business-appropriate. Use traditional cover letter language.",
      confident: "Bold and self-assured. Show conviction in your abilities without being arrogant.",
      friendly: "Warm and approachable. Conversational but still professional.",
    };

    const toneGuide = toneMap[tone] || toneMap.professional;

    const prompt = `Write a concise, human-sounding cover letter for a job application.

Role: ${jobTitle}
Company: ${company}
Description: ${description || "Not provided"}
Candidate: ${userName || "The applicant"}
Skills: ${(skills || []).join(", ") || "Relevant skills"}
Experience: ${experienceLevel || "Experienced"}
Achievements: ${achievements || "Track record of delivering results"}
Tone: ${toneGuide}

RULES:
- 3-5 paragraphs MAX
- Do NOT use "I am writing to apply for" or generic openings
- Reference the specific role and company
- Connect skills to the job's value, not just list them
- End with a clear, confident closing
- Sound human — not like AI-generated spam
- Start with "Dear Hiring Team," or "Dear [Company] Team,"
- Sign with the candidate's name

Write the cover letter:`;

    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        letter: getFallbackLetter(jobTitle, company, userName, skills),
      });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            content:
              "You are an expert cover letter writer. Letters are concise, human, tailored. No clichés.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        letter: getFallbackLetter(jobTitle, company, userName, skills),
      });
    }

    const data = await response.json();
    return NextResponse.json({
      letter: data.choices?.[0]?.message?.content || getFallbackLetter(jobTitle, company, userName, skills),
    });
  } catch (error: any) {
    console.error("Cover letter error:", error);
    return NextResponse.json(
      { error: error.message || "Failed" },
      { status: 500 }
    );
  }
}

function getFallbackLetter(
  jobTitle: string,
  company: string,
  userName: string,
  skills: string[]
): string {
  const name = userName || "Applicant";
  const skillList = skills?.length ? skills.join(", ") : "relevant skills and experience";

  return `Dear ${company} Team,

I'm excited about the ${jobTitle} role at ${company}. With my background in ${skillList}, I believe I can make a meaningful contribution from day one.

I focus on delivering measurable results through a blend of strategic thinking and hands-on execution. I'm drawn to ${company}'s reputation for innovation and would love to help push that momentum further.

I'd welcome the chance to discuss how my experience aligns with your goals.

Best,
${name}`;
}

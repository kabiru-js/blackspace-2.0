import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { generatePersonalStatement, generateMotivationLetter } from "@/lib/ai";
import { rateLimit } from "@/lib/rateLimit";

async function generateCareerContent(userData: any, opp: any): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return `## Cover Letter\n\nDear Hiring Team,\n\nI am writing to express my interest in the ${opp.title} role at ${opp.provider}. With my background in ${userData.field_of_study} and experience in ${userData.skills?.join(", ") || "relevant areas"}, I believe I would be a valuable addition to your team.\n\nMy career goals include ${userData.goals || "growing as a professional and contributing to impactful projects"}. I am particularly drawn to this opportunity because of ${opp.provider}'s reputation and the chance to work in ${opp.country}.\n\nThank you for considering my application.\n\nSincerely,\n${userData.full_name}`;
  }

  const prompt = `Write a professional cover letter for the following opportunity:

Job: ${opp.title}
Company: ${opp.provider}
Location: ${opp.country} ${opp.is_remote ? "(Remote)" : ""}
Category: ${opp.category || "career"}
Requirements: ${opp.requirements || "Not specified"}

Applicant:
Name: ${userData.full_name}
Country: ${userData.country}
Field: ${userData.field_of_study}
Skills: ${userData.skills?.join(", ") || "Various"}
Goals: ${userData.goals || "Career growth"}

Generate a compelling cover letter (200-350 words). Start with "Dear Hiring Team,". Be confident, specific, and professional.`;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }], temperature: 0.8, max_tokens: 1024 }),
    });
    const data = await res.json();
    return `## Cover Letter\n\n${data.choices?.[0]?.message?.content || ""}`;
  } catch {
    return `## Cover Letter\n\nDear Hiring Team,\n\nI am writing to apply for the ${opp.title} position at ${opp.provider}...`;
  }
}

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

    const supabase = await createServerSupabaseClient();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, scholarshipId } = await request.json();

    if (!userId || !scholarshipId) {
      return NextResponse.json(
        { error: "Missing userId or scholarshipId" },
        { status: 400 }
      );
    }

    // Ensure the user is requesting their own data
    if (userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Fetch scholarship data
    const { data: scholarshipData, error: scholarshipError } = await supabase
      .from("scholarships")
      .select("*")
      .eq("id", scholarshipId)
      .single();

    if (scholarshipError || !scholarshipData) {
      return NextResponse.json(
        { error: "Scholarship not found" },
        { status: 404 }
      );
    }

    // Generate content using AI — category-aware
    const opp = scholarshipData;
    const oppCategory = opp.category || "academic";
    const oppType = opp.type || "scholarship";

    let generatedContent = "";

    if (oppCategory === "career" || oppType === "job" || oppType === "internship") {
      // Generate cover letter for jobs/internships
      generatedContent = await generateCareerContent(userData, opp);
    } else {
      // Default: personal statement + motivation letter
      const [essay, letter] = await Promise.all([
        generatePersonalStatement(
          { full_name: userData.full_name, country: userData.country, field_of_study: userData.field_of_study, goals: userData.goals || "" },
          { title: opp.title, country: opp.country, provider: opp.provider },
        ),
        generateMotivationLetter(
          { full_name: userData.full_name, country: userData.country, field_of_study: userData.field_of_study, goals: userData.goals || "" },
          { title: opp.title, country: opp.country, provider: opp.provider },
        ),
      ]);
      generatedContent = `## Personal Statement\n\n${essay}\n\n---\n\n## Motivation Letter\n\n${letter}`;
    }

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error("Generate essay error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

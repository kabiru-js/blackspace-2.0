import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { generatePersonalStatement, generateMotivationLetter } from "@/lib/ai";
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

    // Generate content using AI
    const [essay, letter] = await Promise.all([
      generatePersonalStatement(
        {
          full_name: userData.full_name,
          country: userData.country,
          field_of_study: userData.field_of_study,
          goals: userData.goals,
        },
        {
          title: scholarshipData.title,
          country: scholarshipData.country,
          provider: scholarshipData.provider,
        }
      ),
      generateMotivationLetter(
        {
          full_name: userData.full_name,
          country: userData.country,
          field_of_study: userData.field_of_study,
          goals: userData.goals,
        },
        {
          title: scholarshipData.title,
          country: scholarshipData.country,
          provider: scholarshipData.provider,
        }
      ),
    ]);

    return NextResponse.json({ essay, letter });
  } catch (error) {
    console.error("Generate essay error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

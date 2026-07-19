// Supabase Edge Function: Weekly Scholarship Digest
// Runs every Monday at 9am. Sends personalized scholarship recommendations.
//
// Deploy: supabase functions deploy send-weekly-digest
// Cron: 0 9 * * 1 (every Monday 9am)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async () => {
  try {
    // Fetch all users with profiles
    const { data: users } = await supabase.from("users").select("*");
    if (!users?.length) {
      return new Response(JSON.stringify({ success: true, sent: 0 }));
    }

    let sent = 0;

    for (const user of users) {
      if (!user.email) continue;

      // Find scholarships matching user profile (not yet swiped)
      const { data: swiped } = await supabase
        .from("swipes")
        .select("scholarship_id")
        .eq("user_id", user.id);

      const swipedIds = new Set((swiped || []).map((s) => s.scholarship_id));

      // Get recent scholarships matching their field/level
      const { data: matches } = await supabase
        .from("scholarships")
        .select("*")
        .or(`level.eq.${user.level},field.ilike.%${user.field_of_study}%`)
        .limit(5);

      const newMatches = (matches || []).filter((s) => !swipedIds.has(s.id));
      if (!newMatches.length) continue;

      const matchList = newMatches
        .map(
          (s) => `
          <div style="padding: 12px; margin-bottom: 12px; border: 1px solid #333; border-radius: 8px;">
            <strong>${s.title}</strong><br/>
            ${s.provider} — ${s.country}<br/>
            <span style="color: ${s.funding_type === "full" ? "#22c55e" : "#888"};">
              ${s.funding_type === "full" ? "Fully Funded" : "Partial Funding"}
            </span>
            &nbsp;·&nbsp; Deadline: ${s.deadline}
          </div>
        `
        )
        .join("");

      await resend.emails.send({
        from: "Blackspace <digest@blackspace.app>",
        to: user.email,
        subject: `New scholarships matching your profile — ${newMatches.length} this week`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">Blackspace Weekly</h1>
            <p>Hi ${user.full_name?.split(" ")[0] || "there"},</p>
            <p>Here are <strong>${newMatches.length} new scholarship${newMatches.length > 1 ? "s" : ""}</strong> matching your profile this week:</p>
            ${matchList}
            <a href="https://blackspace.app/swipe"
               style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;">
              View All Matches
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">
              Received weekly? <a href="https://blackspace.app/profile">Unsubscribe</a>
            </p>
          </div>
        `,
      });

      sent++;
    }

    return new Response(JSON.stringify({ success: true, sent }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

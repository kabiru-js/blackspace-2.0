// Supabase Edge Function: Deadline Reminders
// Runs every 6 hours via cron. Checks for liked scholarships with deadlines
// in 3, 7, or 14 days and sends email reminders via Resend.
//
// Deploy: supabase functions deploy send-deadline-reminders
// Cron: select cron.schedule('deadline-reminders', '0 */6 * * *', 'send-deadline-reminders')

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async () => {
  try {
    const now = new Date();
    const windows = [3, 7, 14]; // days before deadline

    let sent = 0;

    for (const days of windows) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Find scholarships with deadlines in exactly `days` days
      const { data: scholarships } = await supabase
        .from("scholarships")
        .select("*")
        .eq("deadline", dateStr);

      if (!scholarships?.length) continue;

      for (const scholarship of scholarships) {
        // Find users who liked this scholarship
        const { data: swipes } = await supabase
          .from("swipes")
          .select("user_id")
          .eq("scholarship_id", scholarship.id)
          .eq("liked", true);

        if (!swipes?.length) continue;

        for (const swipe of swipes) {
          // Get user email
          const { data: user } = await supabase
            .from("users")
            .select("email, full_name")
            .eq("id", swipe.user_id)
            .single();

          if (!user?.email) continue;

          // Send reminder email
          await resend.emails.send({
            from: "Blackspace <notifications@blackspace.app>",
            to: user.email,
            subject: `⏰ ${days} days left: ${scholarship.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h1 style="color: #7c3aed;">Blackspace</h1>
                <p>Hi ${user.full_name?.split(" ")[0] || "there"},</p>
                <p>The deadline for <strong>${scholarship.title}</strong> is in <strong>${days} days</strong> — ${dateStr}.</p>
                <p>Provider: ${scholarship.provider}<br/>Country: ${scholarship.country}</p>
                <a href="${scholarship.application_link}"
                   style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Apply Now
                </a>
                <p style="color: #888; font-size: 12px; margin-top: 24px;">
                  You received this because you saved this scholarship on Blackspace.
                </p>
              </div>
            `,
          });

          sent++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

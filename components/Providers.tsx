"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Providers: session", !!session);
        
        if (!session) {
          if (pathname !== "/" && pathname !== "/login") router.push("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        console.log("Providers: profile", !!profile, profileError?.message || "");
        
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }
        
        if (profile) {
          useAppStore.getState().setUser(profile);
          if (pathname === "/login" || pathname === "/") router.push("/swipe");
        } else if (pathname !== "/onboarding" && pathname !== "/" && pathname !== "/login") {
          router.push("/onboarding");
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

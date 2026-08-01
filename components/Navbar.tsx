"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Bookmark, User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";

const navItems = [
  { href: "/swipe", label: "For You", icon: Heart },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    useAppStore.getState().reset();
    router.push("/login");
  };

  // Hide navbar on landing, login, and onboarding pages
  if (pathname === "/login" || pathname === "/onboarding" || pathname === "/") {
    return null;
  }

  // Only show sign out on profile page
  const showSignOut = pathname === "/profile";

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: "rgba(5,5,6,.85)",
          backdropFilter: "blur(14px)",
          borderColor: "var(--line)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200"
                style={{
                  color: isActive ? "var(--lime)" : "var(--faint)",
                }}
              >
                <item.icon
                  className="w-5 h-5 transition-all"
                  style={{
                    fill: isActive ? "var(--lime)" : "transparent",
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
                <span className="text-[10px] uppercase tracking-[0.06em] font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}

          {showSignOut && user && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200"
              style={{ color: "var(--faint)" }}
            >
              <LogOut className="w-5 h-5" style={{ opacity: 0.5 }} />
              <span className="text-[10px] uppercase tracking-[0.06em] font-medium">
                Sign Out
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Logout confirmation */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="p-6 max-w-sm w-full rounded-[22px]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--line-strong)",
              boxShadow: "0 20px 60px rgba(0,0,0,.6)",
            }}
          >
            <h3
              className="text-lg font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text)" }}
            >
              Sign Out?
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Your saved matches will be preserved. You can sign back in anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line-strong)",
                  color: "var(--muted)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  background: "rgba(255,46,159,.15)",
                  border: "1px solid rgba(255,46,159,.25)",
                  color: "var(--magenta)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

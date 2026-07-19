"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, Bookmark, User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useAppStore } from "@/lib/store";
import clsx from "clsx";

const navItems = [
  { href: "/swipe", label: "Discover", icon: Heart },
  { href: "/saved", label: "Saved", icon: Bookmark },
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

  if (pathname === "/login" || pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto border-t md:border-t-0 md:border-b border-zinc-800 bg-black/80 backdrop-blur-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 md:h-14 px-4">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={clsx(
                  "flex flex-col md:flex-row items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-accent-light"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <item.icon
                  className={clsx(
                    "w-5 h-5 transition-all",
                    isActive && "fill-accent-light"
                  )}
                />
                <span className="text-xs md:text-sm font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}

          {user && (
            <>
              <button
                onClick={() => router.push("/profile")}
                className="flex flex-col md:flex-row items-center gap-1 px-4 py-2 rounded-lg text-zinc-500 hover:text-zinc-300 transition-all duration-200"
              >
                <UserIcon className="w-5 h-5" />
                <span className="text-xs md:text-sm font-medium">Profile</span>
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="flex flex-col md:flex-row items-center gap-1 px-4 py-2 rounded-lg text-zinc-500 hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs md:text-sm font-medium">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Logout confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Sign Out?</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Your saved matches will be preserved. You can sign back in anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors"
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

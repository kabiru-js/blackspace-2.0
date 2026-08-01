"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/analytics";
import Link from "next/link";

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase: any = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setError("Account created. Check your email to confirm.");
        track("signup", { email });
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        track("signin", { email });
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: "1px solid var(--line-strong)",
    borderRadius: "100px",
    padding: "12px 18px",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    transition: "border-color .2s ease, box-shadow .2s ease",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--black)" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-[360px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-[9px] text-[24px] tracking-[0.02em]" style={{ fontFamily: "'Bebas Neue', sans-serif", color: "var(--text)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--lime)", boxShadow: "0 0 16px var(--lime)", animation: "pulse 2s ease-in-out infinite" }} />
            BLACKSPACE
          </Link>
        </div>

        <h1 className="text-[24px] font-bold leading-[1.19] mb-2" style={{ ...display, color: "var(--text)" }}>
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="text-[14px] mb-8 leading-[1.25]" style={{ color: "var(--muted)" }}>
          {isSignUp ? "Start discovering opportunities." : "Access your opportunities and continue where you left off."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1.5 uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={inputStyle}
              className="focus:border-[var(--lime)] focus:shadow-[0_0_0_4px_rgba(214,255,63,.12)]"
            />
          </div>
          <div>
            <label className="block text-[12px] mb-1.5 uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required minLength={6}
              style={inputStyle}
              className="focus:border-[var(--lime)] focus:shadow-[0_0_0_4px_rgba(214,255,63,.12)]"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[13px] rounded-full px-4 py-2.5"
                style={{
                  color: "var(--lime)",
                  background: "rgba(214,255,63,.06)",
                  border: "1px solid rgba(214,255,63,.15)",
                  ...mono,
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit" disabled={loading}
            className="btn btn-primary w-full justify-center"
            style={{ padding: "14px 0", fontSize: "14px" }}
          >
            {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-[13px] text-center mt-6" style={{ ...mono, color: "var(--faint)" }}>
          {isSignUp ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            style={{ color: "var(--lime)" }}
            className="hover:underline underline-offset-2 transition-all"
          >
            {isSignUp ? "Sign in" : "Create one"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

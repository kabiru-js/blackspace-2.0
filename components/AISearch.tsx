"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, XCircle, Clock, RotateCcw } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS, TYPE_LABELS } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Fully funded film fellowships in Europe",
  "Remote UI/UX internships for beginners",
  "Football trials in Europe under 21",
  "Grants for African startups in fintech",
  "Software engineering jobs with visa sponsorship",
];

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("bs_search_history") || "[]"); } catch { return []; }
}
function setHistory(searches: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("bs_search_history", JSON.stringify(searches.slice(0, 8)));
}

export function AISearch({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => { setRecentSearches(getHistory()); }, []);

  const addToHistory = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    setHistory(updated);
  };

  const handleSearch = (prompt?: string) => {
    const q = prompt || query;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setQuery(q);
    addToHistory(q);

    fetch("/api/ai-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, userId }),
    })
      .then((r) => r.json())
      .then((data) => setParsed(data.parsed))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="pt-4 pb-20 space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='Try "remote design internships" or "football trials"...'
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-12 top-3.5 text-zinc-500 hover:text-zinc-300">
            <XCircle className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="absolute right-3 top-2.5 px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
        </button>
      </div>

      {parsed && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
          {parsed.category && (
            <span className={"px-2.5 py-1 rounded-full text-xs font-medium border " + ((CATEGORY_COLORS as any)[parsed.category] || "")}>
              {CATEGORY_LABELS[parsed.category as keyof typeof CATEGORY_LABELS]}
            </span>
          )}
          {parsed.type && (
            <span className="px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
              {TYPE_LABELS[parsed.type as keyof typeof TYPE_LABELS] || parsed.type}
            </span>
          )}
          {parsed.is_remote && <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">Remote</span>}
          {parsed.funding_type && (
            <span className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 capitalize">
              {parsed.funding_type === "full" ? "Fully Funded" : parsed.funding_type}
            </span>
          )}
          {parsed.keywords?.map((kw: string) => (
            <span key={kw} className="px-2.5 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-500">{kw}</span>
          ))}
        </motion.div>
      )}

      {!loading && recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-zinc-600"><Clock className="w-3.5 h-3.5" />Recent searches</div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-600 font-medium">Try these searches:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button key={prompt} onClick={() => handleSearch(prompt)} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-white hover:border-zinc-600 transition-all text-left">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>
      )}

      {parsed && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-600">Refine:</span>
          {!parsed.is_remote && (
            <button onClick={() => handleSearch(query + " remote")} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">+Remote</button>
          )}
          {parsed.funding_type !== "full" && (
            <button onClick={() => handleSearch(query + " fully funded")} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">+Funded</button>
          )}
          <button onClick={() => handleSearch(query + " beginner")} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">+Beginner</button>
          <button onClick={() => handleSearch(query + " Europe")} className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] text-zinc-400 hover:text-white hover:border-zinc-600 transition-all">+Europe</button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Sparkles, XCircle, Clock, RotateCcw, MapPin, ExternalLink } from "lucide-react";
import { getCategoryLabel, getTypeLabel } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Fully funded film fellowships in Europe",
  "Remote UI/UX internships for beginners",
  "Football trials in Europe under 21",
  "Grants for African startups in fintech",
  "Software engineering jobs with visa sponsorship",
  "Culinary school scholarships",
];

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("bs_search_history") || "[]"); } catch { return []; }
}
function setHistory(searches: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("bs_search_history", JSON.stringify(searches.slice(0, 8)));
}

interface SearchResult {
  id: string;
  title: string;
  provider: string;
  country: string;
  category: string;
  type: string;
  description?: string;
  deadline?: string;
  application_link?: string;
  is_remote?: boolean;
  funding_type?: string;
  tags?: string[];
  match_score: number;
}

const inputStyle = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--line-strong)",
  borderRadius: "100px",
  padding: "14px 48px 14px 48px",
  color: "var(--text)",
  fontSize: "14px",
  fontFamily: "'JetBrains Mono', monospace",
  outline: "none",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

export function AISearch({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<any>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [searchedKeywords, setSearchedKeywords] = useState<string[]>([]);
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
    setLoading(true); setError(null); setQuery(q); setSearched(true);
    addToHistory(q);
    fetch("/api/ai-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: q, userId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setParsed(data.parsed);
        setResults(data.results || []);
        setFallbackUsed(!!data.fallbackUsed);
        setSearchedKeywords(data.searchedKeywords || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const daysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const d = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    if (d < 0) return null;
    return d === 0 ? "Today" : `${d}d left`;
  };

  return (
    <div className="pt-4 pb-20 space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5" style={{ color: "var(--faint)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='Try "culinary school" or "football trials"...'
          style={inputStyle}
          className="focus:border-[var(--lime)] focus:shadow-[0_0_0_4px_rgba(214,255,63,.12)]"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-12 top-3.5 transition-colors" style={{ color: "var(--faint)" }}>
            <XCircle className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="absolute right-3 top-2.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
          style={{ ...mono, background: "var(--lime)", color: "#050506" }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
        </button>
      </div>

      {/* Parsed intent chips */}
      {parsed && !loading && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
          {parsed.category && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border" style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--lime)" }}>
              {getCategoryLabel(parsed.category)}
            </span>
          )}
          {parsed.type && (
            <span className="px-2.5 py-1 rounded-full border text-xs" style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--faint)", background: "var(--card)" }}>
              {getTypeLabel(parsed.type)}
            </span>
          )}
          {parsed.is_remote && <span className="px-2.5 py-1 rounded-full border text-xs" style={{ ...mono, borderColor: "rgba(42,245,207,.2)", color: "var(--cyan)", background: "rgba(42,245,207,.06)" }}>Remote</span>}
          {parsed.funding_type && (
            <span className="px-2.5 py-1 rounded-full border text-xs capitalize" style={{ ...mono, borderColor: "rgba(26,174,57,.2)", color: "var(--lime)", background: "rgba(26,174,57,.06)" }}>
              {parsed.funding_type === "full" ? "Fully Funded" : parsed.funding_type}
            </span>
          )}
        </motion.div>
      )}

      {/* What the system understood (transparency) */}
      {searched && !loading && searchedKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>Searched:</span>
          {searchedKeywords.slice(0, 8).map((kw) => (
            <span key={kw} className="px-2 py-0.5 rounded-full border text-[10px]" style={{ ...mono, borderColor: "var(--line)", color: "var(--faint)" }}>{kw}</span>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--lime)" }} />
          <p className="text-xs" style={{ ...mono, color: "var(--faint)" }}>Finding opportunities that match &quot;{query}&quot;...</p>
        </div>
      )}

      {/* Fallback notice */}
      {searched && !loading && fallbackUsed && results.length > 0 && (
        <div className="px-4 py-3 rounded-2xl border" style={{ background: "rgba(214,255,63,.04)", borderColor: "rgba(214,255,63,.12)" }}>
          <p className="text-xs" style={{ ...mono, color: "var(--muted)" }}>
            We couldn&apos;t find exact matches, but here are related opportunities.
          </p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {searched && !loading && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
              {results.length} relevant result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((r, i) => {
              const dl = daysLeft(r.deadline);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-4"
                  style={{
                    background: "linear-gradient(160deg, var(--card2), var(--card))",
                    border: "1px solid var(--line-strong)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border"
                      style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--lime)" }}>
                      {getCategoryLabel(r.category)}
                    </span>
                    <div className="flex items-center gap-3">
                      {dl && (
                        <span className="text-[11px] flex items-center gap-1" style={{ ...mono, color: "var(--faint)" }}>
                          <Clock className="w-3 h-3" /> {dl}
                        </span>
                      )}
                      <span className="text-[12px] font-semibold" style={{ ...mono, color: "var(--lime)" }}>
                        {r.match_score}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-[16px] font-bold leading-tight" style={{ ...display, color: "var(--text)" }}>{r.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[12px]" style={{ ...mono, color: "var(--faint)" }}>
                    <span>{r.provider}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {r.country}
                    </span>
                  </div>
                  {r.description && (
                    <p className="text-[12px] mt-2 leading-relaxed line-clamp-2" style={{ color: "var(--muted)" }}>{r.description}</p>
                  )}
                  {r.application_link && (
                    <a href={r.application_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full text-xs font-medium"
                      style={{ ...mono, background: "var(--lime)", color: "#050506" }}>
                      View opportunity <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {searched && !loading && !error && results.length === 0 && (
        <div className="text-center py-10 space-y-2">
          <p className="text-lg font-bold" style={{ ...display, color: "var(--text)" }}>No matches found</p>
          <p className="text-sm" style={{ color: "var(--faint)" }}>
            Try broader terms — or we'll keep looking and surface new opportunities as we find them.
          </p>
        </div>
      )}

      {/* Recent searches */}
      {!loading && !searched && recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.06em]" style={{ ...mono, color: "var(--faint)" }}>
            <Clock className="w-3.5 h-3.5" />Recent searches
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button key={s} onClick={() => handleSearch(s)}
                className="px-3 py-1.5 rounded-full border text-xs transition-all flex items-center gap-1.5"
                style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}>
                <RotateCcw className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested prompts */}
      {!loading && !searched && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.06em] font-medium" style={{ ...mono, color: "var(--faint)" }}>Try these searches:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button key={prompt} onClick={() => handleSearch(prompt)}
                className="px-3 py-2 rounded-full border text-xs transition-all text-left"
                style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--faint)" }}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-full border text-sm" style={{ ...mono, borderColor: "rgba(255,46,159,.15)", background: "rgba(255,46,159,.06)", color: "var(--magenta)" }}>
          {error}
        </div>
      )}
    </div>
  );
}

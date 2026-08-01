"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2, Clock, Sparkles, ExternalLink, CheckCircle2, Globe } from "lucide-react";
import { OpportunityWithMatch, getCategoryLabel, getTypeLabel } from "@/lib/types";

interface DetailViewProps {
  opportunity: OpportunityWithMatch | null;
  onClose: () => void;
  onApply?: () => void;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const display = { fontFamily: "'Space Grotesk', sans-serif" };

export function DetailView({ opportunity, onClose, onApply }: DetailViewProps) {
  if (!opportunity) return null;

  const daysLeft = Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / 86400000);
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: "rgba(5,5,6,.9)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[85vh] rounded-t-[20px] sm:rounded-[20px] overflow-y-auto"
          style={{ background: "linear-gradient(160deg, var(--card2), var(--card))", border: "1px solid var(--line-strong)" }}
        >
          {/* Close button */}
          <button onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "var(--card)", border: "1px solid var(--line-strong)", color: "var(--text)" }}>
            <X className="w-4 h-4" />
          </button>

          {/* Hero area */}
          <div className="relative h-40 overflow-hidden" style={{ borderBottom: "1px solid var(--line)" }}>
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--card2), transparent)" }} />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "var(--line-strong)", color: "var(--lime)" }}>
                {getCategoryLabel(opportunity.category)}
              </span>
              {opportunity.funding_type === "full" && (
                <span className="px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "rgba(26,174,57,.3)", background: "rgba(26,174,57,.08)", color: "var(--lime)" }}>Fully Funded</span>
              )}
              {opportunity.is_remote && (
                <span className="px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "rgba(42,245,207,.2)", background: "rgba(42,245,207,.06)", color: "var(--cyan)" }}>Remote</span>
              )}
              {isUrgent && (
                <span className="px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-[0.06em]" style={{ ...mono, borderColor: "rgba(255,46,159,.25)", background: "rgba(255,46,159,.08)", color: "var(--magenta)" }}>
                  {daysLeft === 0 ? "Today" : `${daysLeft} Days`}
                </span>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold leading-tight" style={{ ...display, color: "var(--text)" }}>{opportunity.title}</h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--muted)" }}>{opportunity.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <MetaItem icon={<Building2 className="w-3.5 h-3.5" />} label="Provider" value={opportunity.provider} />
              <MetaItem icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={opportunity.location || opportunity.country} />
              <MetaItem icon={<Clock className="w-3.5 h-3.5" />} label="Deadline" value={daysLeft > 0 ? `${daysLeft}d left` : "Ended"} urgent={isUrgent} />
              <MetaItem icon={<Globe className="w-3.5 h-3.5" />} label="Type" value={getTypeLabel(opportunity.type)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", color: "var(--faint)" }}>
                {getTypeLabel(opportunity.type)}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", color: "var(--faint)" }}>{opportunity.field}</span>
              {opportunity.tags?.slice(0, 3).map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", color: "var(--faint)" }}>#{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: "rgba(214,255,63,.06)", border: "1px solid rgba(214,255,63,.12)" }}>
              <Sparkles className="w-5 h-5" style={{ color: "var(--lime)" }} />
              <div>
                <span className="text-lg font-bold" style={{ ...display, color: "var(--lime)" }}>{opportunity.match_score}%</span>
                <span className="text-sm ml-2" style={{ color: "var(--faint)" }}>match score</span>
              </div>
            </div>

            {opportunity.requirements && (
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ ...display, color: "var(--text)" }}>Requirements</h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{opportunity.requirements}</p>
              </div>
            )}

            {opportunity.eligibility && (
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ ...display, color: "var(--text)" }}>Eligibility</h4>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{opportunity.eligibility}</p>
              </div>
            )}

            {opportunity.skills && opportunity.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ ...display, color: "var(--text)" }}>Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skills.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 rounded-full text-xs uppercase tracking-[0.04em]" style={{ ...mono, background: "var(--card)", border: "1px solid var(--line)", color: "var(--faint)" }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              {opportunity.application_link ? (
                <span className="flex items-center gap-1.5" style={{ color: "var(--lime)", ...mono, fontSize: "12px" }}>
                  <CheckCircle2 className="w-4 h-4" /> Official link available
                </span>
              ) : (
                <span className="flex items-center gap-1.5" style={{ color: "var(--orange)", ...mono, fontSize: "12px" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--orange)" }} /> Aggregated listing
                </span>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <a href={opportunity.application_link || "#"} target="_blank" rel="noopener noreferrer"
                className="flex-1 btn btn-primary justify-center" style={{ padding: "12px 0" }}>
                <ExternalLink className="w-4 h-4" /> Apply Now
              </a>
              {onApply && (
                <button onClick={onApply}
                  className="flex-1 py-3 rounded-full border font-semibold flex items-center justify-center gap-2 transition-colors"
                  style={{ ...mono, background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--muted)" }}>
                  <Sparkles className="w-4 h-4" /> Apply with AI
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaItem({ icon, label, value, urgent }: { icon: React.ReactNode; label: string; value: string; urgent?: boolean }) {
  return (
    <div className="p-3 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--line)" }}>
      <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "var(--faint)", fontFamily: "'JetBrains Mono', monospace" }}>
        {icon} {label}
      </div>
      <p className="text-sm font-medium" style={{ color: urgent ? "var(--magenta)" : "var(--text)", fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
    </div>
  );
}

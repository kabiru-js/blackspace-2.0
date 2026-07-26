"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { OpportunityWithMatch, CATEGORY_LABELS, CATEGORY_COLORS, TYPE_LABELS } from "@/lib/types";

interface DetailViewProps {
  opportunity: OpportunityWithMatch | null;
  onClose: () => void;
  onApply?: () => void;
}

export function DetailView({ opportunity, onClose, onApply }: DetailViewProps) {
  if (!opportunity) return null;

  const daysLeft = Math.ceil(
    (new Date(opportunity.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-lg max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Hero area */}
          <div className="relative h-48 bg-gradient-to-br from-accent/30 via-accent-dark/20 to-black overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${(CATEGORY_COLORS as any)[opportunity.category] || ""}`}>
                {CATEGORY_LABELS[opportunity.category]}
              </span>
              {opportunity.funding_type === "full" && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-semibold text-green-400">
                  FULLY FUNDED
                </span>
              )}
              {opportunity.is_remote && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-semibold text-blue-400">
                  REMOTE
                </span>
              )}
              {isUrgent && (
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs font-semibold text-red-400">
                  {daysLeft === 0 ? "TODAY" : `${daysLeft} DAYS`}
                </span>
              )}
            </div>

            {/* Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
                {opportunity.title}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-5">
            {/* Key hook */}
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              {opportunity.description}
            </p>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              <MetaItem icon={<Building2 className="w-4 h-4" />} label="Provider" value={opportunity.provider} />
              <MetaItem icon={<MapPin className="w-4 h-4" />} label="Location" value={opportunity.location || opportunity.country} />
              <MetaItem icon={<Clock className="w-4 h-4" />} label="Deadline" value={daysLeft > 0 ? `${daysLeft} days left` : "Passed"} urgent={isUrgent} />
              <MetaItem icon={<Globe className="w-4 h-4" />} label="Type" value={TYPE_LABELS[opportunity.type as keyof typeof TYPE_LABELS] || opportunity.type} />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300">
                {TYPE_LABELS[opportunity.type as keyof typeof TYPE_LABELS] || opportunity.type}
              </span>
              <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300">{opportunity.field}</span>
              {opportunity.tags?.slice(0, 3).map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400">#{tag}</span>
              ))}
            </div>

            {/* Match score */}
            <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-accent-light" />
              <div>
                <span className="text-lg font-bold text-accent-light">{opportunity.match_score}%</span>
                <span className="text-sm text-zinc-400 ml-2">match score</span>
              </div>
            </div>

            {/* Requirements */}
            {opportunity.requirements && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Requirements</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{opportunity.requirements}</p>
              </div>
            )}

            {/* Eligibility */}
            {opportunity.eligibility && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Eligibility</h4>
                <p className="text-sm text-zinc-400 leading-relaxed">{opportunity.eligibility}</p>
              </div>
            )}

            {/* Skills */}
            {opportunity.skills && opportunity.skills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.skills.map((skill: string) => (
                    <span key={skill} className="px-2.5 py-1 bg-zinc-800 rounded-full text-xs text-zinc-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust indicator */}
            <div className="flex items-center gap-2 text-sm">
              {opportunity.application_link ? (
                <span className="flex items-center gap-1.5 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  Official link available
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Aggregated listing
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <a
                href={opportunity.application_link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-dark transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Apply Now
              </a>
              {onApply && (
                <button
                  onClick={onApply}
                  className="flex-1 py-3 bg-zinc-800 border border-zinc-700 rounded-xl font-semibold text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Apply with AI
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MetaItem({
  icon,
  label,
  value,
  urgent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  urgent?: boolean;
}) {
  return (
    <div className="p-3 bg-zinc-800/50 rounded-xl">
      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-medium ${urgent ? "text-red-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

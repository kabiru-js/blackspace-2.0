"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { OpportunityWithMatch, getCategoryLabel, getTypeLabel } from "@/lib/types";
import { DetailView } from "./DetailView";
import { MapPin, Clock, ChevronRight } from "lucide-react";

interface SwipeCardProps {
  opportunity: OpportunityWithMatch;
  onSwipe: (direction: "left" | "right") => void;
  stackIndex?: number;
  isTop: boolean;
  onApplyAI?: () => void;
}

export function SwipeCard({ opportunity, onSwipe, stackIndex = 0, isTop, onApplyAI }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0.4, 1, 1, 1, 0.4]);

  const scale = isTop ? 1 : 0.96 - stackIndex * 0.02;
  const zIndex = isTop ? 10 : 5 - stackIndex;
  const offset = isTop ? 0 : (stackIndex + 1) * 6;
  const sideOffset = isTop ? 0 : (stackIndex + 1) * 4;

  const handleDragEnd = (_: any, info: any) => {
    const dist = Math.abs(info.offset.x);
    if (dist < 10 && Math.abs(info.offset.y) < 10) {
      if (isTop) setShowDetail(true);
      return;
    }
    if (info.offset.x > 100) { setExitX(500); onSwipe("right"); }
    else if (info.offset.x < -100) { setExitX(-500); onSwipe("left"); }
  };

  const daysLeft = Math.ceil((new Date(opportunity.deadline).getTime() - Date.now()) / 86400000);
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;

  const cardStyle = {
    background: "linear-gradient(160deg, var(--card2), var(--card))",
    border: "1px solid var(--line-strong)",
    borderRadius: "22px",
    boxShadow: "0 30px 70px rgba(0,0,0,.6)",
  };

  const categoryColors: Record<string, string> = {
    academic: "var(--lime)",
    career: "var(--cyan)",
    creative: "var(--violet)",
    athletic: "var(--magenta)",
  };
  const accentColor = categoryColors[opportunity.category] || "var(--lime)";

  return (
    <>
      <motion.div
        className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing select-none"
        style={{
          x, rotate, opacity, scale, zIndex, top: offset, left: sideOffset, right: sideOffset,
          position: "absolute",
        }}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale, opacity: 1 }}
        exit={{ x: exitX, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        whileTap={{ cursor: "grabbing" }}
      >
        {/* Card glow pseudo-border via gradient pseudo */}
        <div
          className="absolute inset-0 rounded-[22px] pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, transparent 40%, transparent 60%, ${accentColor})`,
            opacity: 0.3,
            margin: "-1px",
            zIndex: -1,
          }}
        />

        {/* Like / Save overlays */}
        <motion.div className="absolute top-6 right-6 z-20" style={{ opacity: useTransform(x, [0, 80], [0, 1]) }}>
          <span className="text-[20px] font-semibold text-[var(--lime)] tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Save</span>
        </motion.div>
        <motion.div className="absolute top-6 left-6 z-20" style={{ opacity: useTransform(x, [-80, 0], [1, 0]) }}>
          <span className="text-[20px] font-semibold text-[var(--faint)] tracking-[-0.02em]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Not for me</span>
        </motion.div>

        {/* Card */}
        <div className="rounded-[22px] overflow-hidden" style={cardStyle}>
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span
                className="inline-flex items-center gap-[6px] text-[10.5px] uppercase tracking-[0.09em] px-3 py-1.5 rounded-full border"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  borderColor: "var(--line-strong)",
                  color: accentColor,
                }}
              >
                <span className="w-[6px] h-[6px] rounded-full" style={{ background: accentColor }} />
                {getCategoryLabel(opportunity.category)}
              </span>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: "var(--faint)", fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{opportunity.country}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span style={isUrgent ? { color: "var(--magenta)" } : {}}>
                    {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? "Today" : "Ended"}
                  </span>
                </span>
              </div>
            </div>

            <h2 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.22px] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--text)" }}>
              {opportunity.title}
            </h2>
            <p className="text-[14px] leading-[1.25]" style={{ color: "var(--muted)" }}>
              {opportunity.provider}
            </p>
            {/* Why this card */}
            {opportunity.match_score >= 60 && (
              <p className="text-[11px] mt-2 leading-tight" style={{ color: "var(--lime)", opacity: 0.7, fontFamily: "'JetBrains Mono', monospace" }}>
                Because {(opportunity.tags || []).slice(0, 2).join(" · ") || "it matches your interests"}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="px-6 pb-4">
            <p className="text-[13px] leading-[1.4] line-clamp-2" style={{ color: "var(--faint)" }}>
              {opportunity.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="flex items-center gap-2">
              <span className="text-[12px]" style={{ color: "var(--faint)", fontFamily: "'JetBrains Mono', monospace" }}>
                {getTypeLabel(opportunity.type)}
              </span>
              {opportunity.is_remote && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border" style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: "var(--line)", color: "var(--muted)" }}>Remote</span>
              )}
              {opportunity.funding_type === "full" && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border" style={{ fontFamily: "'JetBrains Mono', monospace", borderColor: "var(--lime)", color: "var(--lime)" }}>Funded</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium" style={{ color: "var(--lime)", fontFamily: "'JetBrains Mono', monospace" }}>
                {opportunity.match_score}% match
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDetail(true); }}
                className="transition-colors"
                style={{ color: "var(--faint)" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <DetailView
        opportunity={showDetail ? opportunity : null}
        onClose={() => setShowDetail(false)}
        onApply={onApplyAI}
      />
    </>
  );
}

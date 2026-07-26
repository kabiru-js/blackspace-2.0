"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { OpportunityWithMatch, CATEGORY_LABELS, CATEGORY_COLORS, TYPE_LABELS } from "@/lib/types";
import { MapPin, Building2, Clock, Sparkles, Briefcase, Palette, Dumbbell, GraduationCap } from "lucide-react";
import { DetailView } from "./DetailView";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academic: <GraduationCap className="w-3.5 h-3.5" />,
  career: <Briefcase className="w-3.5 h-3.5" />,
  creative: <Palette className="w-3.5 h-3.5" />,
  athletic: <Dumbbell className="w-3.5 h-3.5" />,
};

interface SwipeCardProps {
  opportunity: OpportunityWithMatch;
  onSwipe: (direction: "left" | "right") => void;
  stackIndex?: number;
  isTop: boolean;
  onApplyAI?: () => void;
}

export function SwipeCard({
  opportunity,
  onSwipe,
  stackIndex = 0,
  isTop,
  onApplyAI,
}: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [tapped, setTapped] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.5, 1, 1, 1, 0.5]
  );

  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const scale = isTop ? 1 : 0.95 - stackIndex * 0.02;
  const zIndex = isTop ? 10 : 5 - stackIndex;
  const offset = isTop ? 0 : (stackIndex + 1) * 6;
  const sideOffset = isTop ? 0 : (stackIndex + 1) * 4;

  const handleDragEnd = (_: any, info: any) => {
    const dist = Math.abs(info.offset.x);

    // Tap detection: if minimal movement, treat as tap
    if (dist < 10 && Math.abs(info.offset.y) < 10) {
      if (isTop) setShowDetail(true);
      return;
    }

    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipe("left");
    }
  };

  const daysLeft = Math.ceil(
    (new Date(opportunity.deadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const isDeadlineSoon = daysLeft > 0 && daysLeft <= 14;
  const isUrgent = daysLeft > 0 && daysLeft <= 3;

  return (
    <>
    <motion.div
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        scale,
        zIndex,
        top: offset,
        left: sideOffset,
        right: sideOffset,
        position: "absolute",
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      whileTap={{ cursor: "grabbing" }}
    >
      {/* Like / Nope overlays */}
      <motion.div
        className="absolute top-8 right-8 z-20"
        style={{ opacity: likeOpacity }}
      >
        <div className="px-4 py-2 border-2 border-green-500 rounded-lg -rotate-12">
          <span className="text-2xl font-black text-green-500 tracking-wider">
            LIKE
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-8 left-8 z-20"
        style={{ opacity: nopeOpacity }}
      >
        <div className="px-4 py-2 border-2 border-red-500 rounded-lg rotate-12">
          <span className="text-2xl font-black text-red-500 tracking-wider">
            NOPE
          </span>
        </div>
      </motion.div>

      {/* Card */}
      <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 card-shadow">
        {/* Gradient header */}
        <div className="h-48 bg-gradient-to-br from-accent/30 via-accent-dark/20 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className="flex flex-wrap gap-2">
              {/* Category badge */}
              <span className={`px-3 py-1 border rounded-full text-xs font-semibold backdrop-blur-sm ${(CATEGORY_COLORS as any)[opportunity.category] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}`}>
                {CATEGORY_ICONS[opportunity.category]}
                <span className="ml-1">{CATEGORY_LABELS[opportunity.category]}</span>
              </span>

              {opportunity.funding_type === "full" && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-semibold text-green-400 backdrop-blur-sm">
                  FULLY FUNDED
                </span>
              )}
              {opportunity.is_remote && (
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-semibold text-blue-400 backdrop-blur-sm">
                  REMOTE
                </span>
              )}
              {isUrgent && (
                <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full text-xs font-semibold text-red-400 backdrop-blur-sm">
                  URGENT
                </span>
              )}
              {isDeadlineSoon && !isUrgent && (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs font-semibold text-amber-400 backdrop-blur-sm">
                  CLOSING SOON
                </span>
              )}
              {opportunity.match_score >= 70 && (
                <span className="px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-xs font-semibold text-accent-light backdrop-blur-sm">
                  🔥 HIGH MATCH
                </span>
              )}
            </div>
          </div>

          {/* Match score */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-zinc-700/50">
              <Sparkles className="w-3.5 h-3.5 text-accent-light" />
              <span className="text-sm font-bold text-white">
                {opportunity.match_score}%
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-16">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-lg">
              {opportunity.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>{opportunity.provider}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span>{opportunity.country}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span
                className={
                  isUrgent
                    ? "text-red-400 font-medium"
                    : isDeadlineSoon
                    ? "text-amber-400 font-medium"
                    : ""
                }
              >
                {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? "Today!" : "Deadline passed"}
              </span>
            </div>
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 text-[10px]">
            {opportunity.application_link ? (
              <span className="flex items-center gap-1 text-green-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Official link available
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Aggregated listing
              </span>
            )}
            {opportunity.tags.includes("verified") && (
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                Verified
              </span>
            )}
          </div>

          {/* Level & Field tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300 capitalize border border-zinc-700/50">
              {TYPE_LABELS[opportunity.type as keyof typeof TYPE_LABELS] || opportunity.type}
            </span>
            <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300 border border-zinc-700/50">
              {opportunity.field}
            </span>
            {opportunity.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700/50"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
            {opportunity.description}
          </p>
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

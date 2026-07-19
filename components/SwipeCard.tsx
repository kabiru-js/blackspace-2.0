"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ScholarshipWithMatch } from "@/lib/types";
import { MapPin, Building2, Clock, Sparkles } from "lucide-react";

interface SwipeCardProps {
  scholarship: ScholarshipWithMatch;
  onSwipe: (direction: "left" | "right") => void;
  stackIndex?: number;
  isTop: boolean;
}

export function SwipeCard({
  scholarship,
  onSwipe,
  stackIndex = 0,
  isTop,
}: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
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
    (new Date(scholarship.deadline).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  const isDeadlineSoon = daysLeft > 0 && daysLeft <= 14;
  const isUrgent = daysLeft > 0 && daysLeft <= 3;

  return (
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
              {scholarship.funding_type === "full" && (
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-semibold text-green-400 backdrop-blur-sm">
                  FULLY FUNDED
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
              {scholarship.match_score >= 70 && (
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
                {scholarship.match_score}%
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-16">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow-lg">
              {scholarship.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span>{scholarship.provider}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span>{scholarship.country}</span>
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
                {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
              </span>
            </div>
          </div>

          {/* Level & Field tags */}
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300 capitalize border border-zinc-700/50">
              {scholarship.level}
            </span>
            <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs text-zinc-300 border border-zinc-700/50">
              {scholarship.field}
            </span>
            {scholarship.tags.slice(0, 2).map((tag) => (
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
            {scholarship.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

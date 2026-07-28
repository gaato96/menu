"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Fades and lifts a block into place the first time it enters the viewport. */
export function Rise({
  children,
  className,
  delay = 0,
  distance = 28,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Reveals a headline word by word. Kept to headlines only — running this on
 * body copy makes text unreadable while it animates, which is the failure
 * mode of most "kinetic typography" landing pages.
 */
export function WordReveal({
  text,
  className,
  highlight,
  delay = 0,
}: {
  text: string;
  className?: string;
  /** Words rendered in the accent colour instead of the base one. */
  highlight?: string[];
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  const highlighted = new Set(highlight ?? []);

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className={cn("inline-block", highlighted.has(word) && "text-ember")}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.4em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + index * 0.07,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
          {index < words.length - 1 && " "}
        </motion.span>
      ))}
    </span>
  );
}

/**
 * Drifts its children against the scroll direction. `strength` is in pixels
 * of total travel across the element's full pass through the viewport.
 */
export function Parallax({
  children,
  className,
  strength = 60,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/** Counts a number up once it scrolls into view. */
export function CountUp({
  to,
  suffix = "",
  className,
  durationSeconds = 1.4,
}: {
  to: number;
  suffix?: string;
  className?: string;
  durationSeconds?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const value = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(value, to, {
      duration: durationSeconds,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduced, to, value, durationSeconds]);

  // Someone who asked for reduced motion gets the final number outright
  // rather than a one-frame jump from zero.
  const shown = reduced ? to : display;

  return (
    <span ref={ref} className={className}>
      {shown.toLocaleString("es-AR")}
      {suffix}
    </span>
  );
}

/**
 * Scroll-driven crossfade between the "before" and "after" of the pitch.
 * The chat stack recedes and the ticket rises as the section crosses the
 * viewport — the transformation happens under the reader's own scroll
 * instead of being asserted in a caption.
 */
export function ChaosToOrderScene({
  before,
  after,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"],
  });

  const beforeOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0.25]);
  const beforeScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9]);
  const beforeRotate = useTransform(scrollYProgress, [0, 0.6], [-3, -8]);
  const afterOpacity = useTransform(scrollYProgress, [0.25, 0.65], [0, 1]);
  const afterY = useTransform(scrollYProgress, [0.25, 0.7], [56, 0]);
  const afterRotate = useTransform(scrollYProgress, [0.25, 0.7], [6, 2]);

  if (reduced) {
    return (
      <div ref={ref} className="relative mx-auto w-full max-w-sm">
        <div className="-rotate-3">{before}</div>
        <div className="relative z-10 -mt-10 ml-6 rotate-2">{after}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-sm">
      <motion.div style={{ opacity: beforeOpacity, scale: beforeScale, rotate: beforeRotate }}>
        {before}
      </motion.div>
      <motion.div
        style={{ opacity: afterOpacity, y: afterY, rotate: afterRotate }}
        className="relative z-10 -mt-10 ml-6"
      >
        {after}
      </motion.div>
    </div>
  );
}

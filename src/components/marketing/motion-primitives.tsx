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
import Image from "next/image";
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
 * One-time entrance for the "before" and "after" of the pitch: the chat
 * stack settles first, the ticket rises in a beat after and lands at full
 * opacity — and STAYS at full opacity for the rest of the scroll.
 *
 * An earlier version tied both opacities to scroll progress for a
 * continuous crossfade. That put a wide middle band of the page where BOTH
 * cards sat semi-transparent at once — the section's natural reading
 * position landed a reader inside that band, so the whole thing looked
 * permanently washed out instead of like a deliberate transition. A single
 * settle-once reveal (the same pattern every other section on this page
 * uses) reads once and then just stays legible.
 */
export function ChaosToOrderScene({
  before,
  after,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <motion.div
        className="-rotate-3"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, rotate: -8 }}
        whileInView={{ opacity: 1, y: 0, rotate: -3 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {before}
      </motion.div>
      <motion.div
        className="relative z-10 -mt-10 ml-6 rotate-2"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, rotate: 8 }}
        whileInView={{ opacity: 1, y: 0, rotate: 2 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {after}
      </motion.div>
    </div>
  );
}

const FLOAT_SHAPES = [
  "62% 38% 55% 45% / 55% 48% 52% 45%",
  "45% 55% 62% 38% / 48% 55% 45% 52%",
  "55% 45% 48% 52% / 62% 38% 55% 45%",
];

/**
 * A loose cluster of real dish photos, each clipped into an organic blob
 * (not a rectangle or a perfect circle — a real photograph read as an
 * object rather than a screenshot) and bobbing on its own independent
 * loop. Fills the empty half of a dark hero with the product's actual
 * content in motion, the same principle as the marquee bands below it.
 */
export function FloatingDishes({
  dishes,
  className,
}: {
  dishes: { id: string; imageUrl: string; alt: string }[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (dishes.length === 0) return null;

  const layouts = [
    { size: 220, top: "4%", left: "18%", z: 10 },
    { size: 168, top: "46%", left: "58%", z: 20 },
    { size: 152, top: "60%", left: "4%", z: 5 },
  ];

  return (
    <div className={cn("pointer-events-none relative", className)} aria-hidden>
      {dishes.slice(0, 3).map((dish, index) => {
        const layout = layouts[index];
        return (
          <motion.div
            key={dish.id}
            className="absolute overflow-hidden shadow-2xl"
            style={{
              width: layout.size,
              height: layout.size,
              top: layout.top,
              left: layout.left,
              zIndex: layout.z,
              borderRadius: FLOAT_SHAPES[index % FLOAT_SHAPES.length],
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              reduced
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -16, 0], rotate: [0, index % 2 === 0 ? 4 : -4, 0] }
            }
            transition={
              reduced
                ? { duration: 0.6, delay: index * 0.15 }
                : {
                    opacity: { duration: 0.6, delay: 0.3 + index * 0.15 },
                    scale: { duration: 0.6, delay: 0.3 + index * 0.15 },
                    y: {
                      duration: 5 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.6,
                    },
                    rotate: {
                      duration: 6 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.6,
                    },
                  }
            }
          >
            {/* Real menu photography, not stock — width/height reserved via
                the layout table above so nothing shifts as it loads. */}
            <Image
              src={dish.imageUrl}
              alt={dish.alt}
              width={layout.size}
              height={layout.size}
              sizes={`${layout.size}px`}
              className="size-full object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

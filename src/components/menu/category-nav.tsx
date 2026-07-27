"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontal, sticky category chips that track scroll position.
 *
 * Built on IntersectionObserver rather than manual scroll math: the menu can
 * be any length, and observer thresholds stay correct without recomputing
 * offsets on every render.
 */
export function CategoryNav({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`category-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;

        // The topmost visible section is the one the customer is reading.
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(top.target.id.replace("category-", ""));
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const button = navRef.current?.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  if (categories.length <= 1) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Categorías"
      className="scrollbar-none sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-ink-100 bg-white/95 px-4 py-2.5 backdrop-blur"
    >
      {categories.map((category) => (
        <a
          key={category.id}
          data-id={category.id}
          href={`#category-${category.id}`}
          onClick={(event) => {
            event.preventDefault();
            document
              .getElementById(`category-${category.id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
            activeId === category.id ? "bg-brand text-brand-fg" : "bg-ink-100 text-ink-700",
          )}
        >
          {category.name}
        </a>
      ))}
    </nav>
  );
}

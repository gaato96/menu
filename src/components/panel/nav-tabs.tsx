"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/panel", label: "Comandas" },
  { href: "/panel/pedidos", label: "Pedidos" },
] as const;

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 px-4">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "min-h-touch border-b-2 px-3 text-sm font-medium",
              active
                ? "border-brand text-brand"
                : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

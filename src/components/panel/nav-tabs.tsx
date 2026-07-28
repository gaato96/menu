"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { StaffRole } from "@/lib/orders/status";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/panel", label: "Comandas", roles: ["owner", "manager", "cashier"] },
  { href: "/panel/pedidos", label: "Pedidos", roles: ["owner", "manager", "cashier"] },
  { href: "/panel/menu", label: "Menú", roles: ["owner", "manager"] },
  { href: "/panel/config", label: "Configuración", roles: ["owner", "manager"] },
  { href: "/panel/usuarios", label: "Usuarios", roles: ["owner"] },
] as const;

export function NavTabs({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const tabs = TABS.filter((tab) => (tab.roles as readonly string[]).includes(role));

  return (
    <nav className="flex gap-1 overflow-x-auto px-4">
      {tabs.map((tab) => {
        // /panel matches both the board and every /panel/* sub-route by
        // prefix, so it needs an exact match while the rest use startsWith.
        const active = tab.href === "/panel" ? pathname === "/panel" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex min-h-touch shrink-0 items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap",
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

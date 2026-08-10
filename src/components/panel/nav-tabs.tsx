"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { StaffRole } from "@/lib/orders/status";
import { cn } from "@/lib/utils";
import type { ModuleKey } from "@/types/database";

interface Tab {
  href: string;
  label: string;
  roles: readonly StaffRole[];
  /** Present only for tabs a premium module gates. Absent = always on. */
  module?: ModuleKey;
}

// Split by frequency of use: the row is what a cashier taps all shift long,
// "Más" is what an owner opens a few times a day. Nine tabs in one row never
// fit a tablet at counter width, so this is not optional past four modules.
const PRIMARY_TABS: readonly Tab[] = [
  { href: "/panel", label: "Comandas", roles: ["owner", "manager", "cashier"] },
  { href: "/cocina", label: "Cocina", roles: ["owner", "manager", "cashier"], module: "kitchen_display" },
  { href: "/panel/salon", label: "Salón", roles: ["owner", "manager", "cashier"], module: "tables" },
  { href: "/panel/pedidos", label: "Pedidos", roles: ["owner", "manager", "cashier"] },
  { href: "/panel/caja", label: "Caja", roles: ["owner", "manager", "cashier"], module: "cash_register" },
];

const MORE_TABS: readonly Tab[] = [
  { href: "/panel/menu", label: "Menú", roles: ["owner", "manager"] },
  { href: "/panel/stock", label: "Stock", roles: ["owner", "manager"], module: "inventory" },
  { href: "/panel/clientes", label: "Clientes", roles: ["owner", "manager"], module: "crm_loyalty" },
  { href: "/panel/config", label: "Configuración", roles: ["owner", "manager"] },
  { href: "/panel/usuarios", label: "Usuarios", roles: ["owner"] },
];

function matches(tab: Tab, role: StaffRole, modules: ReadonlySet<ModuleKey>) {
  if (!tab.roles.includes(role)) return false;
  if (tab.module && !modules.has(tab.module)) return false;
  return true;
}

function isActive(pathname: string, href: string) {
  // /panel matches both the board and every /panel/* sub-route by prefix, so
  // it needs an exact match while the rest use startsWith.
  return href === "/panel" ? pathname === "/panel" : pathname.startsWith(href);
}

export function NavTabs({ role, modules }: { role: StaffRole; modules: ModuleKey[] }) {
  const pathname = usePathname();
  const moduleSet = new Set(modules);

  const primary = PRIMARY_TABS.filter((tab) => matches(tab, role, moduleSet));
  const more = MORE_TABS.filter((tab) => matches(tab, role, moduleSet));
  const moreActive = more.some((tab) => isActive(pathname, tab.href));

  return (
    <nav className="flex items-center gap-1 overflow-x-auto px-4">
      {primary.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex min-h-touch shrink-0 items-center border-b-2 px-3 text-sm font-medium whitespace-nowrap",
            isActive(pathname, tab.href)
              ? "border-brand text-brand"
              : "border-transparent text-ink-500 hover:text-ink-900",
          )}
        >
          {tab.label}
        </Link>
      ))}

      {more.length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className={cn(
              "flex min-h-touch shrink-0 items-center gap-1 border-b-2 px-3 text-sm font-medium whitespace-nowrap outline-none",
              moreActive
                ? "border-brand text-brand"
                : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            Más
            <ChevronDown className="size-3.5" aria-hidden />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={4}
              className="shadow-ticket z-30 min-w-40 rounded-lg border border-ink-200 bg-white p-1"
            >
              {more.map((tab) => (
                <DropdownMenu.Item key={tab.href} asChild>
                  <Link
                    href={tab.href}
                    className={cn(
                      "flex min-h-touch items-center rounded-md px-3 text-sm font-medium outline-none",
                      isActive(pathname, tab.href)
                        ? "bg-brand-soft text-brand"
                        : "text-ink-700 hover:bg-ink-100",
                    )}
                  >
                    {tab.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </nav>
  );
}

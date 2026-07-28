import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requireModule, requireStaff } from "@/lib/auth/context";

import { signOut } from "../../(auth)/login/actions";

export default async function KitchenLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  requireModule(staff, "kitchen_display");

  return (
    <div className="flex min-h-full flex-col bg-night-950 text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="font-display text-lg font-bold tracking-tight">{staff.business.name}</p>
        <form action={signOut}>
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            aria-label="Cerrar sesión"
            className="text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-5" aria-hidden />
          </Button>
        </form>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

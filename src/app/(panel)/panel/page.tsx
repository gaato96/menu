import { Board } from "@/components/board/board";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { requireStaff } from "@/lib/auth/context";
import { fetchBoardOrders } from "@/lib/orders/board-queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Comandas" };

// Realtime + polling own freshness client-side; a cached shell would show a
// stale board on the one screen that must never lag.
export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const initialOrders = await fetchBoardOrders(supabase, staff.business.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-3 pt-3">
        <InstallPrompt
          label="Instalá el tablero en esta tablet"
          storageKey="install-prompt:panel"
        />
      </div>

      <Board
        businessId={staff.business.id}
        currency={staff.business.currency}
        role={staff.role}
        initialOrders={initialOrders}
      />
    </div>
  );
}

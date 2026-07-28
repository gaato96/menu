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
  const [initialOrders, zonesResult, tablesResult] = await Promise.all([
    fetchBoardOrders(supabase, staff.business.id),
    supabase.from("delivery_zones").select("id, name").eq("business_id", staff.business.id),
    supabase.from("restaurant_tables").select("id, label").eq("business_id", staff.business.id),
  ]);

  // Loaded once here instead of joined per-order: a Realtime INSERT only ever
  // carries the flat `orders` row (no relations), so a per-order join would
  // silently lose the zone name on exactly the order that just arrived. Zones
  // are few and change rarely — a name lookup passed down by prop is cheaper
  // and never goes stale mid-shift. Same reasoning for table labels.
  const zoneNames = Object.fromEntries((zonesResult.data ?? []).map((z) => [z.id, z.name]));
  const tableNames = Object.fromEntries((tablesResult.data ?? []).map((t) => [t.id, t.label]));

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
        businessName={staff.business.name}
        currency={staff.business.currency}
        role={staff.role}
        initialOrders={initialOrders}
        zoneNames={zoneNames}
        tableNames={tableNames}
      />
    </div>
  );
}

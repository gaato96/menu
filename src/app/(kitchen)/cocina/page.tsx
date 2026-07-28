import { KitchenBoard } from "@/components/kitchen/kitchen-board";
import { requireStaff } from "@/lib/auth/context";
import { fetchKitchenOrders } from "@/lib/orders/kitchen-queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Cocina" };

// Same reasoning as /panel: realtime + polling own freshness client-side.
export const dynamic = "force-dynamic";

export default async function KitchenPage() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const initialOrders = await fetchKitchenOrders(supabase, staff.business.id);

  return (
    <KitchenBoard
      businessId={staff.business.id}
      role={staff.role}
      initialOrders={initialOrders}
    />
  );
}

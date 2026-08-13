import QRCode from "qrcode";

import { requireModule, requireStaff } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/server";

import { PrintButton } from "./print-button";

export const metadata = { title: "QR de mesas" };
export const dynamic = "force-dynamic";

/**
 * Generated server-side as inline SVG, not fetched from a QR API: an
 * external service would leak every table's URL to a third party, and would
 * simply not render at all without internet on the day it's needed most —
 * printing a stack of table tents before service starts.
 */
export default async function TableQrPage() {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const { data: tables } = await supabase
    .from("restaurant_tables")
    .select("*")
    .eq("business_id", staff.business.id)
    .eq("is_active", true)
    .order("sort_order");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const cards = await Promise.all(
    (tables ?? []).map(async (table) => {
      const url = `${siteUrl}/m/${staff.business.slug}?mesa=${encodeURIComponent(table.label)}`;
      const svg = await QRCode.toString(url, { type: "svg", margin: 1, width: 220 });
      return { table, svg };
    }),
  );

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
            Hoja de QR
          </h1>
          <p className="text-sm text-ink-500">Imprimí y pegá uno por mesa.</p>
        </div>
        <PrintButton />
      </div>

      {cards.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          No hay mesas activas todavía.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-2">
          {cards.map(({ table, svg }) => (
            <div
              key={table.id}
              className="flex flex-col items-center gap-2 rounded-card border border-ink-200 bg-white p-4 text-center print:break-inside-avoid"
            >
              <p className="font-display text-2xl font-bold tracking-tight text-ink-900">
                Mesa {table.label}
              </p>
              {/* Our own server-generated SVG, not user input. */}
              <div className="[&_svg]:size-40" dangerouslySetInnerHTML={{ __html: svg }} />
              <p className="text-xs text-ink-500">Escaneá para pedir</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

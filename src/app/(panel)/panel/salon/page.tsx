import { QrCode, Trash2 } from "lucide-react";
import Link from "next/link";

import { AsyncToggle } from "@/components/panel/async-toggle";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { FloorPlan } from "@/components/panel/floor-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { ACTIVE_STATUSES } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

import { createTable, deleteTable, moveTable, setTableShape, toggleTableActive } from "./actions";

export const metadata = { title: "Salón" };
export const dynamic = "force-dynamic";

export default async function SalonPage() {
  const staff = await requireStaff();
  requireModule(staff, "tables");
  const supabase = await createClient();

  const [tablesResult, openOrdersResult] = await Promise.all([
    supabase
      .from("restaurant_tables")
      .select("*")
      .eq("business_id", staff.business.id)
      .order("sort_order"),
    // Occupied is derived, not stored — a table with any non-terminal order
    // right now is occupied, full stop. See orders_open_table_idx.
    supabase
      .from("orders")
      .select("table_id")
      .eq("business_id", staff.business.id)
      .not("table_id", "is", null)
      .in("status", ACTIVE_STATUSES),
  ]);

  const occupiedTableIds = new Set((openOrdersResult.data ?? []).map((o) => o.table_id));
  const tables = tablesResult.data ?? [];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-ink-900">Salón</h1>
          <p className="text-sm text-ink-500">Mesas del local y su estado en este momento.</p>
        </div>
        {tables.length > 0 && (
          <Link
            href="/panel/salon/qr"
            className="flex min-h-touch items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <QrCode className="size-4" aria-hidden />
            Hoja de QR
          </Link>
        )}
      </div>

      <FloorPlan
        tables={tables.map((table) => ({
          id: table.id,
          label: table.label,
          seats: table.seats,
          // Normalised rather than passed through: before the floor-plan
          // migration runs these columns are absent, and `undefined` would
          // reach the style as "left: undefined%". Null means "never placed",
          // which the plan already knows how to lay out.
          shape: table.shape === "round" ? "round" : "square",
          positionX: table.position_x ?? null,
          positionY: table.position_y ?? null,
          isActive: table.is_active,
          isOccupied: occupiedTableIds.has(table.id),
        }))}
        move={moveTable}
      />

      <form action={createTable} className="flex flex-wrap items-end gap-2 rounded-card border border-ink-200 bg-white p-3">
        <div className="w-24">
          <label className="mb-1 block text-xs font-medium text-ink-700">Mesa</label>
          <Input name="label" placeholder="Ej: 4" required />
        </div>
        <div className="w-20">
          <label className="mb-1 block text-xs font-medium text-ink-700">Sillas</label>
          <Input name="seats" defaultValue={2} inputMode="numeric" />
        </div>
        <div className="w-32 flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-700">Zona (opcional)</label>
          <Input name="zone" placeholder="Salón, terraza…" />
        </div>
        <Button type="submit">Agregar</Button>
      </form>

      {tables.length === 0 ? (
        <p className="rounded-card border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
          Todavía no cargaste ninguna mesa.
        </p>
      ) : (
        <div className="overflow-hidden rounded-card border border-ink-200 bg-white">
          <ul className="divide-y divide-ink-100">
            {tables.map((table) => {
              const occupied = occupiedTableIds.has(table.id);
              return (
                <li key={table.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      Mesa {table.label}
                      {table.zone ? ` · ${table.zone}` : ""}
                    </p>
                    <p className="text-xs text-ink-500">{table.seats} sillas</p>
                  </div>

                  <span
                    className={
                      occupied
                        ? "rounded-full bg-status-kitchen-soft px-2 py-0.5 text-xs font-medium text-status-kitchen"
                        : "rounded-full bg-status-transit-soft px-2 py-0.5 text-xs font-medium text-status-transit"
                    }
                  >
                    {occupied ? "Ocupada" : "Libre"}
                  </span>

                  {/* Shape is a plain form, not a toggle component: it flips
                      between two named values rather than on/off. */}
                  <form
                    action={setTableShape.bind(
                      null,
                      table.id,
                      table.shape === "round" ? "square" : "round",
                    )}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      aria-label={`Cambiar a ${table.shape === "round" ? "cuadrada" : "redonda"}`}
                    >
                      {table.shape === "round" ? "Redonda" : "Cuadrada"}
                    </Button>
                  </form>

                  <AsyncToggle
                    checked={table.is_active}
                    action={toggleTableActive.bind(null, table.id)}
                    label="Activa"
                  />

                  <form action={deleteTable.bind(null, table.id)}>
                    <ConfirmSubmitButton
                      variant="ghost"
                      size="icon"
                      confirmMessage={`Eliminar la mesa ${table.label}. ¿Seguro?`}
                      aria-label="Eliminar mesa"
                    >
                      <Trash2 className="size-4 text-danger" aria-hidden />
                    </ConfirmSubmitButton>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}

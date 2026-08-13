import { CheckCircle2, QrCode, Trash2 } from "lucide-react";
import Link from "next/link";

import { AsyncToggle } from "@/components/panel/async-toggle";
import { ConfirmSubmitButton } from "@/components/panel/confirm-submit-button";
import { FloorPlan } from "@/components/panel/floor-plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { requireModule, requireStaff } from "@/lib/auth/context";
import { canConfigure } from "@/lib/auth/roles";
import { ACTIVE_STATUSES } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/server";

import { createTable, deleteTable, moveTable, setTableShape, toggleTableActive } from "./actions";

export const metadata = { title: "Salón" };
export const dynamic = "force-dynamic";

export default async function SalonPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string }>;
}) {
  // WaiterOrder sends the mozo back here with ?enviado=<código>. Until this
  // was read, the comanda went to the kitchen and the screen just… returned
  // to the room, with nothing saying it had worked.
  const { enviado } = await searchParams;
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
  // Writes to restaurant_tables are owner/manager only in RLS. A mozo gets the
  // room and nothing else — showing them an "Agregar mesa" form whose insert
  // the database will refuse is worse than not showing it.
  const canEdit = canConfigure(staff.role);

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold tracking-tight text-ink-900 sm:text-xl">
            Salón
          </h1>
          <p className="truncate text-sm text-ink-500">
            Mesas del local y su estado en este momento.
          </p>
        </div>
        {tables.length > 0 && canEdit && (
          <Link
            href="/panel/salon/qr"
            className="flex min-h-touch shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            <QrCode className="size-4" aria-hidden />
            <span className="hidden sm:inline">Hoja de QR</span>
          </Link>
        )}
      </div>

      {enviado && (
        <p className="flex items-center gap-2 rounded-card border border-success bg-success-soft px-3 py-2 text-sm font-medium text-success">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          Comanda <span className="font-mono">{enviado}</span> enviada a cocina.
        </p>
      )}

      {/* Two panes from lg up: the room on the left at a readable, capped
          size, the admin list on the right instead of stacked a full screen
          below it. Under lg they stack, and the admin half collapses into a
          <details> — on a phone during service the only thing that matters is
          the room, and everything after it was pure scrolling. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="rounded-card border border-ink-200 bg-white p-3 sm:p-4">
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
            canArrange={canEdit}
          />
        </div>

        {canEdit && (
          // A <details> rather than a client component: setting up the room is
          // something an owner does once, so on a phone mid-service it should
          // fold away to a single row — and it has to do that without JS,
          // without a media query, and without an open/closed state that
          // renders differently on the server than in the browser.
          <details open className="group rounded-card border border-ink-200 bg-white">
            <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-2 px-3 text-sm font-semibold text-ink-900">
              Administrar mesas
              <span className="text-xs font-normal text-ink-500">
                {tables.length} cargada{tables.length === 1 ? "" : "s"} · {" "}
                <span className="group-open:hidden">mostrar</span>
                <span className="hidden group-open:inline">ocultar</span>
              </span>
            </summary>

            <div className="flex flex-col gap-3 border-t border-ink-100 p-3">
              <form action={createTable} className="flex flex-wrap items-end gap-2">
                <div className="w-20">
                  <label className="mb-1 block text-xs font-medium text-ink-700">Mesa</label>
                  <Input name="label" placeholder="Ej: 4" required />
                </div>
                <div className="w-16">
                  <label className="mb-1 block text-xs font-medium text-ink-700">Sillas</label>
                  <Input name="seats" defaultValue={2} inputMode="numeric" />
                </div>
                <div className="min-w-24 flex-1">
                  <label className="mb-1 block text-xs font-medium text-ink-700">Zona</label>
                  <Input name="zone" placeholder="Terraza…" />
                </div>
                <Button type="submit">Agregar</Button>
              </form>

              {tables.length === 0 ? (
                <p className="rounded-card border border-dashed border-ink-200 p-4 text-center text-sm text-ink-500">
                  Todavía no cargaste ninguna mesa.
                </p>
              ) : (
                <ul className="divide-y divide-ink-100 overflow-hidden rounded-card border border-ink-200">
                  {tables.map((table) => {
                    const occupied = occupiedTableIds.has(table.id);
                    return (
                      <li key={table.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 p-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink-900">
                            Mesa {table.label}
                            {table.zone ? ` · ${table.zone}` : ""}
                          </p>
                          <p className="text-xs text-ink-500">
                            {table.seats} sillas · {occupied ? "Ocupada" : "Libre"}
                          </p>
                        </div>

                        {/* Shape is a plain form, not a toggle component: it
                            flips between two named values rather than on/off. */}
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
              )}
            </div>
          </details>
        )}
      </div>
    </main>
  );
}

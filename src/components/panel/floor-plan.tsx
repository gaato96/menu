"use client";

import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { BellRing, Move, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FloorShape } from "@/types/database";

export interface PlanTable {
  id: string;
  label: string;
  seats: number;
  shape: FloorShape;
  positionX: number | null;
  positionY: number | null;
  isActive: boolean;
  isOccupied: boolean;
  /** Has an open "la cuenta" / "llamo al mozo" right now. */
  isCalling?: boolean;
}

/**
 * A picture of the room, so a waiter can find "the table by the window"
 * without translating a number into a place first.
 *
 * Two modes on purpose. In service mode tapping a table takes the order —
 * dragging would be an accident waiting to happen with a phone in one hand.
 * Arranging only happens in edit mode, which is a deliberate thing an owner
 * does once when they set the local up.
 */
export function FloorPlan({
  tables,
  move,
  canArrange = true,
}: {
  tables: PlanTable[];
  /**
   * A Server Action, which crosses this boundary fine. A plain callback would
   * not: a Server Component cannot hand a function to a Client Component, and
   * doing it crashes the whole page rather than failing quietly.
   */
  move: (tableId: string, x: number, y: number) => Promise<void>;
  /**
   * Arranging writes to restaurant_tables, which RLS restricts to owner and
   * manager. Without this a mozo would see "Acomodar", drag a table, and
   * watch it snap back on the next refresh with no explanation.
   */
  canArrange?: boolean;
}) {
  const router = useRouter();
  const areaRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  // Optimistic positions: the drag has to land where the finger left it,
  // without waiting for São Paulo to answer.
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // A pointer has to travel 6px before it counts as a drag, so a tap on a
  // table in edit mode still reads as a tap rather than a 1px move.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function positionOf(table: PlanTable, index: number) {
    const optimistic = positions[table.id];
    if (optimistic) return optimistic;
    if (table.positionX !== null && table.positionY !== null) {
      return { x: table.positionX, y: table.positionY };
    }
    // Never placed: lay it out in a readable grid instead of stacking every
    // unplaced table at the origin.
    const column = index % 5;
    const row = Math.floor(index / 5);
    return { x: 10 + column * 19, y: 12 + row * 22 };
  }

  function handleDragEnd(event: DragEndEvent) {
    const area = areaRef.current;
    if (!area) return;

    const table = tables.find((t) => t.id === event.active.id);
    if (!table) return;

    const index = tables.indexOf(table);
    const current = positionOf(table, index);
    const rect = area.getBoundingClientRect();

    // Deltas arrive in pixels; the store is in percentages of this box.
    const next = {
      x: Math.min(100, Math.max(0, current.x + (event.delta.x / rect.width) * 100)),
      y: Math.min(100, Math.max(0, current.y + (event.delta.y / rect.height) * 100)),
    };

    setPositions((p) => ({ ...p, [table.id]: next }));
    startTransition(async () => {
      await move(table.id, next.x, next.y);
      router.refresh();
    });
  }

  const occupied = tables.filter((t) => t.isOccupied).length;
  const free = tables.filter((t) => t.isActive && !t.isOccupied).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-500">
          {editing
            ? "Arrastrá las mesas para que queden como en tu local."
            : "Tocá una mesa para ver la cuenta o tomarle el pedido."}
        </p>
        {canArrange && (
          <Button
            type="button"
            variant={editing ? "primary" : "outline"}
            size="sm"
            onClick={() => setEditing((value) => !value)}
          >
            <Move className="size-4" aria-hidden />
            {editing ? "Listo" : "Acomodar"}
          </Button>
        )}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        {/* Capped, and centred inside whatever column it lands in. A plain
            `w-full aspect-4/3` grew with the viewport: on a 27" monitor the
            room became a 900px-tall diagram nobody can take in at a glance,
            and every control below it fell under the fold. A floor plan is a
            map — past a point, bigger stops adding information. */}
        <div
          ref={areaRef}
          className={cn(
            "dot-grid relative mx-auto aspect-4/3 w-full max-w-2xl overflow-hidden rounded-card border bg-ink-50",
            editing ? "border-brand border-dashed" : "border-ink-200",
          )}
        >
          {tables.map((table, index) => (
            <PlanPiece
              key={table.id}
              table={table}
              position={positionOf(table, index)}
              editing={editing}
              onOpen={() => router.push(`/panel/salon/mesa/${table.id}`)}
            />
          ))}

          {tables.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-500">
              Cargá tus mesas abajo y después acomodalas acá.
            </p>
          )}
        </div>
      </DndContext>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-600">
        <Legend className="bg-white ring-ink-300" label="Libre" />
        <Legend className="bg-brand-soft ring-brand" label="Ocupada" />
        <Legend className="bg-ink-100 ring-ink-200" label="Desactivada" />
        <Legend className="bg-white ring-warning" label="Llamando" />
        {tables.length > 0 && (
          <span className="ml-auto font-mono text-ink-500">
            {occupied} ocupada{occupied === 1 ? "" : "s"} · {free} libre{free === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-3 rounded-full ring-1 ring-inset", className)} aria-hidden />
      {label}
    </span>
  );
}

function PlanPiece({
  table,
  position,
  editing,
  onOpen,
}: {
  table: PlanTable;
  position: { x: number; y: number };
  editing: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    disabled: !editing,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={editing ? undefined : onOpen}
      aria-label={`${table.label}, ${table.seats} lugares, ${
        !table.isActive ? "desactivada" : table.isOccupied ? "ocupada" : "libre"
      }${table.isCalling ? ", está llamando" : ""}`}
      className={cn(
        "absolute flex size-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center ring-2 ring-inset transition-colors sm:size-16",
        table.shape === "round" ? "rounded-full" : "rounded-lg",
        !table.isActive
          ? "bg-ink-100 text-ink-400 ring-ink-200"
          : table.isOccupied
            ? "bg-brand-soft text-brand ring-brand"
            : "bg-white text-ink-900 ring-ink-300",
        editing ? "cursor-grab" : "cursor-pointer hover:ring-brand",
        // A table with its hand up outranks every other state on the plan.
        table.isCalling && "z-10 ring-4 ring-warning",
        isDragging && "z-10 cursor-grabbing opacity-90 shadow-ticket",
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: transform
          ? `translate3d(calc(-50% + ${transform.x}px), calc(-50% + ${transform.y}px), 0)`
          : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {table.isCalling && (
        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-warning text-white">
          <BellRing className="size-3" aria-hidden />
        </span>
      )}
      <span className="font-display text-base leading-none font-bold">{table.label}</span>
      <span className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] opacity-70">
        <Users className="size-2.5" aria-hidden />
        {table.seats}
      </span>
    </button>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  type BoardOrder,
  fetchBoardOrders,
  fetchOrderItems,
} from "@/lib/orders/board-queries";
import { isTerminal } from "@/lib/orders/status";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

const POLL_INTERVAL_MS = 30_000;

/**
 * Three redundant channels feeding the same board state, by design — the one
 * that fails can't take the other two down:
 *
 *   1. Realtime (primary): postgres_changes on `orders`, near-instant.
 *   2. Polling every 30s + on tab focus: catches a WebSocket that died
 *      without firing a close event, the single most expensive failure mode
 *      here — a silently dead socket looks identical to "no new orders".
 *   3. Web Push (lib/push): reaches the device even with the tab closed,
 *      wired separately in board.tsx / push-enable-banner.tsx.
 */
export function useOrderRealtime(businessId: string, initialOrders: BoardOrder[]) {
  const [orders, setOrders] = useState<BoardOrder[]>(initialOrders);
  const [connected, setConnected] = useState(false);
  // Lazy initializer keeps the client stable across renders without reading
  // a ref during render (useRef(...).current on the first line does exactly
  // that and trips react-hooks/refs).
  const [supabase] = useState(() => createClient());
  const onNewOrderRef = useRef<((order: BoardOrder) => void) | null>(null);

  const refetch = useCallback(async () => {
    try {
      const fresh = await fetchBoardOrders(supabase, businessId);
      setOrders(fresh);
    } catch (error) {
      console.error("useOrderRealtime: refetch failed", error);
    }
  }, [supabase, businessId]);

  useEffect(() => {
    const channel = supabase
      .channel(`orders:${businessId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `business_id=eq.${businessId}` },
        (payload) => {
          const row = payload.new as Tables<"orders">;
          if (isTerminal(row.status)) return;

          setOrders((prev) => {
            if (prev.some((o) => o.id === row.id)) return prev;
            return [...prev, { ...row, items: [] }];
          });

          void fetchOrderItems(supabase, row.id).then((items) => {
            setOrders((prev) => prev.map((o) => (o.id === row.id ? { ...o, items } : o)));
          });

          const inserted: BoardOrder = { ...row, items: [] };
          onNewOrderRef.current?.(inserted);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `business_id=eq.${businessId}` },
        (payload) => {
          const row = payload.new as Tables<"orders">;

          setOrders((prev) => {
            // Order left the board (completed/cancelled elsewhere): drop it.
            if (isTerminal(row.status)) {
              return prev.filter((o) => o.id !== row.id);
            }
            return prev.map((o) => (o.id === row.id ? { ...o, ...row } : o));
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "orders", filter: `business_id=eq.${businessId}` },
        (payload) => {
          const row = payload.old as { id: string };
          setOrders((prev) => prev.filter((o) => o.id !== row.id));
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
        // A channel that just came back up may have missed events while it
        // was down — reconcile with a full refetch rather than trust the gap.
        if (status === "SUBSCRIBED") void refetch();
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, businessId, refetch]);

  useEffect(() => {
    const interval = setInterval(refetch, POLL_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refetch]);

  return {
    orders,
    /** Exposed for optimistic drag/quick-action updates in board.tsx. */
    setOrders,
    connected,
    refetch,
    /** Registered by board.tsx to trigger the sound + fullscreen alert. */
    setOnNewOrder: (callback: (order: BoardOrder) => void) => {
      onNewOrderRef.current = callback;
    },
  };
}

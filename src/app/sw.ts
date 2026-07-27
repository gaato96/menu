import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_URL = "/offline";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // A counter tablet can stay open for weeks. Old workers are not allowed to
  // linger: activate immediately and take over every open client.
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    /* ------------------------------------------------------------------
       NEVER CACHED.
       Order state is the product. A cached comanda is worse than no comanda:
       it makes the kitchen cook something that was already cancelled.
    ------------------------------------------------------------------ */
    {
      matcher: ({ url, sameOrigin }) =>
        sameOrigin &&
        (url.pathname.startsWith("/api/") ||
          url.pathname.startsWith("/panel") ||
          url.pathname.startsWith("/admin")),
      handler: new NetworkOnly(),
    },
    {
      // Supabase REST/Realtime/Auth — always live.
      matcher: ({ url }) => url.hostname.endsWith(".supabase.co"),
      handler: new NetworkOnly(),
    },

    /* ------------------------------------------------------------------
       Public menu: usable on a bad mobile connection, but never silently
       stale — the page shows an "outdated menu" banner when it falls back.
    ------------------------------------------------------------------ */
    {
      matcher: ({ url, sameOrigin, request }) =>
        sameOrigin && request.mode === "navigate" && url.pathname.startsWith("/m/"),
      handler: new NetworkFirst({
        cacheName: "menu-pages",
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) =>
              response.status === 200 ? response : null,
          },
        ],
      }),
    },

    /* Product photos change rarely and are the heaviest asset on the menu. */
    {
      matcher: ({ url, request }) =>
        request.destination === "image" &&
        (url.hostname.endsWith(".supabase.co") || url.pathname.startsWith("/_next/image")),
      handler: new StaleWhileRevalidate({ cacheName: "product-images" }),
    },

    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

/* ---------------------------------------------------------------------------
   Web Push — the safety net.

   This is what makes a new order reach the business when the app is closed and
   the tablet is locked. It is intentionally independent from the in-app sound
   alert, so that one failing does not take the other down.
--------------------------------------------------------------------------- */
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload: {
    title?: string;
    body?: string;
    orderId?: string;
    code?: string;
  };

  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Pedido nuevo", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Pedido nuevo", {
      body: payload.body ?? "Entró un pedido nuevo.",
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      // Same tag so ten orders don't bury the screen in ten cards, but
      // renotify so each one still buzzes.
      tag: "new-order",
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 120, 300, 120, 300],
      data: { url: payload.orderId ? `/panel?pedido=${payload.orderId}` : "/panel" },
    } as NotificationOptions),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data?.url as string | undefined) ?? "/panel";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Reuse the board if it is already open instead of stacking windows.
      for (const client of clientList) {
        if (client.url.includes("/panel")) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      }

      await self.clients.openWindow(target);
    })(),
  );
});

serwist.addEventListeners();

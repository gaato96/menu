/** Browser-side Web Push registration. Client-only — imports nothing server. */

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Asks for permission and registers this device. Called only AFTER the first
 * order lands (see push-enable-banner.tsx) — asking cold, before the tablet
 * has seen the product work, is the fastest way to get "denied" forever.
 */
export async function enablePushNotifications(): Promise<
  { ok: true } | { ok: false; reason: "unsupported" | "denied" | "error" }
> {
  if (!isPushSupported()) return { ok: false, reason: "unsupported" };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "denied" };

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Cast: lib.dom's ArrayBufferView now requires ArrayBuffer specifically
      // (excluding SharedArrayBuffer), which Uint8Array's generic signature
      // doesn't guarantee even though this one always backs a plain ArrayBuffer.
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!response.ok) return { ok: false, reason: "error" };
    return { ok: true };
  } catch (error) {
    console.error("enablePushNotifications", error);
    return { ok: false, reason: "error" };
  }
}

export async function pushPermissionState(): Promise<NotificationPermission | "unsupported"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Generates the VAPID key pair used to sign Web Push messages.
 *
 *   npm run push:keys
 *
 * Run this ONCE per environment and keep the values stable. Rotating the keys
 * invalidates every device that already subscribed, which in practice means
 * every tablet silently stops receiving new-order notifications until someone
 * re-enables them by hand.
 */
import webpush from "web-push";

const { publicKey, privateKey } = webpush.generateVAPIDKeys();

console.log(
  [
    "",
    "Pegá esto en .env.local (y en las variables de entorno de Vercel):",
    "",
    `NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKey}`,
    `VAPID_PRIVATE_KEY=${privateKey}`,
    "",
    "La privada nunca va al navegador ni al repositorio.",
    "",
  ].join("\n"),
);

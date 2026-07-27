import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import { Toaster } from "sonner";

import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker";

import "./globals.css";

/**
 * Display face: a condensed industrial grotesque for menu-board and
 * ticket-header moments — used sparingly, never for body copy.
 * Body face: a warm grotesque for anything actually read.
 * Mono: reserved for numbers that behave like receipt data.
 */
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  // "variable" weight is what unlocks the opsz axis below — Tailwind's
  // font-bold/font-extrabold utilities still work normally on top of it.
  weight: "variable",
  // The opsz axis is what Google Fonts otherwise ships as separate "Text" and
  // "Display" cuts. Letting it stay variable means it leans condensed and
  // dramatic at the large sizes this face is actually used at, and never
  // gets used small enough for that to be a legibility problem.
  axes: ["opsz"],
});
const schibsted = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Menú Digital",
    template: "%s · Menú Digital",
  },
  description:
    "Toma de pedidos en tiempo real para locales gastronómicos: menú digital y tablero de comandas.",
  manifest: "/manifest.webmanifest",
  applicationName: "Menú Digital",
  appleWebApp: {
    capable: true,
    title: "Comandas",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f1ebdd",
  width: "device-width",
  initialScale: 1,
  // viewportFit: cover is what makes env(safe-area-inset-*) resolve to real
  // values on notched phones once the app is installed.
  viewportFit: "cover",
  // Deliberately no maximumScale: blocking pinch-zoom to stop iOS focus-zoom
  // would break the menu for anyone who needs larger text. The 16px minimum
  // font-size on inputs in globals.css solves that without the accessibility cost.
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-AR"
      className={`${bigShoulders.variable} ${schibsted.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="app-surface flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegistrar />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

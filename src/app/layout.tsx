import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
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
    default: "VivoMenu",
    template: "%s · VivoMenu",
  },
  description:
    "Toma de pedidos en tiempo real para locales gastronómicos: menú digital y tablero de comandas.",
  manifest: "/manifest.webmanifest",
  applicationName: "VivoMenu",
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
  // Next renders this as <meta name="google-site-verification" ...> in <head>.
  // Search Console re-checks this tag on demand, so it can stay here forever
  // rather than being a one-time setup step to remove later.
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
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

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {/* Unset in local/dev by default — analytics only load where the env
            var is configured (production), not on every laptop running `npm run dev`. */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

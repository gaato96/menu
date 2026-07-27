import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
  themeColor: "#d1420a",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="app-surface flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegistrar />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}

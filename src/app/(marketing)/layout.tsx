import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/543815976357";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-ink-50/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight text-ink-900">
            Menú<span className="text-brand">Digital</span>
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center rounded-lg bg-[#25D366] px-3.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Escribinos
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-100 px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-base font-bold text-ink-900">
              Menú<span className="text-brand">Digital</span>
            </p>
            <p className="text-xs text-ink-500">Hecho en Tucumán, para locales como el tuyo.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-500">
            <Link href="/m/burger-house-tuc" className="underline-offset-2 hover:underline">
              Menú en vivo
            </Link>
            <Link href="/login" className="underline-offset-2 hover:underline">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

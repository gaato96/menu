import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/543815976357";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-ink-50">
      {/* Header sits on the dark hero, so it is dark too — it becomes a
          floating bar over the kraft sections further down rather than
          switching theme mid-scroll, which would read as a bug. */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/"
            className="inline-flex min-h-touch items-center font-display text-lg font-extrabold tracking-tight text-white transition-colors hover:text-ember"
          >
            Menú<span className="text-ember">Digital</span>
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch items-center rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] hover:brightness-95"
          >
            Escribinos
          </a>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-white/10 bg-night-950 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-base font-bold text-white">
              Menú<span className="text-ember">Digital</span>
            </p>
            <p className="mt-0.5 text-xs text-white/50">
              Hecho en Tucumán, para locales como el tuyo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Link
              href="/m/burger-house-tuc"
              className="inline-flex min-h-touch items-center px-2 underline-offset-4 hover:text-white hover:underline"
            >
              Menú en vivo
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-touch items-center px-2 underline-offset-4 hover:text-white hover:underline"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

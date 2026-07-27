import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Menú Digital</h1>
        <p className="mt-2 max-w-md text-sm text-ink-500">
          Toma de pedidos en tiempo real para locales gastronómicos.
        </p>
      </div>

      <Link
        href="/panel"
        className="inline-flex min-h-touch items-center rounded-lg bg-brand px-6 font-semibold text-brand-fg"
      >
        Entrar al panel
      </Link>
    </main>
  );
}

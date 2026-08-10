/**
 * Shown the instant a panel tab is tapped, while the server renders.
 *
 * Every panel page is force-dynamic and reads from São Paulo, so a navigation
 * costs a few hundred milliseconds no matter how tight the queries get.
 * Without this file React holds the OLD page on screen for that whole time
 * and the tap reads as ignored — the counter taps it again. The skeleton is
 * not decoration: it is the difference between "slow" and "broken".
 *
 * Deliberately generic. A per-screen skeleton that guesses wrong flashes a
 * shape the real page does not have, which is worse than a neutral one.
 */
export default function PanelLoading() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>

      <div className="h-7 w-40 animate-pulse rounded-lg bg-ink-200" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-card border border-ink-200 bg-white p-3">
            <div className="h-3 w-16 animate-pulse rounded bg-ink-100" />
            <div className="mt-2 h-6 w-24 animate-pulse rounded bg-ink-200" />
          </div>
        ))}
      </div>

      <div className="rounded-card border border-ink-200 bg-white p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-ink-100 py-3 last:border-0">
            <div className="h-4 flex-1 animate-pulse rounded bg-ink-100" />
            <div className="h-4 w-20 animate-pulse rounded bg-ink-100" />
          </div>
        ))}
      </div>
    </main>
  );
}

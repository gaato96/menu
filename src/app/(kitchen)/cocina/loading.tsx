/** Kitchen runs on its own dark screen, so it needs its own skeleton. */
export default function KitchenLoading() {
  return (
    <main className="flex flex-1 flex-col gap-3 p-4" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-card bg-white/10" />
        ))}
      </div>
    </main>
  );
}

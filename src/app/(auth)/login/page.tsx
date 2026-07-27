import { LoginForm } from "./login-form";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold text-ink-900">Menú Digital</h1>
          <p className="mt-1 text-sm text-ink-500">Entrá al panel de tu local.</p>
        </div>

        <LoginForm next={next} />
      </div>
    </main>
  );
}

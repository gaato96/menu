"use client";

import { useState, useTransition, type ReactNode } from "react";

/**
 * Generic wrapper for a Server Action that reports back {error?: string}.
 * Keeps the actual fields as plain server-renderable children — only the
 * submit/pending/error plumbing needs to run on the client.
 */
export function ActionForm({
  action,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<{ ok?: true; error?: string } | undefined>;
  children: ReactNode;
  className?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className={className}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await action(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      {children}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {pending && <p className="mt-2 text-xs text-ink-400">Guardando…</p>}
    </form>
  );
}

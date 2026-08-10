"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";

/**
 * A <form> around a Server Action that returns `{ error }` instead of
 * throwing, so a rejected cash movement lands as a line of text under the
 * fields rather than an error page.
 *
 * The cash screens need this because most of their failures are expected
 * ones — the drawer closed on another device, the order was already
 * collected — not bugs. Those deserve a sentence, not a crash.
 */
export function ActionForm({
  action,
  children,
  className,
  submitLabel,
  pendingLabel,
  confirmMessage,
  renderSubmit,
  resetOnSuccess = true,
}: {
  action: (formData: FormData) => Promise<{ ok?: true; error?: string }>;
  children?: ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  /** Native confirm() before firing. For closing the drawer and undoing a charge. */
  confirmMessage?: string;
  /** Full control of the submit control when a plain button will not do. */
  renderSubmit?: (pending: boolean) => ReactNode;
  resetOnSuccess?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault();
      }}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await action(formData);
          if (result?.error) {
            setError(result.error);
            return;
          }
          if (resetOnSuccess) formRef.current?.reset();
        });
      }}
    >
      {children}

      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}

      {renderSubmit ? (
        renderSubmit(pending)
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="mt-3 inline-flex min-h-touch items-center justify-center rounded-lg bg-brand px-4 text-sm font-semibold text-brand-fg transition-colors hover:brightness-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (pendingLabel ?? "Guardando…") : submitLabel}
        </button>
      )}
    </form>
  );
}

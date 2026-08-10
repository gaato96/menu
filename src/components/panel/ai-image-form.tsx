"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

type Candidate = { previewUrl: string; generationId: string; originalUrl: string };

/**
 * The AI photo enhancer.
 *
 * The side-by-side preview is not a nicety — it is the safeguard. The model
 * can quietly change a garnish, and a menu photo that shows something the
 * kitchen does not serve is the owner's problem the moment a plate lands on a
 * table. Nothing is ever swapped without the owner comparing both and saying
 * yes, so there is deliberately no "generate and apply" path.
 */
export function AiImageForm({
  unavailable,
  remaining,
  quota,
  generate,
  accept,
  discard,
}: {
  /** The quota counter could not be read — infrastructure, not a spent quota. */
  unavailable: boolean;
  remaining: number;
  quota: number;
  generate: (
    formData: FormData,
  ) => Promise<
    { ok: true; previewUrl: string; generationId: string; remaining: number } | { error: string }
  >;
  accept: (generationId: string) => Promise<{ ok?: true; error?: string }>;
  discard: (generationId: string) => Promise<{ ok?: true; error?: string }>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [left, setLeft] = useState(remaining);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The original preview is an object URL over the file the owner picked;
  // without this it leaks for as long as the panel stays open.
  useEffect(() => {
    return () => {
      if (candidate?.originalUrl) URL.revokeObjectURL(candidate.originalUrl);
    };
  }, [candidate?.originalUrl]);

  const exhausted = left <= 0;
  const blocked = unavailable || exhausted;

  function submit(formData: FormData) {
    const file = formData.get("aiImage");
    if (!(file instanceof File) || file.size === 0) {
      setError("Elegí o sacá una foto del plato.");
      return;
    }

    // The action expects the field named `image`, same as the manual upload.
    const payload = new FormData();
    payload.set("image", file);
    const originalUrl = URL.createObjectURL(file);

    setError(null);
    startTransition(async () => {
      const result = await generate(payload);
      if ("error" in result) {
        URL.revokeObjectURL(originalUrl);
        setError(result.error);
        return;
      }
      setCandidate({
        previewUrl: result.previewUrl,
        generationId: result.generationId,
        originalUrl,
      });
      setLeft(result.remaining);
    });
  }

  function clearCandidate() {
    if (inputRef.current) inputRef.current.value = "";
    setCandidate(null);
  }

  if (candidate) {
    return (
      <div className="rounded-card border border-ink-200 bg-ink-50 p-4">
        <p className="text-sm font-medium text-ink-900">Compará antes de usarla</p>
        <p className="mt-1 text-xs text-ink-600">
          Si la IA cambió algo del plato —un ingrediente, la guarnición, la porción— descartala. La
          foto tiene que mostrar lo que el cliente va a recibir.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <figure>
            <div className="aspect-9/16 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
              {/* Plain img: an object: URL has no loader for next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candidate.originalUrl}
                alt="Foto original del plato"
                className="size-full object-cover"
              />
            </div>
            <figcaption className="mt-1 text-center text-xs text-ink-600">Tu foto</figcaption>
          </figure>

          <figure>
            <div className="aspect-9/16 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
              <Image
                src={candidate.previewUrl}
                alt="Foto generada con IA"
                width={360}
                height={640}
                className="size-full object-cover"
                unoptimized
              />
            </div>
            <figcaption className="mt-1 text-center text-xs text-ink-600">Generada</figcaption>
          </figure>
        </div>

        {error && <p className="mt-2 text-xs text-danger">{error}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await accept(candidate.generationId);
                if (result.error) {
                  setError(result.error);
                  return;
                }
                clearCandidate();
                router.refresh();
              });
            }}
          >
            {pending ? "Guardando…" : "Usar esta"}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                await discard(candidate.generationId);
                clearCandidate();
              });
            }}
          >
            Descartar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={submit} className="rounded-card border border-ink-200 bg-ink-50 p-4">
      <p className="text-sm font-medium text-ink-900">Mejorar la foto con IA</p>
      <p className="mt-1 text-xs text-ink-600">
        Sacale una foto al plato como está y la IA la deja lista para la carta: luz cálida, fondo
        limpio y vertical. No cambia el plato — solo la foto.
      </p>

      <input
        ref={inputRef}
        type="file"
        name="aiImage"
        accept="image/jpeg,image/png,image/webp"
        // Opens the camera straight away on a phone, which is where this gets
        // used: standing at the counter with the plate in front of you.
        capture="environment"
        disabled={blocked || pending}
        className="mt-3 block w-full text-sm text-ink-700 file:mr-3 file:min-h-touch file:rounded-lg file:border-0 file:bg-white file:px-3 file:text-sm file:font-medium disabled:opacity-50"
      />

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={blocked || pending}>
          {pending ? "Generando…" : "Generar foto"}
        </Button>
        <span className="text-xs text-ink-600">
          {unavailable
            ? "El generador todavía no está disponible."
            : exhausted
              ? `Usaste las ${quota} fotos de este mes. Se renueva el 1°.`
              : `Te quedan ${left} de ${quota} este mes`}
        </span>
      </div>

      {pending && (
        <p className="mt-2 text-xs text-ink-600" aria-live="polite">
          Puede tardar hasta medio minuto. No cierres la pantalla.
        </p>
      )}
    </form>
  );
}

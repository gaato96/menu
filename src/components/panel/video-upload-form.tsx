"use client";

import { Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

const MAX_SECONDS = 12;
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * The looping clip behind a product in the vertical view.
 *
 * The duration check lives here and not on the server because the browser is
 * the only side that can read it without decoding the file: it loads the
 * metadata from a blob URL and refuses before a single byte goes over the
 * wire. That is also the friendlier failure — the owner finds out in a second
 * instead of after uploading 8MB over the local's wifi.
 */
export function VideoUploadForm({
  currentUrl,
  posterUrl,
  action,
  remove,
}: {
  currentUrl: string | null;
  posterUrl: string | null;
  action: (formData: FormData) => Promise<{ ok?: true; error?: string } | undefined>;
  remove: () => Promise<void>;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function inspect(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError("Pesa más de 8MB. Recortalo o bajale la calidad antes de subirlo.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (probe.duration > MAX_SECONDS) {
        setError(`Dura ${Math.round(probe.duration)}s. El máximo son ${MAX_SECONDS}s.`);
        if (inputRef.current) inputRef.current.value = "";
        URL.revokeObjectURL(url);
        return;
      }
      // Not a hard stop: a horizontal clip still plays, it just gets cropped
      // to the sides on a phone. Worth a warning, not a rejection.
      if (probe.videoWidth > probe.videoHeight) {
        setError("Ojo: es horizontal. Se va a recortar bastante en el celular.");
      }
      setPreview(url);
    };
    probe.onerror = () => {
      setError("No pudimos leer el video. Usá MP4 o WebM.");
      if (inputRef.current) inputRef.current.value = "";
      URL.revokeObjectURL(url);
    };
    probe.src = url;
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex aspect-9/16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
        {preview ? (
          // Muted + loop + playsInline here too, so the panel preview behaves
          // exactly like the customer's screen will.
          <video
            src={preview}
            poster={posterUrl ?? undefined}
            muted
            loop
            playsInline
            autoPlay
            className="size-full object-cover"
          />
        ) : (
          <span className="p-2 text-center text-xs text-ink-400">Sin video</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await action(formData);
              if (result?.error) setError(result.error);
            });
          }}
        >
          <input
            ref={inputRef}
            type="file"
            name="video"
            accept="video/mp4,video/webm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) inspect(file);
            }}
            className="block w-full text-sm text-ink-700 file:mr-3 file:min-h-touch file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:text-sm file:font-medium"
          />
          <p className="mt-1 text-xs text-ink-500">
            Vertical, hasta {MAX_SECONDS} segundos y 8MB. MP4 o WebM — el .mov del iPhone no se
            ve en Android. Se reproduce solo, en loop y sin sonido.
          </p>
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          <Button type="submit" size="sm" variant="outline" className="mt-2" disabled={pending}>
            {pending ? "Subiendo…" : "Subir video"}
          </Button>
        </form>

        {currentUrl && (
          <form action={remove} className="mt-2">
            <Button type="submit" size="sm" variant="ghost">
              <Trash2 className="size-4 text-danger" aria-hidden />
              Quitar video
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

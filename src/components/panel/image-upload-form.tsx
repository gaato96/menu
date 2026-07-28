"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ImageUploadForm({
  currentUrl,
  action,
  aspect = "square",
}: {
  currentUrl: string | null;
  action: (formData: FormData) => Promise<{ ok?: true; error?: string } | undefined>;
  aspect?: "square" | "wide";
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await action(formData);
          if (result?.error) setError(result.error);
        });
      }}
      className="flex items-center gap-4"
    >
      <div
        className={
          aspect === "wide"
            ? "flex aspect-video w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
            : "flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
        }
      >
        {preview ? (
          <Image
            src={preview}
            alt=""
            width={aspect === "wide" ? 320 : 80}
            height={aspect === "wide" ? 180 : 80}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-ink-400">Sin foto</span>
        )}
      </div>

      <div className="flex-1">
        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className="block w-full text-sm text-ink-700 file:mr-3 file:min-h-touch file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:text-sm file:font-medium"
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        <Button type="submit" size="sm" variant="outline" className="mt-2" disabled={pending}>
          {pending ? "Subiendo…" : "Subir foto"}
        </Button>
      </div>
    </form>
  );
}

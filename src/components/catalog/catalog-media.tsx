"use client";

import { useEffect, useRef } from "react";

/**
 * The full-screen background of one slide: the looping clip if the product
 * has one, its photo otherwise.
 *
 * `active` is driven by the scroller, not by each video watching itself.
 * Playback is the expensive part — a phone decoding thirty clips at once
 * heats up, drains, and starts dropping frames — so exactly one plays at a
 * time and the rest are paused and rewound.
 *
 * `mounted` is a second, wider ring: only the slides adjacent to the active
 * one get a <video> element at all. Without it, opening a forty-product menu
 * would create forty media elements up front and start forty range requests.
 *
 * NEVER crops the subject, on purpose. A vertical 9:16 photo (what the AI
 * enhancer produces) fills the screen edge to edge either way. But most real
 * dish photos a business already has are landscape — a phone held sideways,
 * or a shot lifted straight off Instagram — and a hard `object-cover` on a
 * full-height slide was chopping the sides off the plate. The fix is the
 * technique every vertical-video app uses for non-native media: a blurred,
 * darkened copy of the SAME image fills the frame behind it (so there is no
 * empty bar), and the real photo or video sits on top scaled to fit whole.
 * Nothing about the dish is ever hidden, whatever ratio the business
 * uploaded.
 */
export function CatalogMedia({
  videoUrl,
  imageUrl,
  name,
  active,
  mounted,
}: {
  videoUrl: string | null;
  imageUrl: string | null;
  name: string;
  active: boolean;
  mounted: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (active) {
      // play() rejects on its own when autoplay is blocked or the element is
      // torn down mid-call. Neither is worth an unhandled rejection in the
      // console: the poster is already showing and that IS the fallback.
      void video.play().catch(() => {});
    } else {
      video.pause();
      // Back to the first frame, so a slide the customer scrolls back to
      // starts over instead of resuming half-eaten.
      video.currentTime = 0;
    }
  }, [active, mounted]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      {/* Backdrop: a static, blurred copy of the photo — cheap (no extra
          video decode) and visually close enough, since it only has to read
          as "more of this dish's colors", not move. A product with a video
          but no photo has nothing to blur, so it falls back to a plain dark
          fill instead of a stretched frame of the clip. */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-2xl"
        />
      ) : (
        <div className="absolute inset-0 bg-brand" />
      )}
      <div className="absolute inset-0 bg-black/25" />

      {videoUrl && mounted ? (
        <video
          ref={ref}
          src={videoUrl}
          poster={imageUrl ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 size-full object-contain"
        />
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 size-full object-contain" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <span className="font-display text-4xl font-extrabold text-brand-fg">{name}</span>
        </div>
      )}
    </div>
  );
}

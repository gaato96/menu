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

  if (videoUrl && mounted) {
    return (
      <video
        ref={ref}
        src={videoUrl}
        poster={imageUrl ?? undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
    );
  }

  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- full-viewport background, decorative
    return <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-brand p-8 text-center">
      <span className="font-display text-4xl font-extrabold text-brand-fg">{name}</span>
    </div>
  );
}

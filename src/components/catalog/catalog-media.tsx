"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Below this width/height ratio, a photo counts as "vertical enough" to fill
 * the screen edge to edge with a center crop instead of letterboxing. Set to
 * 0.75 — the ratio of 3:4, which is the DEFAULT photo mode on most phone
 * cameras even when held upright, not 16:9's 0.5625. A cutoff at the AI
 * enhancer's exact 9:16 output would still letterbox an ordinary vertical
 * phone photo, which defeats the point: any photo actually shot vertical
 * should go full bleed, whatever exact ratio the camera app used. Anything
 * wider than 3:4 (landscape, square) still falls back to contain — that
 * line is what keeps this from papering over a horizontal photo with a
 * crop nobody asked for.
 */
const FULL_BLEED_MAX_RATIO = 0.75;

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
 * Cover vs. contain is decided PER MEDIA ITEM, once its real dimensions are
 * known, not fixed in the markup. A genuinely vertical photo or clip (what
 * the AI enhancer produces, or any dish photo shot with the phone held
 * upright) gets object-cover: full bleed, the dramatic edge-to-edge look
 * this view exists for. A landscape or square one — a phone held sideways, a
 * shot lifted off Instagram — falls back to object-contain over a blurred
 * copy of itself, so nothing is cropped, but frankly, the honest answer for
 * this view is a vertical photo, not a clever crop of a horizontal one.
 * There is no CSS trick that fills the screen AND shows 100% of a horizontal
 * photo — those two goals are only both possible when the source already is
 * vertical.
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
  // null = not measured yet. Starts as "not full bleed" (see fitClass below)
  // so a landscape photo never flashes cropped before correcting itself —
  // the safe default is to show all of it.
  const [fullBleed, setFullBleed] = useState<boolean | null>(null);

  function applyRatio(width: number, height: number) {
    setFullBleed(width / height <= FULL_BLEED_MAX_RATIO);
  }

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

  // No effect resetting this on videoUrl/imageUrl changes: each slide is a
  // React-keyed instance of ONE product (see the `key={product.id}` in
  // catalog-scroll.tsx), so this component never gets reused for a
  // different dish in place — a fresh mount, and a fresh `fullBleed`, is
  // what a genuinely different product already gets for free.
  const fitClass = fullBleed ? "object-cover" : "object-contain";

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      {/* Backdrop: a static, blurred copy of the photo. Invisible once the
          foreground goes full-bleed (fully covered), so it costs nothing to
          always render — one less conditional, and it means the backdrop is
          already loaded and ready the instant a landscape photo is detected.
          A product with a video but no photo has nothing to blur, so it
          falls back to a plain dark fill instead of a stretched clip frame. */}
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
          // The DOM node is the same one `ref` points at, PLUS a check the
          // instant it mounts: preload="metadata" can already have the
          // dimensions ready by the time React attaches this — a video
          // whose metadata the browser cached from an earlier visit — and
          // onLoadedMetadata never fires again for something already
          // loaded. Without this a full-bleed video would get stuck showing
          // letterboxed forever on a warm cache.
          ref={(node) => {
            ref.current = node;
            if (node && node.readyState >= 1 && node.videoWidth > 0) {
              applyRatio(node.videoWidth, node.videoHeight);
            }
          }}
          src={videoUrl}
          poster={imageUrl ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => applyRatio(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
          className={`absolute inset-0 size-full ${fitClass}`}
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          // Same cache race as the video ref above: the backdrop blur layer
          // just above requests this exact URL first, so by the time this
          // element mounts the browser has very likely already finished
          // loading it — onLoad will never fire, and without this check
          // every cached photo would be stuck letterboxed.
          ref={(node) => {
            if (node && node.complete && node.naturalWidth > 0) {
              applyRatio(node.naturalWidth, node.naturalHeight);
            }
          }}
          onLoad={(e) => applyRatio(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
          className={`absolute inset-0 size-full ${fitClass}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
          <span className="font-display text-4xl font-extrabold text-brand-fg">{name}</span>
        </div>
      )}
    </div>
  );
}

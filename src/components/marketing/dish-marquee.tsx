import Image from "next/image";

export interface MarqueeDish {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Infinite horizontal band of real dishes pulled from the live demo menu —
 * not stock food photography. The whole pitch of the landing is "this is
 * running right now for a real local", so the imagery has to come from the
 * same database the demo menu reads.
 *
 * The list is rendered twice on purpose: the CSS animation translates the
 * track by exactly -50%, which lands on the start of the duplicate and makes
 * the loop seamless.
 */
export function DishMarquee({
  dishes,
  direction = "left",
  durationSeconds = 60,
  size = 176,
  priority = false,
  max = 8,
}: {
  dishes: MarqueeDish[];
  direction?: "left" | "right";
  durationSeconds?: number;
  size?: number;
  priority?: boolean;
  /** Tiles per loop before the list repeats. Caps the image payload. */
  max?: number;
}) {
  if (dishes.length === 0) return null;
  const shown = dishes.slice(0, max);
  const doubled = [...shown, ...shown];

  return (
    <div className="marquee overflow-hidden" aria-hidden>
      <div
        className="marquee-track gap-3"
        data-direction={direction}
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        {doubled.map((dish, index) => (
          <div
            key={`${dish.id}-${index}`}
            className="relative shrink-0 overflow-hidden rounded-card"
            style={{ width: size, height: size }}
          >
            <Image
              src={dish.imageUrl}
              alt=""
              width={size}
              height={size}
              sizes={`${size}px`}
              priority={priority && index < 4}
              // Never lazy: the track is translated by CSS, so tiles that
              // start off-screen horizontally would sit un-fetched behind an
              // IntersectionObserver that a transform does not re-trigger —
              // the marquee would scroll blank squares past the viewer. The
              // `max` cap above is what keeps the eager payload sane.
              loading="eager"
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

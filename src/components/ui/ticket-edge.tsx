/**
 * The torn bottom edge of a ticket, as a real SVG shape rather than a CSS
 * mask — deterministic, and safe on iOS where mask-composite support is
 * unreliable. `fill` is the colour of whatever sits BEHIND the card (usually
 * the page background), because the teeth work by matching that colour, the
 * same way a torn receipt shows the counter through the gaps.
 *
 * Sits flush under a card that has square bottom corners; the card's own
 * background should stop exactly where this begins.
 */
export function TicketEdge({
  fill,
  teeth = 12,
  className,
}: {
  fill: string;
  teeth?: number;
  className?: string;
}) {
  const toothWidth = 100 / teeth;
  const points = Array.from({ length: teeth }, (_, i) => {
    const x1 = i * toothWidth;
    const xMid = x1 + toothWidth / 2;
    const x2 = x1 + toothWidth;
    return `${x1.toFixed(3)},0 ${xMid.toFixed(3)},10 ${x2.toFixed(3)},0`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className={className}
      style={{ display: "block", width: "100%", height: "0.625rem" }}
      aria-hidden
    >
      <polygon points={`0,0 ${points} 100,0`} fill={fill} />
    </svg>
  );
}

/**
 * Generates the PWA icon set from an inline SVG so the artwork is versioned as
 * code rather than as binaries nobody can edit.
 *
 *   npm run icons
 *
 * The mark is a comanda ticket — the thing this product actually replaces. It
 * has to read at 48px on a home screen, so it is one solid silhouette and
 * nothing else.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const BRAND = "#D1420A";
const OUT_DIR = path.join(process.cwd(), "public", "icons");

interface MarkOptions {
  size: number;
  /**
   * Fraction of the canvas kept clear around the glyph. Android crops maskable
   * icons to a circle, so those need a bigger inset or the ticket loses its
   * corners.
   */
  inset: number;
  background: string | null;
  foreground: string;
  /** Notification badges are alpha-masked, so interior detail just fills in. */
  withLines: boolean;
}

function receiptPath(w: number, h: number) {
  const r = w * 0.12;
  const bodyH = h * 0.84;
  const toothH = h * 0.12;
  const teeth = 6;
  const toothW = w / teeth;

  const parts = [
    `M ${r} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${bodyH}`,
  ];

  // Torn bottom edge, walked right to left so the path closes on the left side.
  for (let i = teeth - 1; i >= 0; i -= 1) {
    parts.push(`L ${(i * toothW + toothW / 2).toFixed(2)} ${(bodyH + toothH).toFixed(2)}`);
    parts.push(`L ${(i * toothW).toFixed(2)} ${bodyH.toFixed(2)}`);
  }

  parts.push(`V ${r}`, `A ${r} ${r} 0 0 1 ${r} 0`, "Z");
  return parts.join(" ");
}

function markSvg({ size, inset, background, foreground, withLines }: MarkOptions) {
  const glyph = size * (1 - inset * 2);
  const offset = size * inset;
  const lineColor = background ?? BRAND;
  const lineX = glyph * 0.18;
  const lineW = glyph * 0.64;
  const lineH = glyph * 0.075;

  const lines = withLines
    ? [
        { y: glyph * 0.22, w: lineW },
        { y: glyph * 0.4, w: lineW * 0.72 },
        { y: glyph * 0.58, w: lineW * 0.45 },
      ]
        .map(
          (line) =>
            `<rect x="${lineX.toFixed(2)}" y="${line.y.toFixed(2)}" width="${line.w.toFixed(2)}" height="${lineH.toFixed(2)}" rx="${(lineH / 2).toFixed(2)}" fill="${lineColor}"/>`,
        )
        .join("\n    ")
    : "";

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${background ? `<rect width="${size}" height="${size}" rx="${(size * 0.22).toFixed(2)}" fill="${background}"/>` : ""}
  <g transform="translate(${offset.toFixed(2)} ${offset.toFixed(2)})">
    <path d="${receiptPath(glyph, glyph)}" fill="${foreground}"/>
    ${lines}
  </g>
</svg>`,
  );
}

async function render(file: string, options: MarkOptions, opaque = false) {
  let pipeline = sharp(markSvg(options));
  if (opaque) pipeline = pipeline.flatten({ background: BRAND });

  await writeFile(path.join(OUT_DIR, file), await pipeline.png().toBuffer());
  console.log(`  icons/${file} (${options.size}px)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const tile = { background: BRAND, foreground: "#FFFFFF", withLines: true } as const;

  await render("icon-192.png", { size: 192, inset: 0.24, ...tile });
  await render("icon-512.png", { size: 512, inset: 0.24, ...tile });

  // Maskable: same art, more breathing room for Android's circle crop.
  await render("icon-512-maskable.png", { size: 512, inset: 0.32, ...tile });

  // iOS discards transparency and shows the icon exactly as given.
  await render("apple-touch-icon.png", { size: 180, inset: 0.24, ...tile }, true);

  // Android notification badge: alpha-only silhouette, no interior detail.
  await render("badge-72.png", {
    size: 72,
    inset: 0.18,
    background: null,
    foreground: "#FFFFFF",
    withLines: false,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

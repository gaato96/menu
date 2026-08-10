/**
 * Calls the dish-photo enhancer against a real file and writes the result to
 * disk, without going through the panel.
 *
 * Exists because the first two versions of this feature shipped unverified —
 * the panel needs a login, a product and an applied migration just to see
 * whether one API call behaves. This needs a JPG.
 *
 *   npm run ai:foto -- fotos/pasta.jpg
 *
 * Writes <input>-mejorada.jpg next to the input. Costs one generation.
 *
 * The npm script passes --conditions=react-server: gemini.ts imports
 * `server-only`, which throws under plain Node and resolves to an empty
 * module under that condition. Running it with a bare `npx tsx` fails.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { config } from "dotenv";

config({ path: ".env.local" });

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Uso: npm run ai:foto -- <ruta-a-la-foto>");
    process.exit(1);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta GEMINI_API_KEY en .env.local");
    process.exit(1);
  }

  const extension = path.extname(inputPath).toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!mimeType) {
    console.error(`Formato no soportado: ${extension}. Usá JPG, PNG o WebP.`);
    process.exit(1);
  }

  // Imported here, after config() has populated process.env — the module
  // reads GEMINI_IMAGE_MODEL at load time.
  const { enhanceDishPhoto } = await import("../src/lib/ai/gemini");

  const bytes = await readFile(inputPath);
  console.log(`Enviando ${inputPath} (${(bytes.length / 1024).toFixed(0)} KB)…`);

  const started = Date.now();
  const result = await enhanceDishPhoto({ bytes, mimeType });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);

  if (!result.ok) {
    console.error(`Falló después de ${seconds}s: ${result.error}`);
    console.error("El detalle real está en el log de arriba, con el prefijo [gemini].");
    process.exit(1);
  }

  const outputPath = inputPath.replace(extension, `-mejorada${extension}`);
  await writeFile(outputPath, result.image.bytes);

  console.log(`Listo en ${seconds}s con ${result.image.model}`);
  console.log(`Costo registrado: US$${(result.image.costUsdMillis / 1000).toFixed(3)}`);
  console.log(`Prompt: ${result.image.promptVariant}`);
  console.log(`Guardada en ${outputPath}`);
  console.log("\nMirá las dos lado a lado: tiene que ser el MISMO plato, mejor fotografiado.");
}

main();

/**
 * Prompt for the dish-photo enhancer.
 *
 * v3 exists because v2 shipped broken: it opened with the product's name and
 * then injected the card description, so a pasta photo uploaded onto a
 * product called "Clásica — medallón de 150g, lechuga, tomate" came back as a
 * burger. The model was handed two competing sources of truth — the photo and
 * a text description of a different dish — and it followed the text.
 *
 * The fix is to remove the competition entirely. The prompt now describes a
 * retouching job and nothing else: it never says what the dish is, so there
 * is nothing for the model to invent from. Whatever is in the photo is the
 * subject, full stop. If the owner uploads the wrong photo, they get a
 * retouched wrong photo — visible and theirs to fix — instead of a plausible
 * dish the kitchen does not serve.
 *
 * Two supporting rules live in gemini.ts rather than here:
 *   - the image is sent BEFORE the text, so the subject is established first;
 *   - the request is image-to-image, never text-to-image.
 *
 * Versioned: PROMPT_VARIANT is stored on every ai_image_generations row, so a
 * later rewrite does not orphan images already sitting on live menus.
 */

export const PROMPT_VARIANT = "dish-enhance-v3";

export function buildDishEnhancePrompt(): string {
  return `Retocá esta fotografía para que se vea apetitosa en la carta de un restaurante.

REGLA PRINCIPAL: el sujeto es exactamente la comida que está en esta foto. No la reemplaces, no la reinterpretes, no la cambies por otro plato. Si no reconocés qué es, retocala igual sin adivinar: no inventes ingredientes para que "tenga sentido".

Esto es un retoque fotográfico, no una recreación. NO CAMBIES:
- Los ingredientes: los mismos, en la misma cantidad y en la misma posición.
- El emplatado, el plato o recipiente, la guarnición, las salsas.
- El punto de cocción, el tamaño de la porción, la forma y el color de la comida (más allá de una corrección de luz natural).
- No agregues nada que no esté en la foto. No saques nada que esté.

QUÉ SÍ MEJORAR:
- Iluminación cálida y suave, como luz de ventana lateral. Sacá las sombras duras y el tono amarillo o verdoso de la luz de cocina.
- Fondo: limpio y neutro, desenfocado. Sacá lo que distraiga (manos, servilletas usadas, botellas, celulares, marcas).
- Enfoque nítido sobre la comida, con profundidad de campo suave.
- Color y contraste naturales y frescos. Nada saturado ni artificial.
- Superficie de apoyo simple: madera, piedra o mantel liso en tono neutro.

ENCUADRE:
- Vertical 9:16, con el plato centrado y completo, sin que se corten los bordes.
- Dejá aire arriba y abajo: se ve a pantalla completa en un celular.

REALISMO FOTOGRÁFICO:
- Como si fuera tomada con una cámara réflex, lente 50mm, f/2.8, a la altura de la mesa o en ángulo de 45 grados.
- Conservá la textura real de la comida: los poros del pan, las irregularidades de la carne, el brillo húmedo de una salsa, los bordes desparejos. La comida real nunca es lisa ni perfecta.
- Dejá las imperfecciones creíbles que ya estén: una miga suelta, una gota en el borde del plato, un pliegue en el papel.
- Grano fotográfico sutil y natural.
- Sombras y reflejos coherentes con una sola fuente de luz.

EVITÁ TODO ESTO, que es lo que delata una imagen generada:
- Aspecto de render 3D, CGI, videojuego o ilustración digital.
- Brillo plástico, superficies demasiado lisas, comida que parece de cera.
- Colores sobresaturados o irreales, contraste exagerado, HDR.
- Simetría perfecta, ingredientes ordenados de forma imposible, elementos repetidos idénticos.
- Iluminación de estudio dramática, halos, resplandores.
- Vapor, chispas o salpicaduras congeladas en el aire.

El resultado tiene que ser indistinguible de una foto real. Sin texto, sin logos, sin marcas de agua, sin personas, sin manos.`;
}

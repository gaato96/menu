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

export const PROMPT_VARIANT = "dish-enhance-v4";

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
- El plato tiene que LLENAR el encuadre: que ocupe al menos dos tercios del ancho. Esta foto se ve a pantalla completa en un celular, así que una porción chica perdida en el medio de una mesa vacía no sirve. Acercate.
- Nada de grandes zonas vacías de mesa o de fondo.
- Conservá el ángulo de la foto original. Si es cenital, dejala cenital; si es de costado, dejala de costado. No la reencuadres desde otro punto de vista.

REALISMO FOTOGRÁFICO:
- Como si fuera tomada con una cámara réflex, lente 50mm, f/2.8.
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

/**
 * Prompt for turning one still dish photo into the looping clip the catalog
 * view plays. Not wired to a live API — Gemini's image endpoint above has no
 * video model, and Veo (Google's) is a different product with its own
 * pricing and quota story that hasn't been scoped yet. This exists to be
 * pasted by hand into an external image-to-video tool (Kling, Runway, Pika,
 * Luma Dream Machine, or Veo through Gemini/AI Studio) — see the "producto"
 * plan for turning that into a paid step of onboarding a new business.
 *
 * Same discipline as buildDishEnhancePrompt: the photo is the only source of
 * truth, so the prompt never names the dish and never invents motion that
 * isn't credible for real food sitting on a real table. The spec block at
 * the end (duration, no audio, format) exists because every one of those
 * tools asks for it in a separate field or the prompt itself, and copying it
 * wrong is the easiest way to end up with a clip video-upload-form.tsx
 * rejects (over VideoUploadForm's 12s / 8MB / no-.mov ceiling).
 */
export function buildDishVideoPrompt(): string {
  return `Animá esta fotografía de un plato para un video corto en loop, para el menú de un restaurante. La foto es la única fuente de verdad: no cambies el plato, los ingredientes, el emplatado ni el fondo. Es animación, no recreación.

QUÉ MOVER (elegí lo que tenga sentido para ESTE plato, no todo a la vez):
- Vapor subiendo despacio si el plato está caliente.
- Un brillo o reflejo que se mueve suave sobre una salsa o una bebida.
- Una hoja, un hilo de humo o un mantel que se mece apenas con el aire.
- Un empujón de cámara mínimo (dolly o zoom lentísimo) hacia el plato, como si alguien se acercara a mirarlo.

QUÉ NO HACER:
- No hagas que la comida se mueva, se sirva sola, levite o cambie de forma.
- No agregues manos, personas, cubiertos entrando en cuadro ni texto.
- Nada de movimiento brusco, cámara temblorosa ni cortes.
- El plato tiene que seguir ocupando la mayor parte del cuadro en todo momento — no lo dejes alejarse ni salir de foco.

ESTILO: igual de real que la foto original. Cero look 3D, cero efecto "IA" evidente, cero brillo plástico. La iluminación y el color se mantienen consistentes en todo el clip, sin parpadeo.

FICHA TÉCNICA (respetá esto en las opciones del generador, no solo en el texto):
- Vertical 9:16, plato centrado y completo, sin recortar los bordes.
- Duración: 4 a 8 segundos.
- Que cierre en loop: el primer y el último cuadro tienen que poder pegarse sin salto.
- Sin audio.
- Exportar en MP4 (H.264) — nunca .mov. Un .mov grabado en iPhone no se reproduce en la mayoría de los Android.`;
}

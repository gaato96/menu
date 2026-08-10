/**
 * Prompts for the dish-photo enhancer.
 *
 * The whole design problem here is one risk: the model happily "improves" a
 * milanesa into a different milanesa, with a garnish the kitchen does not
 * serve. That is not a cosmetic bug — the customer who ordered it complains,
 * and in a plaza this size the owner blames us. So the prompt spends most of
 * its words on what must NOT change, and the UI never swaps a photo without
 * the owner confirming side by side.
 *
 * Versioned: PROMPT_VARIANT is stored on every ai_image_generations row, so a
 * later rewrite does not orphan the images already sitting on live menus.
 */

export const PROMPT_VARIANT = "dish-enhance-v2";

/**
 * Built per dish so the model has a name to anchor on. Without it, a dark
 * phone photo of a burger is sometimes read as a sandwich and re-plated as
 * one; naming the dish keeps the interpretation pinned.
 */
export function buildDishEnhancePrompt(dishName: string, description?: string | null): string {
  const detail = description?.trim() ? `\nDescripción de la carta: "${description.trim()}"` : "";

  return `Retocá esta fotografía de un plato de comida llamado "${dishName}" para que se vea apetitosa en la carta digital de un restaurante.${detail}

El resultado tiene que ser INDISTINGUIBLE de una fotografía real tomada por un fotógrafo gastronómico. No una ilustración, no un render, no una imagen generada. Si alguien la mira y sospecha que la hizo una IA, está mal.

NO CAMBIES EL PLATO. Esto es una corrección fotográfica, no una recreación:
- Los mismos ingredientes, en la misma cantidad y en la misma posición.
- El mismo emplatado, el mismo plato o recipiente, la misma guarnición.
- No agregues ingredientes, decoración, hierbas, salsas ni acompañamientos que no estén en la foto original.
- No saques nada de lo que está en la foto.
- No cambies el punto de cocción, el tamaño de la porción ni el color de la comida más allá de una corrección de luz natural.

QUÉ SÍ MEJORAR:
- Iluminación cálida y suave, como luz de ventana lateral. Sacá las sombras duras y el tono amarillo o verdoso de la luz de cocina.
- Fondo: limpio y neutro, desenfocado. Sacá elementos que distraigan (manos, servilletas usadas, botellas, celulares, marcas).
- Enfoque nítido sobre la comida, con profundidad de campo suave.
- Color y contraste naturales y frescos. Nada saturado ni artificial.
- Superficie de apoyo simple: madera, piedra o mantel liso en tono neutro.

ENCUADRE:
- Vertical 9:16, con el plato centrado y completo, sin que se corten los bordes.
- Dejá aire arriba y abajo: la foto se ve a pantalla completa en un celular.

REALISMO FOTOGRÁFICO (esto es lo más importante):
- Como si fuera tomada con una cámara réflex, lente 50mm, diafragma f/2.8, a la altura de la mesa o en ángulo de 45 grados.
- Conservá la textura real de la comida: los poros del pan, las irregularidades de la carne, el brillo húmedo de una salsa, los bordes desparejos. La comida real nunca es lisa ni perfecta.
- Dejá las imperfecciones creíbles que ya estén en la foto: una miga suelta, una gota de salsa en el borde del plato, un pliegue en el papel. Son las que hacen que se lea como real.
- Grano fotográfico sutil y natural. Nada de superficies plásticas ni pulidas.
- Sombras y reflejos físicamente coherentes con una sola fuente de luz.

EVITÁ TODO ESTO, que es lo que delata una imagen generada:
- Aspecto de render 3D, CGI, videojuego o ilustración digital.
- Brillo plástico, superficies demasiado lisas, comida que parece de cera o de juguete.
- Colores sobresaturados o irreales, contraste exagerado, HDR.
- Simetría perfecta, ingredientes ordenados de forma imposible, gotas o semillas repetidas de forma idéntica.
- Iluminación de estudio dramática o irreal, halos, resplandores.
- Vapor, chispas, salpicaduras congeladas en el aire o cualquier efecto de publicidad.
- Fondos que no existirían en un local real.

Sin texto, sin logos, sin marcas de agua, sin personas, sin manos.`;
}

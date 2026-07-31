export const manualDeMarca = `# VivoMenu — Manual de marca

**Fecha:** 2026-07-30 · **Versión:** v1
**Contexto base:** \`marketing/nombres-y-marca.md\` v4 (nombre y logo elegidos) · \`.agents/product-marketing.md\` v2 (voz de marca) · \`src/app/globals.css\` (tokens reales ya en producción) · \`marketing/guia-produccion.md\` v2 (plantilla de carrusel)
**Por qué existe este documento:** hasta ahora la identidad visual vivía repartida entre el código (\`globals.css\`), la guía de producción de contenido y el documento de naming. Este manual la junta en un solo lugar, pensado para generar imágenes y contenido nuevo sin tener que releer el código cada vez.

---

## 0. La idea de una sola línea

> **VivoMenu es el ticket de mostrador, no el dashboard de SaaS.**

Todo lo que sigue — la paleta, la tipografía, el motivo del borde dentado, hasta el nombre — sale de un solo objeto real: la comanda de papel que un mostrador arranca y le entrega a cocina. No de una estética genérica de ícono de app. Cuando una decisión de diseño no esté en este documento, la pregunta que la resuelve es: **¿esto se parece más a un ticket de cocina o a un dashboard de oficina?** Gana el ticket, siempre.

---

## 1. Logo

### 1.1 — El archivo

\`public/VivoMenu.png\` — 1254×1254px, fondo transparente. Círculo verde botella sólido con un ticket color crema centrado: cuatro líneas de "texto" (una en naranja ember, resto en tinta oscura), borde dentado arriba (el corte de guillotina) y una muesca curva abajo (el desgarro).

Es un **isotipo** (funciona solo, sin el nombre al lado) — así está pensado para favicon, ícono de PWA, foto de perfil de Instagram y foto de perfil de WhatsApp Business.

### 1.2 — Variantes que ya existen

| Archivo | Uso | Fondo |
|---|---|---|
| \`public/VivoMenu.png\` | Isotipo principal, cualquier superficie | Transparente |
| \`public/icons/icon-192.png\` / \`icon-512.png\` | Ícono de PWA, "any" | Transparente |
| \`public/icons/icon-512-maskable.png\` | Ícono de PWA, "maskable" (Android recorta a círculo/squircle) | Verde \`#1F4A38\` a sangre completa, logo dentro de la zona segura (80%) |
| \`public/icons/apple-touch-icon.png\` | Ícono de iOS | Verde \`#1F4A38\` a sangre completa (iOS no soporta transparencia) |
| \`public/icons/badge-72.png\` | Badge de notificación Android | Silueta blanca sobre transparente (el sistema lo tiñe) |
| \`src/app/favicon.ico\` | Favicon del navegador | Multi-resolución (16/32/48px) |

### 1.3 — Cómo se usa con el nombre (lockup)

En el header y footer del sitio, el logo va **a la izquierda del texto**, en una sola línea, con un espacio pequeño entre ícono y wordmark (ver \`src/app/(marketing)/layout.tsx\`):

\`\`\`
[isotipo 24-28px]  VivoMenu
\`\`\`

- El wordmark se escribe **siempre junto, una sola palabra, con V y M mayúsculas**: \`VivoMenu\`. Nunca "Vivo Menu" separado, nunca "vivomenu" todo minúscula en texto corrido (sí es correcto en handles/dominios, donde las mayúsculas no existen: \`@vivomenu\`, \`vivomenu.com.ar\`).
- El wordmark usa la tipografía display (§3), nunca una fuente distinta a la del resto del sitio.

### 1.4 — Zona de seguridad y tamaño mínimo

- Dejar alrededor del isotipo un margen libre de al menos **el 15% de su propio diámetro** — nada de texto, bordes ni otros elementos pisando esa zona.
- Tamaño mínimo legible: **24px** en pantalla (favicon, badge). Por debajo de eso el ticket interior deja de leerse y el círculo se vuelve un punto de color — en esos tamaños extremos (16px) es aceptable que sea solo el punto de color, sin pretender que se lea el detalle.

### 1.5 — Fondos

El isotipo funciona sin ajustes sobre:
- **Crema** \`#F1EBDD\` (fondo principal del sitio) — el círculo verde contrasta bien.
- **Negro/noche** \`#100E0C\` a \`#221B15\` (hero oscuro de la landing) — el verde y el crema se leen sobre fondo oscuro sin problema.
- **Blanco puro** — funciona, pero preferir crema cuando se pueda elegir, porque es el blanco real de la marca.

**No usar** el isotipo sobre:
- Fotos de platos de comida directamente (compite con el plato) — si hace falta superponerlo a una foto, usar siempre un tile sólido (crema o verde) detrás, nunca flotando sobre la imagen sin fondo propio.
- Fondos de un verde o crema muy cercano al de la marca (el círculo desaparece).

### 1.6 — Qué no hacer con el logo

- No recolorearlo. El verde \`#1F4A38\` y el crema \`#F1EBDD\` son fijos — no hay versión "azul" o "roja" del isotipo.
- No separar el ticket del círculo, no rotarlo, no aplicarle sombra pesada ni bisel 3D.
- No estirarlo de forma no proporcional (siempre 1:1, círculo).
- No agregarle el eslogan ni texto extra adentro del círculo — el isotipo es solo el ticket.
- No usar la versión con fondo blanco (\`brand-assets/VivoMenu-original-with-white-bg.png\`) en ninguna pieza nueva — esa es solo el archivo crudo, quedó guardado por las dudas, no es para producción.

---

## 2. Color

### 2.1 — Paleta de marca (la que ve el cliente)

| Token | Hex | Uso |
|---|---|---|
| **Verde botella** (\`--color-brand\`) | \`#1F4A38\` | Color primario de marca. Fondo del isotipo, acentos de marca, estado "en camino"/éxito en el producto |
| **Crema** (\`--color-ink-50\`) | \`#F1EBDD\` | Fondo base de todo el sitio y del panel — el "papel" |
| **Tinta** (\`--color-ink-900\`) | \`#241B14\` | Texto principal — nunca negro puro |
| **Ember** (\`--color-ember\`) | \`#F0A04B\` | Acento cálido — **solo sobre fondos oscuros** (falla contraste sobre crema) |
| **Ember-tinta** (\`--color-ember-ink\`) | \`#8A3D0C\` | La misma calidez del ember, quemada hasta cumplir contraste 4.5:1 como texto chico sobre crema |

**Regla dura:** el ember es de uso arquitectónico, no decorativo — un acento por pieza, nunca el color dominante. Es el color del fuego de la plancha en la escena nocturna del hero; en cualquier otro lado se usa con la misma moderación con la que se usaría una brasa real.

### 2.2 — Escala neutra (kraft paper, no gris de oficina)

Marrón-grisáceo cálido, nunca gris frío ni rosado. De más oscuro a más claro:

| Token | Hex |
|---|---|
| \`--color-ink-950\` | \`#1C1611\` |
| \`--color-ink-900\` | \`#241B14\` |
| \`--color-ink-700\` | \`#4A3C2F\` |
| \`--color-ink-500\` | \`#6B5D4F\` |
| \`--color-ink-300\` | \`#B8A98F\` |
| \`--color-ink-200\` | \`#DED2BD\` |
| \`--color-ink-100\` | \`#ECE3D1\` |
| \`--color-ink-50\` | \`#F1EBDD\` |

### 2.3 — Paleta "noche" (solo para el hero de la landing y piezas con mood oscuro)

Escena de "un viernes a las 21:30 en la cocina" — el contraste con la parte clara del sitio es el argumento visual, no un tema oscuro genérico:

| Token | Hex |
|---|---|
| \`--color-night-950\` | \`#100E0C\` |
| \`--color-night-900\` | \`#17130F\` |
| \`--color-night-800\` | \`#221B15\` |
| \`--color-night-700\` | \`#322820\` |

En este fondo, el ember (\`#F0A04B\`) es el único color cálido — luz de plancha en un cuarto oscuro. El verde de marca también funciona ahí (ver \`--color-brand-soft\`/\`ember-glow\` en \`globals.css\`).

### 2.4 — Colores de estado (producto, no marca — usar solo en UI del sistema, nunca en marketing/redes)

Estos existen para el tablero de comandas, no para contenido de marca. Se listan acá para que una pieza de producto (screenshot del tablero, por ejemplo) se genere con los colores reales:

| Estado | Color | Hex |
|---|---|---|
| Nuevo/pendiente | Ámbar oscuro | \`#93650A\` |
| Confirmado | Azul (el único frío del sistema, a propósito) | \`#2A5C8A\` |
| En cocina | Rojo-naranja caliente | \`#B33607\` |
| En camino | Verde de marca | \`#1F4A38\` |
| Entregado | Neutro apagado | \`#6B5D4F\` |
| Cancelado | Bordó apagado | \`#8C2F3C\` |

### 2.5 — Contraste

- Tinta (\`#241B14\`) sobre crema (\`#F1EBDD\`): AAA.
- Ember (\`#F0A04B\`) sobre crema: **falla contraste** — nunca usarlo como texto sobre fondo claro. Usar \`ember-ink\` (\`#8A3D0C\`) en su lugar.
- Blanco sobre verde de marca o sobre cualquier tono "noche": AA o mejor.

---

## 3. Tipografía

| Rol | Fuente | Cuándo se usa |
|---|---|---|
| **Display** | Big Shoulders (variable, eje óptico activado) | Titulares, momentos de "cartel de mostrador" — nunca para texto de lectura larga. Condensada y dramática a tamaño grande |
| **Cuerpo** | Schibsted Grotesk | Todo lo que se lee de corrido: párrafos, botones, labels |
| **Mono** | IBM Plex Mono (peso 500-600) | Solo números que se comportan como dato de ticket: precios, códigos de pedido, cantidades, horarios. Nunca para texto normal |

**Regla de jerarquía:** el display se usa con moderación — es la fuente que grita, y si grita todo el tiempo deja de puntuar nada. Un titular por sección, no un display en cada línea.

En Canva/Figma cuando no se tiene acceso a Big Shoulders exacta: **Anton** o **Bebas Neue** como sustitutos (mismo espíritu condensado). Para el cuerpo, **Poppins** como alternativa a Schibsted Grotesk.

---

## 4. Motivos visuales de marca (lo que hace que algo "se vea VivoMenu")

Estos son los elementos que, repetidos, construyen reconocimiento — más importantes que cualquier color suelto.

### 4.1 — El borde dentado (ticket-edge)

El corte de tijera/guillotina de un ticket real, como forma vectorial (no como textura ni foto). Se reserva **para lo que literalmente es un recibo**: la tarjeta de confirmación de pedido, una comanda en el tablero, el propio isotipo. No usarlo como decoración suelta en cualquier tarjeta — si se usa en todos lados deja de significar "esto es un ticket" y pasa a ser papel tapiz.

### 4.2 — Grano de película (grain)

Textura de ruido muy sutil (opacidad ~0.28, blend "overlay") sobre las secciones oscuras del hero. Da sensación de "cuarto real, cámara real" en vez de gradiente digital limpio. Solo en fondo oscuro/noche.

### 4.3 — Grilla de puntos (dot-grid)

Patrón de puntos tenues que se desvanece hacia los bordes — la trama de una hoja de etiquetas de precio, no una grilla de blueprint de dev-tool. Se usa detrás de secciones de contenido en el lado claro del sitio, nunca como fondo de pantalla completa sin desvanecer.

### 4.4 — Resplandor de brasa (ember-glow)

Dos manchas de luz radial (naranja ember + verde marca) sobre el fondo negro del hero — simula la luz de una plancha encendida en un cuarto oscuro. Es el único momento donde el ember domina una composición.

### 4.5 — Fotografía de platos en movimiento (dish marquee)

Dos cintas de fotos de platos reales corriendo en direcciones opuestas, como backdrop del hero. El contenido real del producto (fotos de comida de verdad, no stock genérico) es el material visual, no una ilustración.

### 4.6 — Principio de movimiento

Todo lo animado en el sitio sigue el mismo lenguaje: **aparece con un fade + leve desplazamiento hacia arriba, una sola vez, al entrar en pantalla** (\`Rise\`, \`WordReveal\`) — nunca loops decorativos ni movimiento que llame la atención sin motivo. La única animación insistente a propósito es la alerta de pedido nuevo en el tablero (pulso), porque ese es literalmente el producto avisando que pasó algo. Fuera de eso: sutil, una vez, con propósito.

---

## 5. Voz y tono (resumen — detalle completo en \`.agents/product-marketing.md\` §10-11)

- **Tratamiento:** vos, siempre. Nunca "usted" ni plural corporativo.
- **Tono:** directo, de mostrador. Frases cortas. Preguntas que interpelan el dolor antes de nombrar el producto.
- **Palabras sí:** comanda, tablero, mostrador, cocina, mesa, carta, hora pico, prolijo, de un toque, te lo dejo andando, se te queda toda la plata, sin comisión.
- **Palabras no:** solución integral, transformación digital, optimizar procesos, ecosistema, omnicanal, onboarding, SaaS, dashboard, KPI. Si suena a agencia, está mal escrito.
- **Cero signos de admiración.**
- **CTA:** acción concreta y de bajo riesgo — "Mirá un menú real", "Mandame un WhatsApp". Nunca "contactanos".

---

## 6. Fotografía e imágenes de producto

- **Fotos de platos:** siempre reales, nunca generadas por IA cuando se trata de mostrar comida de un cliente real — un plato que no existe rompe la confianza del rubro más rápido que cualquier otra cosa (regla ya establecida en \`product-marketing.md\`: no prometer lo que no existe).
- **Screenshots del tablero/producto:** capturas reales de la app, nunca mockups genéricos de "dashboard de stock photo" — usar los colores de estado reales (§2.4).
- **Estilo de iluminación cuando se genera algo con IA** (fondos, texturas, elementos gráficos que no son el producto en sí): luz cálida de mostrador/cocina, nunca luz fría de oficina o de laboratorio.

---

## 7. Prompts de generación de imágenes con IA

Base para Ideogram 3.0 (mejor manejo de texto), Gemini/Nano Banana, Midjourney o Flux. Todos comparten esta introducción de marca — pegarla siempre antes de la instrucción específica de la pieza:

### 7.1 — Bloque de marca (pegar siempre primero)

\`\`\`
Brand: VivoMenu, a digital menu and order-management system for small
independent restaurants in Argentina — NOT a corporate SaaS brand, NOT
a delivery-platform brand, NOT a phone/telecom brand.

Color palette (use exactly these, no substitutions): deep bottle green
#1F4A38 (primary), warm cream #F1EBDD (paper/background), dark ink
brown #241B14 (text/linework), warm ember orange #F0A04B (accent —
dark backgrounds only, use sparingly, one element per piece).

Visual world: the deli price tag and the register receipt, not the
SaaS dashboard. Warm, kraft-paper, hand-stamped, a little bit
handmade — trustworthy like a well-run neighborhood counter, never
slick or "startup."

Typography feel (if text appears): bold condensed display type in the
spirit of Anton/Bebas Neue for headlines, a warm grotesque (Schibsted
Grotesk/Poppins) for anything read as body text, monospace only for
numbers that read like receipt data (prices, codes, quantities).

Avoid: generic SaaS gradients, cold blue corporate tones, glossy 3D
app-icon rendering, stock-photo "diverse team in an office" imagery,
fintech aesthetics, QR-code motifs as decoration, delivery-scooter
icons, any phone/telecom-brand visual language.
\`\`\`

### 7.2 — Logo (ver detalle completo y variantes en \`nombres-y-marca.md\` §5)

Ya resuelto — usar el archivo existente (\`public/VivoMenu.png\`). Solo volver al prompt de esa sección si hace falta una variante nueva (por ejemplo, una versión animada o un sello/stamp derivado).

### 7.3 — Fondo/textura para carrusel de Instagram (portada)

\`\`\`
[Bloque de marca §7.1]

A flat, minimal background texture for an Instagram carousel cover
slide: solid bottle green #1F4A38 field with a very subtle warm paper
grain, no gradients, no photographic elements. Leave the center 70%
of the frame empty/uncluttered for large bold text to be added
afterward in Canva. Square or 4:5 portrait, 1080x1350px.
\`\`\`

### 7.4 — Escena de "hora pico" (para hero, anuncios, contenido de valor)

\`\`\`
[Bloque de marca §7.1]

A warm, slightly cinematic photograph-style illustration of a small
restaurant counter at night, Friday dinner rush: a phone lit up with
messages, a paper order ticket, hands working fast. Warm ember-orange
kitchen light against a dark background, subtle film grain, no visible
faces (privacy/generic), no text overlays. Documentary, not glossy —
like a real photo taken at a real counter, not a stock-photo set.
\`\`\`

### 7.5 — Ícono/pictograma de apoyo (para listas, puntos de un carrusel)

\`\`\`
[Bloque de marca §7.1]

A single small flat icon, geometric, bold, high-contrast, matching
the style of the VivoMenu logo (torn-edge order ticket, thick rounded
linework, no gradients, no 3D). Subject: [describe el objeto —
ej. "a WhatsApp speech bubble", "a QR code on a table tent", "a stack
of coins"]. Cream background #F1EBDD, ink-brown linework #241B14, one
ember #F0A04B accent detail maximum. Square canvas, generous padding,
legible at 64px.
\`\`\`

### 7.6 — Reglas que valen para cualquier prompt nuevo

- Pegar siempre el bloque de marca (§7.1) primero.
- Un acento ember por pieza, nunca más.
- Nunca pedir una cara humana genérica generada por IA como protagonista — o es una foto real del cliente (con permiso), o no hay cara.
- Nunca pedir "modern", "sleek", "futuristic" ni sinónimos — son exactamente las palabras que producen la estética de SaaS genérico que la marca evita a propósito.

---

## 8. Aplicación — cómo se ve todo junto

| Superficie | Fondo | Elementos activos |
|---|---|---|
| Sitio público (marketing) | Crema de día, noche en el hero | Dot-grid, marquee de platos, ember-glow (solo hero) |
| Panel del sistema (producto) | Crema, siempre claro | Colores de estado, sin grano ni dot-grid — legibilidad ante todo, cero atmósfera |
| Redes sociales / carruseles | Verde marca (portada/cierre), crema (contenido) | Tipografía grande, un dato en ember, sin fotos de stock |
| Ícono/PWA | Verde marca a sangre completa (maskable) | Solo el isotipo, sin wordmark |

**La regla que conecta todo:** el panel (lo que usa el dueño del local todos los días) es deliberadamente plano y sin atmósfera — es software de mostrador leído de un vistazo bajo luz de cocina, y ahí la legibilidad gana siempre. La atmósfera (grano, brasa, noche) vive solo en las piezas que tienen que seducir: la landing y el contenido de redes. Mezclar los dos mundos es el error más fácil de cometer — no usar grano ni glow en una captura de producto, no dejar el panel plano y aburrido en una pieza de marketing.

---

## Changelog
- v1 (2026-07-30) — Documento inicial. Reúne en un solo lugar los tokens reales de \`globals.css\`, el logo y sus variantes de \`nombres-y-marca.md\` v4, la voz de marca de \`product-marketing.md\`, y agrega una sección nueva de prompts de generación de imágenes reutilizables para contenido futuro.
`;

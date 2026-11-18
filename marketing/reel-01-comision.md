# Reel 01 — "La comisión que no ves"

**Fecha:** 2026-08-13 · actualizado el mismo día: guion pasado a bloque único (límite de créditos de ElevenLabs free) y sacado todo momento estático o de silencio del video
**Pilar:** 1.3 — La cuenta simple (`plan-contenido.md`)
**Origen:** repurposing del carrusel "¿Cuánto te está costando la comisión de delivery?"
**Duración estimada:** ~46-50 segundos de audio, 6 tramos de video que se ajustan al audio real (ver nota de timing en §1)
**Formato:** 1080×1920, 30fps, vertical
**Regla que atraviesa todo el documento:** en ningún momento del video hay silencio ni algo quieto — ni en el audio, ni en la imagen, ni en el texto en pantalla. Si una sección de este documento en algún momento sugiere lo contrario, gana esta regla.

---

## 0. Cómo se usa este documento

| Parte | Para qué | Para quién |
|---|---|---|
| §1 | Un solo bloque de texto para pegar entero en ElevenLabs, en una sola generación | Gastón |
| §2 | Copiar y pegar en Google Veo, un prompt por clip | Gastón |
| §3 | Motion graphics y subtítulos — lo único que el editor no encuentra en el manual de marca | El editor |
| §4–5 | Publicación y qué mirar después | Gastón |

**El editor recibe:** los 6 clips generados, el audio único de ElevenLabs, la captura real del tablero (§3.4), `public/VivoMenu.png`, `manual-de-marca.md` completo, y §3 de este documento. Para todo lo que no está en §3 —colores, tipografía, principio de movimiento, tono, qué palabras no usar— rige el manual de marca sin excepción.

---

## 1. Guion — un solo bloque para ElevenLabs

**Generalo una sola vez, con todo el texto de abajo pegado entero.** Nada de generar por secciones — así no se gastan créditos de más si algo sale mal a mitad de camino, y de paso el ritmo de la voz queda continuo en vez de tener seis arranques y frenados distintos.

Elegí una voz argentina de ritmo natural, ni lenta ni de locutor pausado — cuanto más rápido y directo hable, mejor cierra con un video que no puede tener ningún hueco de silencio. Si ElevenLabs te deja tocar la configuración de "stability" o "estilo", bajala un poco para que suene más suelta y menos robótica, no de lectura.

```
De cada diez mil pesos que vendés, dos mil quinientos ya no son tuyos. Se los lleva la comisión de la app de delivery, pedido tras pedido, todos los días del año, sin descanso. Vos ponés la cocina, el local, la gente y las horas. Ellos se quedan con una parte antes de que la plata te toque la caja. Multiplicá eso por un año entero, porque el número duele. Dos mil quinientos pesos por cada pedido de diez mil. Veinte pedidos a la semana ya son cincuenta mil pesos que se van. Al mes, doscientos mil. Al año, dos millones cuatrocientos mil pesos que nunca fueron tuyos. Con VivoMenu tu cliente pide directo desde tu propia carta digital, sin ningún intermediario en el medio. El pedido te cae al instante en el tablero, y no hay comisión: esos dos millones cuatrocientos mil se quedan en tu local, no en un servidor ajeno. Mirá un menú real armado con VivoMenu en vivomenu punto com punto ar.
```

*Sobre los números: se leen solos, en pesos, ElevenLabs los interpreta bien sin necesidad de escribirlos como cifra.*

### Por qué este guion y no el anterior

La primera versión explicaba bien pero no generaba ganas de nada — leía una cuenta en voz alta, no vendía. Esta version tensiona más y remata distinto:

- **Gancho:** arranca con la pérdida, no con una venta — "dos mil quinientos ya no son tuyos" nombra lo que se perdió, no lo que sobra. Es una frase que se puede repetir sola, sin contexto, y sigue pegando.
- **Problema:** "pedido tras pedido, todos los días del año, sin descanso" — el ritmo de la frase (tres golpes cortos seguidos) imita la sensación de que no para nunca, que es justo el punto.
- **Desarrollo con orden de urgencia:** "multiplicá eso por un año entero, porque el número duele" reemplaza a la promesa tibia de antes ("te va a sorprender") por una instrucción directa — le da al espectador algo para *hacer* mientras mira (multiplicar en su cabeza), no solo algo para escuchar.
- **Solución con una imagen, no solo un dato:** "se quedan en tu local, no en un servidor ajeno" — contrasta un lugar concreto y propio (tu local) contra uno abstracto y lejano (un servidor ajeno). Es la clase de contraste que se queda, en vez de otro número más en una lista de números.
- **CTA on-brand y de bajo riesgo:** "Mirá un menú real" es, literal, el ejemplo de CTA que ya define `manual-de-marca.md` §5 — no lo inventé para este video, es la voz que la marca ya usa en todos lados. Apunta únicamente a `vivomenu.com.ar`, porque es lo único que existe hoy: no hay número de WhatsApp de VivoMenu todavía (Gastón está contactando desde su número personal mientras tanto), así que el reel no puede prometer un canal que no está armado. El día que exista el número, este CTA se actualiza — no antes.

### Cómo sincronizar el video con este audio

**No le pidas al editor que corte en los segundos exactos de una tabla.** La duración real de cada frase depende de la voz que elijas en ElevenLabs, y no hay forma de calcularla de antemano con precisión. Lo que sí se puede fijar es el **orden** y qué frase le corresponde a qué clip — el editor escucha el audio ya generado, marca dónde termina cada tramo, y corta el video ahí. Esta es la referencia de qué tramo de texto va con cada clip:

| Clip | Tramo del audio (por su contenido, no por segundo) |
|---|---|
| 1 — Gancho | "De cada diez mil pesos que vendés... comisión de la app de delivery, pedido tras pedido, todos los días del año, sin descanso" |
| 2 — Problema | "Vos ponés la cocina... antes de que la plata te toque la caja" |
| 3 — Promesa | "Multiplicá eso por un año entero, porque el número duele" |
| 4 — Desarrollo | "Dos mil quinientos pesos por cada pedido... nunca fueron tuyos" |
| 5 — Solución | "Con VivoMenu tu cliente pide directo... no en un servidor ajeno" |
| 6 — CTA | "Mirá un menú real armado con VivoMenu en vivomenu punto com punto ar" |

Si un tramo de audio queda más largo que el clip generado en Veo, el clip no se congela para estirarlo — todos los prompts de §2 ya tienen movimiento de cámara continuo (paneo o acercamiento lento), así que estirar el clip un par de segundos de más sigue teniendo movimiento real, no un freeze-frame. Si hace falta más margen, generar ese clip puntual con una duración mayor (8s o 10s en vez de 6s, por ejemplo) es mejor que congelarlo.

---

## 2. Prompts — para copiar y pegar en Google Veo

Cada prompt es una instrucción completa y autosuficiente — no hace falta agregar nada antes ni después. Van en inglés porque Veo rinde mejor así. Cada uno ya incluye qué evitar, escrito adentro del propio prompt en lenguaje natural — Veo no tiene un campo separado de "negativo" como otros generadores, así que la restricción tiene que ir en la misma instrucción o el modelo la ignora.

**Clip 1 — Gancho · 4 segundos**
```
Vertical 9:16, photorealistic cinematic shot. Interior of a small
family-run burger joint in Argentina, shot from behind the service
counter looking toward the front door. A delivery courier in a plain
bright jacket lifts a brown paper takeaway bag off the counter and turns
away toward the door, staying back-to-camera the entire time — never show
his face. Handheld with slight natural shake, 35mm lens, shallow depth of
field: the paper bag stays sharp while the courier softens as he turns
away. Warm tungsten light over the counter, cooler daylight spilling in
from the open door behind him. Warm filmic color grade, subtle film
grain. Do not render any text, numbers, signage, logos, or screens
anywhere in the shot — the frame should be entirely clean of typography.
4 seconds, no dialogue, ambient restaurant sound only.
```

**Clip 2 — Problema · 8 segundos**
```
Vertical 9:16, photorealistic cinematic shot. A small restaurant just
after closing, lights half off. Close-up on the hands of a restaurant
owner at the counter, slowly sorting a thick stack of paper order
tickets, a mug of coffee beside them. Keep the owner's face out of frame
for the whole shot. Very slow push-in, 50mm lens, shallow depth of
field. A single warm practical lamp overhead, deep shadows, quiet and
moody mood. Warm filmic color grade, subtle film grain. Do not render
any readable text, numbers, or logos on the tickets or anywhere in
frame — the paper should read as blank or illegibly textured, not as
real typography. 8 seconds, no dialogue, quiet ambient room tone only.
```

**Clip 3 — Promesa · 6 segundos**
```
Vertical 9:16, photorealistic cinematic shot. A pen resting on a small
blank paper notepad on a worn wooden restaurant table, next to a coffee
cup, morning light coming through a window. A hand enters frame from the
right and picks up the pen, calm and unhurried. Locked-off camera, 50mm
lens, shallow depth of field. Soft warm morning daylight, gentle
highlights on the wood grain. Warm filmic color grade. The notepad must
stay completely blank — do not render any writing, printed text, or
numbers on it. 6 seconds, no dialogue, soft ambient morning sound only.
```

**Clip 4 — Desarrollo · 10 segundos**
```
Vertical 9:16, photorealistic cinematic shot. Extreme close-up of a
thermal receipt printer on a restaurant counter, a long paper tape
curling out of it and piling up on the surface below. Very slow push-in
as the tape keeps feeding and the pile grows. Macro framing, 85mm lens,
very shallow depth of field so the printed characters on the tape stay
completely out of focus and illegible — do not render any sharp or
readable text, numbers, logos, or barcodes anywhere in the shot, the tape
should look like an unreadable blur of ink. Warm counter lighting with a
hard rim light along the paper's edge, dark background. Warm filmic
color grade, subtle film grain. 10 seconds, no dialogue, soft mechanical
printer sound only.
```

**Clip 5 — Solución · 10 segundos**
```
Vertical 9:16, photorealistic cinematic shot. The pass of a busy small
restaurant kitchen during dinner service. Hands of cooks plating burgers
and fries and sliding the plates onto the pass shelf, steam rising,
quick confident movement. Camera tracks slowly to the left along the
pass. 35mm lens, shallow depth of field, keep every face out of sharp
focus or out of frame — no clear faces. Warm overhead kitchen light plus
the orange glow of a flat-top grill from the left side. Energetic,
warm filmic color grade, subtle film grain. Do not render any text,
numbers, order tickets, screens, or logos anywhere in the shot. 10
seconds, no dialogue, energetic kitchen ambient sound only.
```

**Clip 6 — CTA · 6 segundos**
```
Vertical 9:16, photorealistic cinematic shot. Exterior of a small
neighbourhood restaurant at dusk, seen from across a quiet empty street.
Warm light glowing out from inside, a few silhouetted customers seated
at tables, empty sidewalk in the foreground. Static locked-off camera
with a very slow push-in, 35mm lens. Deep blue dusk sky above, contrasted
against warm interior tungsten light. Warm filmic color grade, subtle
film grain. Keep the upper third of the frame as clean empty sky with no
detail, clouds, or objects — that space needs to stay empty for a graphic
to be placed there later. Do not render any text, signage, or logos
anywhere in the shot. 6 seconds, no dialogue, quiet street ambient sound
only.
```

---

## 3. Motion graphics — brief para el editor

Todo lo que no está escrito acá —paleta, tipografía, principio de movimiento general de la marca, tono, qué palabras no usar— está en `manual-de-marca.md`. Seguirlo tal cual, sin criterio propio.

**Especificaciones del render:** 1080×1920, 30fps, H.264, audio 48kHz estéreo. Zona segura: nada legible en los 250px de abajo (UI de Instagram) ni en los 120px de arriba (nombre de cuenta). El primer frame sale del render con el texto del gancho ya puesto y quieto — no apareciendo con animación, porque ese frame es la portada. El último frame se parece al primero en luz y encuadre, para que el loop funcione.

**Regla que se aplica a las seis secciones sin excepción:** el clip de fondo de Veo nunca deja de moverse (todos los prompts de §2 tienen paneo o acercamiento continuo) y siempre tiene que quedar visible moviéndose por debajo de cualquier gráfico, aunque sea a baja opacidad. Ninguna sección se apoya en congelar el cuadro — la sensación de "pausa" o "golpe" se logra con tamaño, color y el corte, nunca con quietud real. Los tiempos de cada momento de abajo son orientativos: se ajustan al audio real una vez generado (ver §1, "Cómo sincronizar").

### Clip 1 · Gancho

`$10.000` en IBM Plex Mono, grande, centrado (tipografía y color según manual de marca — números = mono, siempre). A un tercio del clip, un recuadro se dibuja alrededor de una porción del número marcando `$2.500` en el color de acento, con un leve rebote de escala (1.0 → 1.06 → 1.0 en 250ms) y esa porción se desprende visualmente hacia arriba y se desvanece — se va, literalmente, como dice la voz. El resto del `$10.000` queda en pantalla sin tachar. El fondo sigue con su leve handheld shake todo el tiempo — nunca es una imagen fija con texto encima.

### Clip 2 · Problema

`−25%` entra con el principio de movimiento estándar de la marca (fade + desplazamiento hacia arriba, una sola vez — ver manual) y se queda con un pulso muy sutil de escala (1.0 ↔ 1.02, 1.2s por ciclo, todo el clip) para que nunca esté del todo inmóvil. Abajo a la derecha, chiquito y persistente durante toda la sección, un chip que dice `ejemplo` — tiene que estar visible mientras haya cualquier número en pantalla, acá y en el clip 4.

### Clip 3 · Promesa

`× 1 año entero` en la tipografía display de marca, entrando palabra por palabra con 120ms entre cada una, y con un subrayado que se dibuja de forma continua debajo mientras el clip sigue — el subrayado no termina de dibujarse hasta el corte, así que hay movimiento gráfico corriendo durante todo el clip, no solo en la entrada. Es la instrucción que el clip 4 ejecuta — tiene que quedar claro que lo que sigue es el resultado de multiplicar.

### Clip 4 · Desarrollo — el centro del reel

Cuatro montos que se acumulan verticalmente, uno debajo del otro. No se reemplazan entre sí: se apilan, porque la sensación que busca esta sección es que se amontone.

| Aparece | Detalle |
|---|---|
| `$2.500` · *por pedido* | Entra directo |
| `$50.000` · *por semana* | Cuenta corriendo desde $2.500 hasta $50.000 en 600ms |
| `$200.000` · *por mes* | Cuenta corriendo en 600ms |
| `$2.400.000` · *por año* | Cuenta corriendo en **1,2 segundos** — el doble de lento que los anteriores, y termina 40% más grande que los otros tres |

El orden en que aparecen sigue el audio, no un cronómetro fijo — cada monto entra cuando la voz lo dice. **Ninguno se queda congelado:** apenas termina de contar, el número del año arranca un pulso de brillo suave y constante (glow que crece y decrece, 1s por ciclo) que se sostiene hasta el corte al clip 5 — ese es el reemplazo del golpe de silencio de la versión anterior de este documento: en vez de una pausa quieta, un latido visual que no para. Los tres primeros montos van en el color neutro de marca (crema/tinta según el fondo); el del año, y solo ese, va en el color de acento — es el único uso de acento en todo el video. El clip de fondo baja a 35% de opacidad durante toda esta sección, con un fondo oscuro sólido detrás, pero se lo sigue viendo moverse.

### Clip 5 · Solución

Acá entra la única pieza de producto real del video: la captura del tablero (§3.4), no un mockup — el manual lo prohíbe expresamente.

- Corte seco al clip de cocina. Sube el volumen ambiente. Todos los números del clip anterior desaparecen de golpe, sin fade
- La captura del tablero entra desde la derecha, ocupa el 70% del ancho, esquinas redondeadas 24px, sombra suave, leve inclinación 3D de ~6 grados — y mientras está en pantalla, esa inclinación se mueve un par de grados de más siguiendo un vaivén lento, como si la estuvieran sosteniendo en la mano, en vez de quedar plantada
- Una tarjeta de comanda del tablero se resalta con un halo que pulsa **una sola vez** — es el pulso real del producto avisando pedido nuevo (ver manual, principio de movimiento), no un efecto decorativo nuevo
- Sale la captura. Entra `Sin comisión` / `100% para vos` sobre una banda de color de marca que barre desde abajo, y el texto queda con el mismo pulso sutil de escala del clip 2 hasta el corte

### Clip 6 · CTA

Sobre el tercio superior vacío del clip (dejado libre a propósito en el prompt de Veo), el logo `VivoMenu.png` entra con el fade + subida estándar de marca. Debajo, en dos líneas: `Mirá un menú real` (tipografía display, más chica) y, justo abajo, **`vivomenu.com.ar` como el elemento más grande y con más contraste de todo el video** — es el único destino que se ofrece, así que tiene que leerse sin esfuerzo incluso en un celular chico. `@vivomenu.app` va debajo de todo, más chico, como referencia secundaria. **No poner ningún número de teléfono, ícono de WhatsApp ni texto que sugiera "escribinos" — VivoMenu todavía no tiene ese canal armado.** El texto no se anima más una vez que entró — pero el clip de fondo (el barrio al atardecer, con la cámara en acercamiento lento constante) sigue moviéndose hasta el último frame, así que el cuadro nunca se siente detenido aunque el texto esté quieto.

### Subtítulos dinámicos

El 85% mira sin sonido — acá los subtítulos no son accesibilidad, son el video.

- 1 a 3 palabras por cuadro, nunca una línea completa
- Tipografía de cuerpo de marca, peso alto, mayúscula y minúscula normal (todo en mayúscula a este tamaño se lee más lento)
- Contorno oscuro sólido para que se lean igual sobre cocina clara y sobre fondo oscuro
- Posición fija al 68% de la altura — que no salten de lugar entre cortes
- Entrada: escala 0.92 → 1.0 en 80ms, sin rebote
- Resaltado tipo karaoke: la palabra que se está diciendo pasa al color de acento de marca, pero **solo** en los clips sobre fondo oscuro (1, 2 y 4) — en la cocina clara del clip 5, usar el verde de marca en su lugar
- Palabras a resaltar, y solo esas: *comisión* · *todos los días* · *todo el año* · *tu propia carta* · *sin comisión* · *cien por ciento*
- **Sin huecos entre subtítulos:** apenas termina de leerse un cuadro, entra el siguiente — no dejar la pantalla sin texto mientras la voz sigue sonando. Si el audio trae una pausa breve entre frases, el subtítulo puede sostenerse un instante más en vez de desaparecer antes de tiempo

### Ritmo de corte

Corte seco en cada cambio de clip, sin transición, sin fundido, sin zoom ni glitch — seis cortes en menos de un minuto ya es un ritmo alto. Dentro del clip 4, único lugar del video con micro-corte dentro de un clip: un leve zoom a 110% en cada número nuevo.

### Audio — instrucciones completas para el editor

**1. Voz (ElevenLabs)**
- Escuchar el archivo entero primero. Si ElevenLabs metió una pausa larga (más de 300ms) entre alguna frase, recortarla en la línea de tiempo — el punto de la sección "sin silencios" de este documento aplica también adentro del propio audio de voz, no solo entre música y voz
- Normalizar a **-16 LUFS integrado** antes de mezclar con el resto (es el estándar que usa Instagram internamente; si se deja el archivo crudo de ElevenLabs, casi siempre suena más bajo que la música de fondo)
- Compresión suave, 2:1 a 3:1, solo para parejar picos — no aplastar la voz
- Un pasa-altos (high-pass) en 90-100Hz para sacar grave innecesario, y un realce chico (+2 a +3dB) entre 3 y 5kHz — es lo que hace que la voz se entienda en el parlante de un celular, que es donde la va a escuchar el 90% de la gente

**2. Música de fondo**
- **Usar la librería de audio nativa de Instagram/Reels, no un archivo de música importado**, si el editor arma el corte final directo en la app de Instagram o CapCut con integración a Reels. Un audio "original" con pista nativa de la plataforma no corre riesgo de mute por derechos y en general recibe algo más de empuje del algoritmo que un audio subido de afuera
- Si se usa una pista con licencia (Epidemic Sound, Artlist, etc.), que sea instrumental, de pulso constante, sin voz ni melodía protagonista que compita con la narración
- Nivel: **-24dB por debajo de la voz**, aproximadamente, sostenido parejo de punta a punta sin bajar en ningún momento — no hay ningún tramo del video donde la música se calle o se apague del todo, ni siquiera un segundo
- Si el editor tiene forma de aplicar **ducking automático** (que la música baje sola cuando hay voz y suba un poco en los huecos cortitos entre frases), mejor que automatizarlo a mano — queda más natural y no hay riesgo de que se olvide un tramo

**3. Sonido ambiente de los clips** (cocina, impresora, calle)
- Audible pero bajo, **-18 a -20dB por debajo de la voz** — aporta textura y realismo, no compite
- En el clip 5 (cocina), subir el ambiente un poco más que en el resto (hasta -14dB aprox.) en el momento del corte — es la única vez que el video "sube de energía" con el sonido, y tiene que sentirse

**4. Mezcla final**
- Exportar a **48kHz, estéreo, AAC 256kbps** como mínimo — Instagram comprime igual al subir, pero partir de un archivo débil se nota más después de esa segunda compresión
- **Loudness final del máster: -14 LUFS integrado, true peak por debajo de -1dB** — es el estándar que usan Instagram y la mayoría de las plataformas de video corto; un video más flojo que eso se escucha bajo comparado con el resto del feed, uno más fuerte se distorsiona en la compresión de la plataforma
- **Escuchar la mezcla final en el parlante del celular, no solo con auriculares**, antes de dar por terminado — la mayoría de la gente ve Reels sin auriculares, y una mezcla que suena perfecta en estudio puede perder la voz completamente en un parlante chico si la música quedó muy presente

**Resumen de niveles, de referencia rápida:**

| Elemento | Nivel relativo a la voz |
|---|---|
| Voz (ElevenLabs) | Referencia — normalizada a -16 LUFS antes de mezclar |
| Música de fondo | -24dB, constante, nunca en cero |
| Ambiente de clips | -18 a -20dB (sube a -14dB en el clip 5) |
| Máster final | -14 LUFS integrado, true peak < -1dB |

### 3.4 — Lo que Gastón le entrega al editor

1. Los 6 clips generados con §2
2. El único archivo de audio de ElevenLabs generado en §1
3. Una grabación de pantalla real del tablero de comandas, en vertical, con una comanda entrando en vivo — captura real, nunca mockup
4. `public/VivoMenu.png`
5. `manual-de-marca.md` completo

---

## 4. Publicación

**Copy:**
> La comisión no te la cobran una vez. Te la cobran en cada pedido, todos los días.
>
> Los números del video son un ejemplo. Hacé la cuenta con los tuyos y fijate cuánto te da al año.
>
> Si te sorprendió el número, escribime y lo vemos.
>
> 📍 San Miguel de Tucumán

**Hashtags:** `#gastronomiatucuman #tucuman #restaurantesargentina #delivery #dueñodelocal #pizzeria #hamburgueseria #gastronomiaargentina`

**Geotag:** San Miguel de Tucumán.

**Horario:** entre las 15:00 y las 17:00.

**Sin link en el copy** — va en la bio. Después de publicar, subirlo también a Estados de WhatsApp: alcance directo a gente que ya tiene tu número, costo cero.

---

## 5. Qué mirar a las 48hs

Los likes no informan nada con esta cantidad de seguidores. En *Ver estadísticas*, solo tres números:

| Métrica | Qué significa |
|---|---|
| % de reproducciones de no seguidores | Si es alto, Instagram lo está distribuyendo — es lo único que importa al principio |
| Retención a 3 segundos | Si cae por debajo del 60%, el problema es el gancho, no el video |
| Compartidos | La señal más fuerte que hay. Un compartido vale más que cincuenta likes |

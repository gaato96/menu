# Historias y estados de VivoMenu

**Escrito el 2026-11-19 (fase 6).** Dos cosas: **el molde de la secuencia de cada reel** (la skill
de la fase 7 lo usa para armar la de cada paquete) y **las secuencias de los locales fundadores**,
con sus estados de WhatsApp y las respuestas por mensaje directo.

**Qué manda sobre esto:** `notas/04-contenido.md` §7 (cuándo y por qué) y `notas/01-plan.md` §3 (la
oferta). El método es el de @galu.web (`../../Contenido/web-galu/contenido/historias/`), con lo
que se corrigió ahí: **foto realista a sangre con el texto encima**, nunca un fondo plano con una
foto chica adentro.

> **Lo que todavía no se publica:** las secuencias de fundadores dicen "30 días de prueba" y "precio
> de fundador congelado por un año", que son la propuesta de `01-plan.md` §3. **Hasta que Gastón
> confirme el §8 de ese plan, no salen.** El molde de los reels sí se puede usar desde el primer reel.

---

## Cuándo y dónde

| Día | Qué | Dónde |
|---|---|---|
| El día siguiente a cada reel (martes, jueves y sábado) | La secuencia que lleva a ese reel | @vivomenu.app |
| **Lunes** | Una secuencia de fundadores (rotan A → B → C) | @vivomenu.app y las historias personales de Gastón |
| **Lunes, miércoles y viernes** | Un estado de WhatsApp (E1 → E2 → E3) | Los estados de Gastón |

**Hora: de 12 a 13.** A la noche el dueño de un delivery está en el servicio y no mira historias.
Es una hipótesis: se mira en Estadísticas a las 4 semanas (`04-contenido.md` §10).

**"Tucumán" va en todas**, porque la instalación es en persona y en Tucumán (`01-plan.md` §1).

---

## 1. El molde de la secuencia de cada reel

Tres historias, con el mismo fondo, que se leen en 3 segundos cada una:

| Historia | Qué hace | Qué lleva |
|---|---|---|
| **1 · El gancho** | Para el dedo y hace tocar | Una pregunta o una escena del tema del reel, de 12 palabras o menos, y **un sticker que se toca**: encuesta, prueba, deslizador o pregunta |
| **2 · La tensión** | Hace pasar a la siguiente | El resultado de la encuesta, el dato o el giro, sin la respuesta entera. Termina en "…" o en "te lo cuento 👉" |
| **3 · El reel** | Lleva al reel | El reel compartido (avión de papel → Agregar a tu historia), con una frase arriba y "Comentá CARTA en el reel" |

**Las reglas de la imagen** (las mismas que en Galu, con la marca de VivoMenu):
1. **Foto realista a sangre, siempre.** Nada de fondos planos, degradés solos ni fotos chicas
   recortadas.
2. **Una escena con vida de un delivery de Tucumán:** la plancha con humo, las cajas de pizza
   apiladas, la comanda de papel pinchada, el cadete con la mochila térmica, el mostrador con el
   celular que vibra. **Gente sin cara**: manos, espaldas, figuras desenfocadas.
3. **Las tres historias, del mismo mundo y no la misma foto:** el mismo lugar y la misma luz, en
   tres momentos o tres encuadres (lejos → cerca → detalle).
4. **El texto vive en la parte oscura de la foto**, arriba, con una sola palabra en ember.
5. **El lugar del sticker se describe como foto** ("the lower third is a calm, darker part of the
   same photo"), nunca como *empty area*, *box* o *panel*: Nano Banana los dibuja.
6. **La historia 3 es la misma escena muy desenfocada y más oscura en el centro, sin texto:** la
   tarjeta del reel va encima.
7. **Las pantallas no muestran nada legible** (salvo una captura real, ver §2): el celular brilla o
   vibra.
8. **Zonas libres:** los 270 px de arriba y los 380 px de abajo.

### La estructura del prompt

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: ⟨the place, who is there, what is happening in that instant, with one concrete detail⟩.
Camera: ⟨shot⟩, ⟨35 or 50⟩mm lens, shallow depth of field, ⟨angle⟩.
Light: ⟨where it comes from and how it falls⟩.
Composition: ⟨where the subject is⟩. The upper third falls into soft shadow and out-of-focus background, dark enough for text. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility: "⟨line 1⟩" / "⟨line 2⟩" / "⟨line 3⟩", with only the word "⟨word⟩" in warm amber #F0A04B. ⟨If there is a small line: Below it, smaller, in Poppins Regular, off-white: "⟨line⟩".⟩ Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨the brand block, below⟩
```

### El bloque de marca para fotos

```
Brand look (VivoMenu): premium, cinematic and realistic, like a high-end food brand campaign shot on a full-frame camera at night in a small Argentine delivery kitchen. Color grade with deep warm-black shadows (#100E0C to #322820) and amber highlights like the glow of a hot griddle; warm amber #F0A04B only for the one highlighted word; a touch of bottle green #1F4A38 is allowed in props. Natural textures (steel, cardboard, paper order tickets), subtle film grain, rich contrast. Typography: Anton for the headline, Poppins Regular for any small line. Avoid: flat or plain gradient backgrounds, small or cropped inset photos, borders, frames, boxes, cards, panels, blue or purple tones, neon, serif or script fonts, emojis, people smiling or looking at the camera, faces, logos, brand names, app interfaces, readable screens, delivery-app branding, watermarks.
```

**Si Nano Banana escribe mal las letras:** se saca del prompt el párrafo del texto, se genera la
foto sola y la frase se escribe con el texto de Instagram (fuente "Strong" o "Modern", blanca, con
sombra), en la parte oscura de arriba.

### Ejemplo armado: la secuencia de V01 (sale el martes 24/11)

El reel V01 es "Dos hamburgueserías, misma burger. Cambia una sola cosa."
(`contenido/reels/backlog.md`).

**V01 · Historia 1 · el gancho** — sticker **encuesta** «¿Cómo te entran los pedidos?»:
«Por WhatsApp, a mano» / «Desde un link».

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: the counter of a small burger delivery kitchen on a Friday night. In the sharp foreground a smartphone lies face up on the steel counter, its screen glowing with a new message notification (nothing readable), next to a stack of brown paper bags and a paper order ticket pinned on a spike. Behind, out of focus, a cook flips burgers on a smoking griddle, seen from the back.
Camera: medium close-up at counter height, 35mm lens, shallow depth of field, focus on the glowing phone.
Light: the warm amber glow of the griddle from behind, the phone screen adding a cooler soft light on the steel.
Composition: the phone sits in the middle of the frame. The upper third falls into soft shadow and out-of-focus kitchen background, dark enough for text. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Viernes, 21:30." / "¿Cuántos chats" / "tenés abiertos?", with only the words "21:30." in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

Brand look (VivoMenu): premium, cinematic and realistic, like a high-end food brand campaign shot on a full-frame camera at night in a small Argentine delivery kitchen. Color grade with deep warm-black shadows (#100E0C to #322820) and amber highlights like the glow of a hot griddle; warm amber #F0A04B only for the one highlighted word; a touch of bottle green #1F4A38 is allowed in props. Natural textures (steel, cardboard, paper order tickets), subtle film grain, rich contrast. Typography: Anton for the headline, Poppins Regular for any small line. Avoid: flat or plain gradient backgrounds, small or cropped inset photos, borders, frames, boxes, cards, panels, blue or purple tones, neon, serif or script fonts, emojis, people smiling or looking at the camera, faces, logos, brand names, app interfaces, readable screens, delivery-app branding, watermarks.
```

**V01 · Historia 2 · la tensión** — sin sticker. El texto se escribe en Instagram con el resultado
real de la encuesta si hay más de 10 votos; si no, va el texto de abajo.

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: the same burger kitchen, a few minutes later. Close-up of a gloved hand reaching for a paper order ticket on the spike while another ticket hangs half torn; the griddle smoke curls through the frame; a delivery thermal backpack waits on a stool, out of focus.
Camera: close-up, 50mm lens, very shallow depth of field, slightly low angle.
Light: warm amber griddle glow from the side, smoke catching the light.
Composition: the hand and the ticket sit in the middle of the frame. The upper third is dark smoke and shadow. The lower third stays dark and calm, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Dos locales iguales." / "Una sola diferencia." / "Te la muestro 👉", with only the words "Una sola diferencia." in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

**V01 · Historia 3 · el reel** — el reel compartido encima. Texto de Instagram arriba:
«La diferencia está en el reel». Abajo de la tarjeta: «Comentá CARTA y te armo la tuya».

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: the same burger kitchen seen wide, heavily out of focus: warm amber griddle light, steam, the silhouette of the counter and paper bags, everything soft and blurred into bokeh.
Camera: wide shot, 35mm lens, extremely shallow depth of field, everything out of focus.
Light: warm amber glow, darker toward the center of the frame.
Composition: the center of the frame is the darkest and calmest part of the photo. No text anywhere in the image.

⟨brand block⟩
```

---

## 2. Las capturas reales

Están en `capturas/`, sacadas del menú de demostración (`vivomenu.com.ar/m/burger-house-tuc`) el
2026-11-19 con tamaño de iPhone:

| Archivo | Qué muestra |
|---|---|
| `demo-carta.png` | La carta: foto de portada, "Abierto ahora", las categorías y la primera hamburguesa con foto y precio |
| `demo-producto.png` | La Doble Cheddar abierta: punto de cocción "Jugosa", agregado "Panceta +$ 1.800" tildado, y el botón "Agregar — $ 15.700" con el total calculado |

> **Ojo con la demo:** el logo de Burger House Tucumán es **el de Galu** ("Galu Diseño Web"). Para
> un dueño que la abre se ve raro, y VivoMenu no tiene que hablar como una agencia
> (`.agents/product-marketing.md`, regla de marca). Conviene cambiarlo por un logo de hamburguesería
> inventado desde `/admin` **antes de publicar estas historias** y volver a sacar las capturas
> (`demo-carta.png` muestra el logo).

**Para sacarlas de nuevo:** abrí la demo en el celular y hacé la captura, o pedíselo a Claude (las
saca con Playwright, sin hacer ningún pedido).

**La captura del tablero** (la que más vende) **la saca Gastón** desde la tablet del local de
demostración, con pedidos de prueba en las columnas. Se guarda como `capturas/tablero.png` y
reemplaza a `demo-producto.png` en la historia A2 cuando exista.

---

## 3. Lo que se puede decir de VivoMenu, y lo que no

**Sí** (existe hoy, `.agents/product-marketing.md` §2):
- el cliente arma el pedido solo desde un link, con fotos, agregados, "sin tomate" y el precio
  calculado;
- el pedido te llega armado al WhatsApp y aparece en un tablero con alerta;
- la pantalla de cocina, la caja, la ficha de cada cliente y el resumen del lunes;
- delivery por zonas con su costo, o retiro;
- "avisar que ya salió" con un toque;
- **sin comisión por pedido;**
- Gastón carga la carta con IA desde una foto y lo deja andando, **gratis**, en Tucumán;
- se puede probar ya: la demo anda (`vivomenu.com.ar/m/burger-house-tuc`).

**No:**
- Mercado Pago ni la impresión de comandas, hasta probarlos en real;
- "vendé más", "duplicá tus pedidos" ni ningún número de resultado: no hay ningún caso todavía;
- "dejá PedidosYa";
- un precio en la historia: el precio se dice en la charla, cuando ya vio su carta armada.

---

## 4. La regla de claridad (para las secuencias de fundadores)

Cada secuencia contesta cuatro preguntas, en este orden. Si falta una, no sale:
1. **¿Qué problema?** En una escena: el viernes a las 21:30, quince chats abiertos, el "sin cebolla"
   que se perdió.
2. **¿Qué es?** **Mostrado:** la captura real con flechas. Si no se puede mostrar, en una frase:
   "un link donde tu cliente arma el pedido y te llega ordenado".
3. **¿Qué hace por vos?** Tres cosas concretas: el cliente arma el pedido solo, con agregados y
   precio · te llega ordenado al WhatsApp y al tablero · la cocina lo ve sin preguntar.
4. **¿Qué te pido y qué te llevás?** La instalación gratis, la prueba y el precio de fundador, a
   cambio de usarlo de verdad y contar cómo te fue. Para deliverys y locales de mostrador de
   Tucumán, nombrando rubros. Y cómo pedirlo: el sticker de pregunta o un mensaje.

**Palabras que no van solas:** "fundadores" (se dice "los primeros 5 locales"), "sistema" sin decir
qué hace, "IA" sin decir para qué.

**El cupo:** dice "5 lugares". Cuando entra uno se baja ("quedan 4") en todo lo que se publique desde
ese día. Nunca un número que no sea cierto.

---

## 5. Secuencia A — "El viernes a las 21:30"

**A1 · el problema** — sticker **encuesta** «¿Te pasa?»: «Todos los viernes» / «A veces».

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: a small pizza delivery kitchen in Argentina on a busy Friday night. In the sharp foreground a smartphone on the floury counter keeps lighting up with new message notifications (nothing readable), half covered by a pizza box; behind it, out of focus, a cook slides a pizza into a glowing brick oven and a stack of closed pizza boxes waits by the door, seen from the back.
Camera: medium close-up at counter height, 35mm lens, shallow depth of field, focus on the glowing phone.
Light: the orange glow of the oven from behind, flour dust in the air catching the light.
Composition: the phone sits in the middle of the frame. The upper third falls into soft shadow and out-of-focus kitchen background, dark enough for text. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Viernes, 21:30." / "Quince chats abiertos" / "y la cocina esperando.", with only the words "Quince chats" in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

**A2 · cómo funciona** — **la captura real con flechas.** Sin sticker. Se arma en Nano Banana en
modo edición, adjuntando `capturas/demo-producto.png`:

```
Edit: build a vertical 9:16 Instagram Story, 1080x1920, using the attached screenshot.

Keep the attached screenshot exactly as it is: do not redraw, retype, translate, recolor or change any word, number, button or icon in it. It is a real screenshot of a food ordering menu and must stay pixel-faithful and fully legible.

Place the screenshot inside a modern, thin-bezel black smartphone, seen straight on with a very slight tilt, shown large: the phone is about 60 percent of the image height, positioned slightly left of center, so the right side has room for labels. Soft, realistic shadow under the phone.

Background: a full-bleed, out-of-focus photograph of a small burger delivery kitchen at night (steel counter, griddle glow, paper bags), color graded with deep warm-black shadows (#100E0C to #322820) and amber highlights, darker toward the edges so the phone and the labels stand out. No borders, no frames, no boxes, no panels.

At the top, above the phone, a headline in Anton, warm off-white #F1EBDD with a soft shadow, centered, in two lines: "Tu cliente arma" / "el pedido solo.", with only the word "solo." in warm amber #F0A04B.

Three thin, elegant warm amber #F0A04B arrows with a slight curve, each starting at a short label on the right side of the image and pointing precisely to one part of the screen inside the phone. Labels in Poppins Bold, off-white, 2 short lines each, with a small amber number before each one:
1. pointing to the selected option "Jugosa": "1  Elige cómo la quiere" / "sin preguntarte"
2. pointing to the checked add-on "Panceta +$ 1.800": "2  Suma agregados" / "con su precio"
3. pointing to the green button "Agregar — $ 15.700": "3  El total sale solo" / "y te llega armado"

At the bottom, small, in Poppins Regular, off-white at 80 percent: "Menú de demostración de VivoMenu".

Spell every label exactly as written. Nothing else is written outside the phone. Premium, clean, cinematic, like a high-end product launch. Avoid: blue or purple tones, serif or script fonts, emojis, extra icons, logos, cartoon arrows, thick or neon arrows, any change to the screenshot.
```

**Revisá dos cosas antes de publicar:** que el texto adentro del celular sea idéntico a la captura
y que cada flecha apunte a lo que corresponde. **Si Nano Banana cambia algo de la captura**, armala a
mano en Canva: el fondo con el prompt de A1 sin el párrafo del texto, la captura encima en un marco
de celular, y las flechas y los textos con la herramienta de texto.

**A3 · el trato** — sticker **pregunta**: «¿Qué local tenés? Te armo tu carta». Con el texto de
Instagram, chico, abajo del sticker: «Quedan 5 lugares».

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: the same pizza kitchen later that night, calm. On the counter in the foreground a tablet stands on a small stand, its screen glowing softly (nothing readable), next to a neat row of closed pizza boxes ready to go; a delivery rider's gloved hand picks up one box, out of focus. A feeling of order and calm.
Camera: medium shot, 35mm lens, shallow depth of field, eye level.
Light: warm, softer oven glow, long gentle shadows.
Composition: the tablet and the boxes fill the middle of the frame. The upper third is the darker wall in soft shadow. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Te lo dejo andando" / "gratis en los primeros" / "5 locales de Tucumán.", with only the word "gratis" in warm amber #F0A04B. Below it, smaller, in Poppins Regular, off-white, in two short lines: "A cambio: que lo uses y me cuentes cómo te fue." / "Hamburguesas, pizzas, sushi, rotisería, empanadas…". Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

---

## 6. Secuencia B — "Sin cebolla"

**B1 · el gancho** — sticker **prueba** (quiz) «¿Dónde se perdió el "sin cebolla"?»: «En el
chat» (correcta) / «En la cocina» / «En el cadete».

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: a home kitchen table at night, a delivery burger box just opened; two hands lift the top bun and reveal thick slices of raw onion on the patty. A phone lies beside the box, screen dark.
Camera: top-down close-up, 50mm lens, shallow depth of field, focus on the onion.
Light: a single warm pendant lamp from above, deep shadows around the table.
Composition: the open box sits in the middle of the frame. The upper third is the dark table in shadow. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 2 lines: "Pediste sin cebolla." / "Llegó con cebolla.", with only the words "con cebolla." in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

**B2 · la tensión** — sin sticker.

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: back in a burger delivery kitchen on a Friday night: close-up of a cook's hand writing a paper order ticket with a pen while a phone leans against the ticket rail, glowing with a long chat (nothing readable); behind, out of focus, burgers on the griddle.
Camera: close-up, 50mm lens, very shallow depth of field, slight high angle.
Light: warm amber griddle light from the side.
Composition: the hand and the ticket sit in the middle of the frame. The upper third is dark kitchen shadow. The lower third stays dark and calm, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Estaba en el" / "tercer mensaje del chat." / "¿Y si lo marcaba él? →", with only the words "tercer mensaje" in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

**B3 · cómo funciona** — la misma imagen que **A2**.

**B4 · el trato** — la misma imagen que **A3**, con su sticker de pregunta y «Quedan 5 lugares».

---

## 7. Secuencia C — "¿Conocés a alguien?"

Para que la compartan los que no tienen local, que son la mayoría de los que ven las historias de
Gastón. Dos historias.

**C1 · el pedido** — sin sticker.

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: two friends at a small table outside a burger place at night, seen only from the shoulders down; one slides a phone across the table to show the other, two half-eaten burgers in paper wrappers and a bottle of soda between them; the warm lit counter of the place blurred behind.
Camera: medium close-up, 35mm lens, shallow depth of field, slightly high angle over the table.
Light: warm light spilling from the counter, night around.
Composition: the hands and the phone sit in the middle of the frame. The upper third is the darker, out-of-focus street and counter. The lower third stays dark and calm, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 2 lines: "¿Conocés a alguien" / "que tenga un delivery?", with only the word "delivery?" in warm amber #F0A04B. Below it, smaller, in Poppins Regular, off-white: "Hamburguesas, pizzas, sushi, rotisería, empanadas…". Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

**C2 · lo que se lleva** — sticker **mención** vacío para que lo completen, o el texto de Instagram
«Mandale esta historia 👉» con la flecha al ícono de compartir.

```
Vertical 9:16 Instagram Story, 1080x1920. Full-bleed, edge-to-edge cinematic photograph that fills the entire frame, no borders, no frames, no inset or cropped photos, no boxes, no panels.

Scene: over the shoulder of a person sitting outside at dusk, about to send a message with their thumb, the phone glowing softly; a paper-wrapped burger in the other hand, warm string lights blurred into bokeh behind.
Camera: over-the-shoulder close-up, 50mm lens, very shallow depth of field, focus on the thumb and phone.
Light: dusk, warm bokeh lights and the soft glow of the phone on the fingers.
Composition: the phone sits in the middle of the frame. The upper third is the dark evening sky and blurred lights. The lower third is a calm, darker part of the same photo, with nothing written on it.

Text overlaid on the photo, in the upper third, large, bold condensed sans-serif (Anton), tight line spacing, centered, warm off-white #F1EBDD with a soft shadow for legibility, in 3 lines: "Le armo gratis" / "su carta para pedir" / "y se lo dejo andando.", with only the word "gratis" in warm amber #F0A04B. Spell every word exactly as written. Nothing else is written anywhere in the image.

⟨brand block⟩
```

---

## 8. Los estados de WhatsApp

Una imagen y un texto. **Usan las imágenes de las secuencias** (cada una se genera una sola vez).
El texto va en la leyenda del estado.

**E1 · lunes** — imagen **A2** (la captura con flechas):
```
Busco los primeros 5 locales de delivery de Tucumán para VivoMenu 🍔

Tu cliente entra a un link, arma el pedido con los agregados y el precio, y te llega ordenado al WhatsApp y a un tablero. Sin comisión por pedido.

A los primeros 5 les cargo la carta y se lo dejo andando gratis, con un mes de prueba. A cambio, que lo usen de verdad y me cuenten cómo les fue. Así se ve, probalo: vivomenu.com.ar/m/burger-house-tuc

Si tenés un delivery, escribime y te armo tu carta.
```

**E2 · miércoles** — imagen **A1**:
```
Viernes, 21:30. Quince chats abiertos y la cocina esperando.

Estoy buscando 5 deliverys de Tucumán para dejarles andando gratis un link donde el cliente arma el pedido solo y te llega ordenado. Quedan 5 lugares, escribime 👇
```

**E3 · viernes** — imagen **C1**:
```
¿Conocés a alguien que tenga un delivery? Hamburguesas, pizzas, sushi, rotisería, empanadas…

Le armo gratis su carta para que sus clientes pidan desde un link y le lleguen los pedidos ordenados. Reenviale este estado o pasame su contacto y le escribo yo de tu parte 🙏
```

---

## 9. Las respuestas

**A cada uno que responda** (encuesta, prueba, pregunta, comentario o mensaje), el mismo día y por
mensaje directo. Corta y sin precio hasta el paso 4:

1. **Al que respondió la encuesta o el sticker:**
   ```
   ¡Hola [nombre]! Gracias por responder 🙌 ¿Tenés un local de comida? Te pregunto porque estoy armando gratis la carta de los primeros 5 deliverys de Tucumán en VivoMenu.
   ```
2. **Si tiene un local:**
   ```
   Buenísimo. ¿Qué vendés, y hoy los pedidos te entran todos por WhatsApp?
   ```
3. **Si encaja** (delivery o mostrador, pedidos por WhatsApp):
   ```
   Pasame el Instagram del local o una foto de tu carta y te la armo para que la veas andando. Me lleva un rato y no tenés que hacer nada.
   ```
   Gastón importa la carta con IA desde `/admin`, revisa precios y agregados, y le manda el link.
4. **Con la carta armada:**
   ```
   Listo, esta es tu carta en VivoMenu: [link]. Probá armar un pedido como si fueras un cliente.

   Si te gusta, te lo dejo andando en el local: la instalación es gratis y te enseño a usar el tablero. ¿Qué día te queda bien para pasar?
   ```
   Desde acá sigue como la prospección (fase 10): la visita, el precio y la prueba.
5. **Si te pasa un contacto:**
   ```
   ¡Gracias! Le escribo diciéndole que vengo de tu parte, ¿te parece?
   ```
6. **Si no tiene local:** «¡Gracias por responder! 🙌» y nada más.

**Cada uno se anota** en la planilla de prospección (fase 10) con la fuente ("historia A", "estado
E2", "reel V01") y, si vino por alguien, quién lo presentó.

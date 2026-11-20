---
name: paquete-reel
description: Genera el paquete completo de un reel de VivoMenu para Instagram y TikTok (gancho elegido entre cuatro, guion de voz en off, plan de motion graphics o de grabación de pantalla, prompt de edición para hyperframes, descripciones con hashtags por tamaño, prompt de portada, la secuencia de tres historias con sus prompts de Nano Banana, y el recurso que se manda por DM con los mensajes del circuito) a partir de la próxima idea de marketing/contenido/reels/backlog.md. Lo guarda en marketing/contenido/reels/. Usala cuando corra la rutina de reels de VivoMenu, o cuando Gastón pida "el reel de VivoMenu", "generá el paquete de V04", "armame el próximo reel" o similar dentro de este repo.
---

# Paquete de reel — VivoMenu

Generás **un archivo por reel** en `marketing/contenido/reels/NN-slug.md`, con todo listo para
copiar y pegar. Gastón no escribe nada: genera la voz, la portada y las historias, graba la
pantalla cuando hace falta, edita con hyperframes, publica y contesta a los que comentan.

**Lo que no se olvida nunca:**
- **El contenido posiciona, no vende.** Le deja algo útil al dueño de un delivery o de un local de
  mostrador que toma pedidos por WhatsApp: hamburguesería, pizzería, sushi, rotisería, empanadas,
  cocina sin local al público (`marketing/notas/04-contenido.md` §3).
- **Nada lleva la cara de Gastón.** Tres formatos (`04-contenido.md` §6):
  - **A · historia animada**, 45 a 75 s: motion graphics 2D de línea sobre fondo noche + voz;
  - **B · pantalla real**, 20 a 40 s: grabación del local de demostración + hora y contador + voz o
    música;
  - **C · corto de texto**, 7 a 10 s: una burbuja de chat sobre fondo noche + música, sin voz.
- **Ninguna pieza dice que el dueño no necesita lo que VivoMenu vende**, ni "dejá PedidosYa". La
  postura: que el cliente que ya te pide directo no se te pierda.
- **VivoMenu no se presenta.** Aparece dentro de "Viernes 21:30", "¿Y si…? Probé" y "Tu carta de
  Instagram" como escena o prueba, nunca como aviso. Los fundadores no se piden en los reels.
- **La base es la matriz** (`marketing/investigacion/matriz-2026-11.md`): de ahí salen las
  estructuras, **nunca las frases** de LaCarta, Menu4D, Menuly ni DougMenu.
- **El gancho, la descripción y los hashtags se escriben con `referencias/ganchos.md`.** Un gancho
  que describe una escena no sirve: le tiene que pasar algo a quien mira.

### Las referencias

| Para qué | Qué leer |
|---|---|
| El gancho | `referencias/ganchos.md` §1 a §4 · `viral-hook-creator/hook-patterns.md` y `trigger_words.md` · `instagram-skills/hook-formulas.md` |
| Ritmo, envíos y guardados | `instagram-skills/algorithm-heuristics.md` |
| La descripción | `referencias/ganchos.md` §6 · `instagram-skills/audit-checklist.md` y `scrub-rules.md` · la skill `humanizer` si está |
| Los hashtags | `referencias/ganchos.md` §7 · `instagram-skills/hashtag-strategy.md` |
| La semana | `referencias/ganchos.md` §8 · `instagram-skills/content-planner.md` |
| Las historias | `marketing/contenido/historias/README.md` §1 (el molde y el bloque de marca) |

Los originales están en inglés y hablan de cuentas en general: **vale lo de `ganchos.md`**, y las
reglas de esta skill mandan sobre cualquier consejo de esas skills. **Nunca se publica nada
automáticamente:** publica Gastón.

**Idioma:** todo en rioplatense, salvo los prompts de imagen y de video (Nano Banana, Flow), que van
en inglés. El prompt de edición va en español.

---

## Paso 0 — sincronizar

Desde la raíz del repo `menu-digital`: `git pull --rebase`. Si falla por cambios locales que no son
tuyos, **no los toques**: seguí sin el pull y avisá al final. Nunca `reset`, `stash` ni `checkout`
de archivos ajenos.

## Paso 1 — qué hay que generar

**Modo manual** (te lo pidió Gastón):
- Generá **uno solo**: la idea que nombró ("V04") o, si no nombró ninguna, la primera `pendiente`
  del calendario de `marketing/contenido/reels/backlog.md`.
- En "Generados", la fecha es la de hoy con la marca "manual".

**Modo rutina** (te llamó la tarea programada):
1. Cada turno genera **el reel del próximo día de publicación** (lunes, miércoles o viernes).
2. Mirá la tabla **"Generados"** del backlog: si el reel de esa fecha ya tiene fila, no generes
   nada; decí cuál fue el último paquete y terminá.
3. Si se saltearon turnos, generá los que falten para las publicaciones que todavía no pasaron, con
   un máximo de dos.

## Paso 2 — elegir la idea

1. **La del día que toca en el calendario** del backlog. Si no hay calendario para esa fecha, la
   primera `pendiente` de "Las siguientes" que respete el día:
   - **lunes, el de alcance:** A · "Dos deliverys" o "El dato";
   - **miércoles, el que rota:** C · "El chat del viernes", o B · "Tu carta de Instagram";
   - **viernes, el de producto:** B · "Viernes 21:30" o "¿Y si…? Probé".
   - **Nunca dos seguidos del mismo rubro**, ni el mismo patrón de gancho, ni el mismo objetivo tres
     veces.
2. **Salteá las que piden algo que no se puede hacer desde acá** (columna "Qué hace falta antes"),
   dejalas `pendiente` y avisá:
   - **"¿Y si…? Probé"** necesita la prueba hecha. Si no hay resultado anotado en la fila o en
     `marketing/contenido/pruebas/`, no se escribe: **el resultado nunca se inventa**.
   - **"El dato"**: buscá el dato en la web y **confirmalo en dos fuentes serias** (medio, sitio
     oficial, estudio). Ponelas en el paquete. Si no se confirma, marcá la idea `descartado` con el
     motivo y tomá la siguiente del mismo día.
   - **"Tu carta de Instagram"** necesita la carta: una armada para el reel o la de un fundador con
     permiso. Si la fila no dice cuál, se arma una carta inventada de su rubro y se dice inventada.
   - **"Viernes 21:30"** necesita la grabación del tablero del local de demostración. El paquete
     dice exactamente qué grabar (§2); Gastón lo graba.
3. **Si quedan menos de seis pendientes** en total, agregá seis ideas nuevas al final de "Las
   siguientes", marcadas `propuesta (rutina)`: con el gancho escrito por `referencias/ganchos.md`,
   la mitad del formato A, rotando el rubro, usando el último `marketing/investigacion/radar/` si
   existe, sin repetir escena ni tema.

## Paso 3 — leer antes de escribir (obligatorio)

1. `marketing/notas/04-contenido.md`: el público (§3), las series (§4), los ganchos y el pedido (§5),
   los formatos (§6).
2. `marketing/investigacion/matriz-2026-11.md`: el patrón de la serie, con sus piezas citadas.
3. `.agents/product-marketing.md` §2 (lo que existe), §10 (las palabras del dueño y las que no se
   usan) y §11 (la voz de la marca).
4. `marketing/manual-de-marca.md` §2 y §3: la paleta y la tipografía.
5. **Los dos últimos paquetes** de `marketing/contenido/reels/` y los recursos de
   `marketing/contenido/recursos/`, para no repetir gancho, patrón, objetivo, rubro, palabra,
   hashtags ni recurso.
6. **`referencias/ganchos.md` entero**, y de los originales, al menos `hook-patterns.md`,
   `trigger_words.md` y `hook-formulas.md`.

## Paso 3b — el gancho, antes que todo lo demás

Con `referencias/ganchos.md` §4: el objetivo, **cuatro ganchos de patrones distintos**, la prueba
del scroll a los cuatro (pensando en alguien que pide delivery, no en el dueño), el regancho y el
cierre que vuelve al gancho. Ningún número inventado para que pegue más.

### Lo que se dice de VivoMenu, y lo que no

**Sí** (existe hoy):
- el cliente arma el pedido desde un link o un QR, con fotos, variantes, agregados y "quitar
  ingrediente", y el precio se calcula solo (y se recalcula en el servidor);
- el pedido llega armado al WhatsApp del local y aparece en el tablero con alerta y notificación;
- el tablero: Nuevo → Cocina → Camino → Entregado, con "sin confirmar por el cliente" y el botón
  para escribirle;
- la tarjeta trae dirección, referencia, teléfono y "abona con $X";
- delivery por zonas con su costo, o retiro;
- "avisar que ya salió" con un toque;
- marcar un producto agotado con un toque; "Local abierto ahora" para cortar los pedidos;
- horarios (también pasando la medianoche): fuera de horario la carta no toma pedidos;
- pantalla de cocina, caja, ficha de cada cliente, resumen semanal;
- importar la carta con IA desde una foto o un PDF (el dueño revisa antes);
- fotos de los platos con IA, desde la foto del celular;
- se instala como app con el nombre y el logo del local;
- **sin comisión por pedido.**

**No:**
- **Mercado Pago ni la impresión de comandas** hasta que el panorama diga que se probaron en real;
- multi-sucursal, puntos, recetas e insumos, dividir la cuenta;
- ningún resultado de un cliente: **no hay casos todavía**;
- "vendé más", "duplicá tus pedidos", porcentajes sin fuente;
- "dejá PedidosYa" o "las apps te roban".

**Cuando una pieza habla de lo que se puede hacer gratis** ("El chat del viernes"), puede nombrar
herramientas reales que el dueño usa solo (WhatsApp Business: mensaje de bienvenida, de ausencia,
respuestas rápidas, catálogo). **Tiene que ser verdad que hoy hacen eso.**

### Las reglas que más se rompen

- **Las palabras del dueño:** comanda, pedido, cocina, mostrador, cadete, carta, hora pico, de un
  toque, prolijo. Nunca "solución", "plataforma", "dashboard", "optimizar".
- **Una historia inventada se dice inventada** ("dos hamburgueserías inventadas") y sus números
  llevan "ejemplo" en pantalla.
- **Las pantallas del sistema son reales**, del local de demostración, con la leyenda "local de
  demostración". Nunca un dibujo que simule una función que no existe.
- **Sin voz en el formato C.** Sin cara en ninguno.
- **El pedido:** CARTA casi siempre (la demo con su carta). Otra palabra solo si el recurso es otro
  (BIENVENIDA, RESPUESTAS…), y nunca la misma palabra con dos recursos distintos.

## Paso 4 — escribir el paquete

**Numeración:** `NN` sigue al último `NN-*.md` de `marketing/contenido/reels/` (el primero es `01`).
**Slug:** tres a cinco palabras del tema, en minúsculas y con guiones.

Usá **exactamente** esta estructura. Lo que va entre `⟨ ⟩` lo completás vos. Los bloques de código
son lo que Gastón copia y pega: **completos, sin nada para rellenar**, salvo un dato que solo él
puede saber, en MAYÚSCULAS entre `⟨ ⟩` y explicado arriba del bloque.

````markdown
# Reel NN — "⟨gancho⟩"

| | |
|---|---|
| **Idea** | ⟨id y gancho del backlog⟩ |
| **Publica** | ⟨día y fecha⟩, a las 16 · historias: ⟨día siguiente⟩, de 12 a 13 |
| **Serie · rubro** | ⟨serie⟩ · ⟨rubro⟩ |
| **Formato** | ⟨A · historia animada · B · pantalla real · C · corto de texto⟩ |
| **Duración** | ⟨segundos⟩ |
| **Patrón de la matriz** | ⟨P1 a P5, con una pieza citada y su rendimiento⟩ |
| **Gancho** | ⟨patrón de `referencias/ganchos.md` §2⟩ |
| **Objetivo** | ⟨guardar · enviar · comentar · seguir⟩ |
| **Pedido** | Comentá **⟨PALABRA⟩** → ⟨el recurso⟩ |
⟨Solo en "El dato": | **Fuentes** | ⟨medio, fecha y link de cada una⟩ |⟩
⟨Solo en "¿Y si…? Probé": | **La prueba** | ⟨qué se hizo, cuándo y qué pasó⟩ |⟩

## Antes de producir

1. ⟨A y B: **Voz:** el bloque de §1 en ElevenLabs → `voz.mp3`. · C: no hay voz.⟩
2. ⟨A: no hay clips: todo es motion graphics. · B: **Grabar:** lo que dice §2 → `pantallas/…mp4`. · C: nada.⟩
3. **Carpeta:** `reel-NN/` con `voz.mp3`, `pantallas/` si hay, y `musica.mp3` si querés.
4. **Edición:** el prompt de §3, en una sesión de Claude abierta en esa carpeta.
5. **Portada:** el prompt de §5 en Nano Banana.
6. **Publicar** ⟨día⟩ a las 16: la descripción de §4, el mismo video en Instagram y en TikTok, y
   compartirlo en historias.
7. **Comentarios:** los mensajes de §6 a cada uno que comente ⟨PALABRA⟩, el mismo día. Contestá en
   la primera hora.
8. **Al día siguiente, de 12 a 13:** la secuencia de §7.

## El gancho

| Patrón | Gancho | Por qué sí o por qué no |
|---|---|---|
| **⟨patrón⟩** · elegido | **"⟨gancho⟩"** → "⟨regancho⟩" | ⟨cómo pasa la prueba del scroll y qué objetivo gana⟩ |
| ⟨patrón⟩ | "⟨gancho⟩" | ⟨por qué no, o para qué queda⟩ |
| ⟨patrón⟩ | "⟨gancho⟩" | ⟨…⟩ |
| ⟨patrón⟩ | "⟨gancho⟩" | ⟨…⟩ |

## Por qué corta el scroll

⟨Tres o cuatro líneas: a quién le habla el primer segundo y qué siente; qué pregunta abre y dónde se
cierra; dónde está el número; por qué alguien lo manda, lo guarda o comenta.⟩

---

## 1. Voz en off ⟨en C: "El texto en pantalla"⟩

⟨A y B:⟩ **Para ElevenLabs:** Multilingual v2 o v3, una voz de la biblioteca con acento argentino
(filtro: Spanish → Argentina). Estabilidad 0,40 · Similitud 0,75 · Estilo 0,25 · Velocidad 1,05. Son
⟨N⟩ caracteres de los 10.000 del plan gratis del mes (Galu usa la misma cuota: sumá los dos).

```
⟨El texto, listo para pegar. Los puntos y las comas son las pausas. Horas y números en palabras
("veintiuna treinta", "quince mil setecientos"). Sin siglas ni paréntesis.⟩
```

**Los tiempos:**

| # | Tiempo aprox. | Frase |
|---|---|---|
| 1 | 0,0 – ⟨…⟩ | ⟨gancho⟩ |

---

## 2. ⟨A: "Las escenas" · B: "Qué grabar" · C: "La escena"⟩

⟨Ver las reglas de §2 abajo.⟩

---

## 3. Prompt de edición para Claude (hyperframes)

```
⟨el prompt completo⟩
```

---

## 4. Descripción

**Instagram:**

```
⟨descripción⟩
```

**TikTok:**

```
⟨descripción⟩
```

`#⟨tag⟩` nicho · `#⟨tag⟩` medio · …

---

## 5. Portada — prompt para Nano Banana

```
⟨prompt⟩
```

---

## 6. El recurso y los mensajes del circuito

⟨Ver §6 abajo.⟩

---

## 7. La secuencia de historias

⟨Las tres, con su sticker y su texto exactos arriba de cada prompt.⟩
````

### §1 — la voz (formatos A y B)

- **A · historia animada:** de 45 a 75 s, **entre 120 y 190 palabras**. Frases de 14 palabras como
  máximo, una idea por frase. Leído a 1,05, 150 palabras son unos 55 s.
- **B · pantalla real:** de 20 a 40 s, **entre 50 y 100 palabras**, o sin voz si la pantalla se
  explica sola (entonces §1 es el texto en pantalla, como en C).

**En "Dos deliverys"** (patrón P1, el de LaCarta 442x), la estructura es:
1. **El gancho** para cualquiera.
2. **Las dos iguales:** mismo barrio, misma comida, mismo viernes. Dicho como inventado.
3. **La hora y el contador:** 21:30, los pedidos que entran, cada local con su número de ejemplo.
4. **La única diferencia**, mostrada en los dos lados a la vez (pantalla partida).
5. **Lo que se separa:** la cocina, el cadete, el cliente que vuelve o no. Números de ejemplo.
6. **El cierre** que vuelve al principio ("misma burger, mismo barrio… una sola cosa") y el pedido.

**En "El dato"** (P3, 53x): el gancho con el nombre conocido → el dato con su fuente → el truco
explicado → "y esto lo podés hacer en tu local" → el pedido. **Cada dato, con su fuente.**

**En "Viernes 21:30" y "¿Y si…? Probé"** (P2 y P4): la hora en pantalla desde el primer cuadro → el
paso a paso real → el resultado → el pedido.

| Tramo | Qué tiene que pasar |
|---|---|
| **Gancho** (0 – 2 s) | El que ganó en el paso 3b. Sin saludo, sin describir la escena |
| **Regancho** (2 – 6 s) | Baja al dueño y promete lo que se lleva |
| **Desarrollo** | Tres momentos con una imagen y un número cada uno. Entre uno y otro, una frase puente |
| **Cierre** | Lo que gana el dueño. Paga la promesa del gancho |
| **Pedido** (últimos 4 s) | "Comentá ⟨PALABRA⟩ y te armo tu carta en VivoMenu." Y, si el gancho le habló a cualquiera, uno de enviar con su motivo ("Mandáselo a tu hamburguesería de siempre."). La última frase lleva de vuelta al gancho |

Voseo, rioplatense, segunda persona. Primera persona solo cuando Gastón ofrece algo ("te armo").
**Nada que no se pueda mostrar en pantalla.**

### §2 — la imagen

**A · historia animada: "Las escenas".** No hay clips de Flow. Una tabla, un renglón por frase:
qué se ve (íconos de línea, texto, números), cómo se mueve y en qué momento. El estilo:
- fondo noche `#100E0C` con grano suave; íconos de línea en crema `#F1EBDD`, trazo de 4 px, que
  se dibujan;
- **un solo color de acento, ember `#F0A04B`**, para el número o la palabra que importa; el verde
  `#1F4A38` solo para "salió bien";
- los dos locales, en pantalla partida o uno arriba del otro, con el mismo dibujo y una sola
  diferencia;
- números y horas en IBM Plex Mono (la letra del ticket), con contador animado;
- **la comanda de papel con borde dentado** como motivo de marca (`manual-de-marca.md` §4).

**B · pantalla real: "Qué grabar".** Exactamente qué grabar en el local de demostración
(`vivomenu.com.ar/m/burger-house-tuc` y su panel), en qué dispositivo (celular para el menú, tablet
para el tablero), con qué pedido de prueba y en qué orden. Cada toma con su nombre de archivo
(`pantallas/p1-…mp4`). Grabación nativa del celular o la tablet, vertical, sin notificaciones. Si
un pedido de prueba queda en el tablero, se cancela después.

**C · corto de texto: "La escena".** Una burbuja de WhatsApp genérica (sin el logo ni los colores
de WhatsApp: globo crema sobre fondo noche) con el mensaje del cliente, la hora en IBM Plex Mono, y
lo que pasa después (la respuesta tarde, el "visto"). Se arma entera en hyperframes. Opcional: un
clip de Flow de 8 s de una cocina de noche, de fondo, desenfocado, con las reglas de abajo.

**Si un reel lleva un clip de Flow** (opcional, nunca para simular el sistema):
`Vertical 9:16 video, ⟨N⟩ seconds.` + plano + sujeto + acción + lugar (*"a small Argentine burger
delivery kitchen at night, steel counter, griddle, paper bags"*, la misma frase en todos los clips)
+ cámara + luz + *"color grade with deep warm-black shadows and amber highlights like a hot
griddle"* + *"photorealistic, cinematic, 35mm, shallow depth of field"* + *"No readable text, no
letters or numbers on any screen or sign, no logos, no brand names, no watermarks, no subtitles."*
+ *"Audio: soft kitchen ambience only, no music, no dialogue."* Sin caras de frente, sin pantallas
que muestren una interfaz.

### §3 — el prompt de edición

Lo pega Gastón en una sesión de Claude abierta en la carpeta del reel. **Funciona solo, sin este
archivo al lado.** Lleva, en este orden:

1. **Apertura.** "Usá la skill de hyperframes para editar un reel vertical 1080×1920 a 30 fps para
   Instagram y TikTok de @vivomenu.app." El objetivo: cortar el scroll en el primer segundo y
   sostener hasta el final.
2. **Contexto.** Qué es VivoMenu en una línea (pedidos de delivery ordenados para locales de comida,
   sin comisión), qué cuenta el reel, a quién le habla, voz rioplatense.
3. **Material.** Cada archivo con su nombre. Si falta algo, no se reemplaza con stock: se resuelve
   con motion graphics de la marca y se avisa al final.
4. **Preparar.** Transcribir `voz.mp3` con los tiempos de cada palabra (esa transcripción manda);
   cortar silencios de más de 0,25 s; voz a −14 LUFS con pico de −1 dBTP; silenciar el audio de las
   grabaciones.
5. **La línea de tiempo**, un tramo por frase: voz, imagen, texto en pantalla y sonido. **El primer
   cuadro ya se mueve y tiene el texto del gancho**, enorme, de 7 palabras o menos, sin fundido ni
   negro. **El último tramo es el pedido:** la palabra escribiéndose sola en una caja de comentario
   genérica (sin logo de ninguna red) y un botón ember.
6. **Marca.**
   - Fondo noche `#100E0C` → `#221B15`, grano al 3 %, viñeta suave.
   - Ember `#F0A04B` solo para el número, la palabra clave y los recuadros de foco. Verde `#1F4A38`
     solo para "salió bien". Texto en crema `#F1EBDD`.
   - Tipografías de Google Fonts: **Big Shoulders Display** 800 para los titulares, **Schibsted
     Grotesk** 600-700 para las etiquetas, **IBM Plex Mono** 600 para horas, precios y números de
     pedido. Ninguna otra.
   - Íconos de línea en crema, trazo de 4 px.
   - Prohibido: azul o violeta, neón, emojis, letras serif o script, logos de WhatsApp, Meta,
     Instagram, TikTok, PedidosYa o Rappi.
7. **Subtítulos** (A y B con voz): palabra por palabra, bloques de 1 a 3 palabras, Schibsted Grotesk
   800 en MAYÚSCULAS de 72 a 80 px, crema con contorno `#100E0C` de 6 px; pop en cada palabra
   (0,85 → 1,08 → 1,0 en 6 cuadros); una palabra clave por bloque en ember y un 20 % más grande
   (**listá cuáles**); posición entre y = 1300 e y = 1460; zonas seguras: 220 px arriba, 440 abajo,
   130 a la derecha.
8. **Ritmo.** Un cambio visual cada 2,5 s como máximo; contadores animados en los números; íconos
   que se dibujan; recuadros ember que señalan lo que nombra la voz; transiciones de barrido de 6 a
   8 cuadros. **El final engancha con el principio.**
9. **Sonido.** Música, si hay, a −20 dB con ducking; efectos (pop, ding de pedido, whoosh) entre −12
   y −18 dB.
10. **Reglas.** No inventar textos, números ni funciones fuera del guion. Los números de una historia
    inventada llevan "ejemplo" chico al lado. Las grabaciones del sistema llevan "local de
    demostración" en un costado. Sin intro, sin logo al principio, sin placa final.
11. **Entregables.** Primero un render de los primeros 5 s para aprobarlo. Después
    `reel-NN-⟨slug⟩.mp4` (H.264, 1080×1920, 30 fps, ~15 Mbps, AAC 48 kHz), `portada.jpg` si no hay
    de Nano Banana, `reel-NN.srt` y la lista de lo que faltó.
12. **Control.** El primer cuadro se mueve; ningún tramo de más de 2,5 s sin cambio; lo que nombra la
    voz está en pantalla; nada tapado por la interfaz de Instagram; ¿en qué segundo se iría alguien?

**En el formato C el prompt es corto:** la burbuja y la hora sobre fondo noche (o el clip de Flow
desenfocado), el texto que aparece al segundo 2 o 3, música suave a −18 dB, sin subtítulos, de 7 a
10 s, **el texto se lee entero en la mitad del video** y el final empalma con el principio.

### §4 — las descripciones

- **La primera línea es un segundo gancho** de 125 caracteres o menos: contesta o da vuelta la
  frase de la voz, no la repite.
- Después, de 3 a 5 líneas cortas con lo útil. **En el formato C, acá va el valor entero:** el
  mensaje listo para copiar y por qué funciona.
- **Al final**, el pedido ("Comentá ⟨PALABRA⟩ y te armo tu carta en VivoMenu") y, si va, el de
  enviar o guardar con su motivo.
- **De 3 a 5 hashtags por tamaño** (`referencias/ganchos.md` §7), sin repetir el bloque anterior.
- **Pasala por el control de `referencias/ganchos.md` §6** y, si está, por la skill `humanizer`.
- **TikTok:** más corta, con las palabras que busca la gente ("pedidos por WhatsApp", "sistema para
  delivery", "carta digital").

### §5 — la portada

9:16, 1080×1920, todo lo importante en el recorte central de 1080×1440 (lo que muestra la grilla).
**El título es el gancho corto** (2 a 6 palabras), exacto y entre comillas, en Big Shoulders
Display o Anton, crema, con **una sola palabra o número en ember**. Fondo: foto oscura del mismo
mundo (una cocina de delivery de noche) o el fondo noche con un solo ícono de línea. Prohibido:
emojis, logos de apps, texto chico, azul o violeta.

### §6 — el recurso y los mensajes

**CARTA** (la palabra de casi todos los reels) **no tiene página:** el recurso es la demo con su
carta. Los mensajes son los del circuito (`04-contenido.md` §5):
1. Al que comentó: *"¡Hola [nombre]! Te la armo. Pasame el Instagram del local o una foto de la
   carta. Seguime así no se te pierde el mensaje."*
2. Gastón importa la carta con IA y le manda el link andando, con una pregunta de charla sobre su
   local, del rubro del reel.
3. Una o dos preguntas más (cuántos pedidos le entran un viernes, cómo los toma hoy).
4. Si encaja: *"¿Te lo dejo andando en tu local? La instalación es gratis."* Sin precio.
5. Si no tiene local: «¡Gracias!» y nada más.

Adaptá el 1 y la pregunta del 2 al reel. **Cada mensaje en su bloque de código.**

**Otra palabra** (BIENVENIDA, RESPUESTAS…): el recurso es un archivo
`marketing/contenido/recursos/⟨slug⟩.md` que se manda por mensaje directo como texto. Si ya existe,
se reutiliza; si no, se escribe: **de 150 a 400 palabras**, los mensajes listos para copiar cada uno
en su bloque, los pasos en WhatsApp Business dichos como son hoy, sin vender y **útil aunque nunca
use VivoMenu**. Arriba, en el frontmatter: `titulo`, `palabra`, `reel`, `fecha`.

### §7 — la secuencia de historias

Con el molde de `marketing/contenido/historias/README.md` §1: tres historias (el gancho con un
sticker que se toca → la tensión → el reel compartido), del mismo mundo y no la misma foto, cada
una con su prompt completo de Nano Banana y el bloque de marca de VivoMenu. La historia 1 **no copia
el gancho del reel**: es la pregunta que el reel contesta, dicha de otra forma. Las opciones de la
encuesta, las dos ciertas, sin una correcta que haga quedar mal a nadie. **Sin fundadores en esta
secuencia.** Abajo, el primer mensaje para el que respondió, que lleva al circuito de §6.

## Paso 5 — dejarlo registrado

1. **Guardá** el paquete en `marketing/contenido/reels/NN-slug.md` (y el recurso, si hubo uno nuevo).
2. **En el backlog:** la idea pasa a `generado`, y una fila en **"Generados"**: turno, NN, idea,
   archivo, recurso, `pendiente de publicar`.
3. **El panel interno:** `npm run docs:internal` (copia los paquetes y los recursos a
   `/interno-64a0f7d0`) y `npx tsc --noEmit`.
4. **Control antes de guardar:**
   - el gancho pasa la prueba del scroll leído por alguien que pide delivery;
   - la tabla "El gancho" tiene cuatro opciones de patrones distintos, y el patrón no repite el del
     reel anterior;
   - el gancho tiene 10 palabras o menos (7 en pantalla) y la voz entra en el largo del formato;
   - la descripción pasa `referencias/ganchos.md` §6; los hashtags son de 3 a 5 y no repiten;
   - el objetivo está y la semana tiene uno para guardar y uno para enviar;
   - §7 tiene las tres historias con su sticker y su texto exactos;
   - cada afirmación sobre VivoMenu está en "Lo que se dice"; lo inventado se dice inventado; los
     datos tienen dos fuentes;
   - la palabra no repite otro recurso; los bloques de código están completos.
5. **Commit y push**, solo de `marketing/contenido/` y `src/content/internal/marketing-docs.ts`:
   ```bash
   git add marketing/contenido/ src/content/internal/marketing-docs.ts
   git commit -m "Paquete del reel NN de VivoMenu: ⟨tema⟩"
   git pull --rebase && git push
   ```
   Si el push falla, queda commiteado y se avisa.
6. **El mensaje final a Gastón, corto:** qué reel, con el link al archivo; el gancho elegido, su
   patrón y su objetivo, y la mejor opción descartada; la palabra y el recurso; qué hay que grabar o
   generar; qué día salen las historias y con qué pregunta; la próxima idea de la cola.

export const guiaProduccion = `# Menú Digital — Guía de producción de contenido — v2

**Fecha:** 2026-07-28 · **Versión:** v2 (reposicionado a carrusel de valor)
**Contexto base:** \`marketing/plan-contenido.md\` v2 · construido con \`content-strategy-sms\` + \`social\` (\`references/carousel-frameworks.md\`)
**Para quién es este documento:** para armar carruseles de valor sin diseñar nada desde cero cada vez, sin filmar, y sin depender de decisiones creativas en el momento.

> **Qué cambió respecto a la v1:** la versión anterior de esta guía enseñaba a filmar el tablero del sistema en video. Gastón la objetó, con razón: eso es una demo, no contenido que ayude a nadie. Esta versión reemplaza el video por **carrusel**, que es más rápido de producir, no requiere cámara ni voz, y es el formato correcto para contenido educativo. La sección de video queda como apéndice opcional (§7), para los pocos casos donde de verdad conviene un Reel.

---

## 1. Por qué el carrusel resuelve mejor el problema real

El pedido original era: poco tiempo, y preferencia por no aparecer en cámara. El carrusel resuelve las dos cosas mejor que el video:

| | Video (v1) | Carrusel (v2) |
|---|---|---|
| Tiempo por pieza | Filmar + editar: 45-60 min | Pegar texto en plantilla: 15-20 min |
| ¿Requiere cámara/voz? | Sí, aunque sea de manos | No, nunca |
| ¿Qué tan editable con Claude? | Guion sí, pero la ejecución depende de filmar bien | **Copy completo, slide por slide, listo para pegar** |
| ¿Aporta valor sin vender? | Difícil — es demo de producto | Natural — es consejo, la mención al producto es opcional |

**El trabajo se divide así, siempre:** Claude escribe el copy exacto de cada slide del carrusel. Gastón abre la plantilla de Canva (armada una sola vez, ver §2), pega el texto en los cuadros que ya están puestos, y publica. No hay ninguna decisión de diseño que tomar cada semana — eso ya se resolvió en la plantilla.

---

## 2. La plantilla de Canva — se arma una sola vez, se reutiliza siempre

### 2.1 — Crear el proyecto base

1. Entrá a canva.com (cuenta gratuita alcanza).
2. Creá un diseño nuevo → tamaño personalizado → **1080 x 1350 px** (formato 4:5, el que mejor rinde en el feed de Instagram, según \`carousel-frameworks.md\`).
3. Vas a armar **8 páginas** dentro del mismo diseño (Canva permite múltiples páginas en un solo archivo — cada página es un slide del carrusel). Ocho alcanza para la mayoría de los carruseles de este plan; si un carrusel necesita menos, simplemente no usás todas las páginas al exportar.

### 2.2 — Colores de marca (pegar estos códigos exactos en Canva)

En Canva, al elegir el color de fondo o de texto, tocá "Códigos de color" y pegá:

| Uso | Color | Código |
|---|---|---|
| Fondo de portada y cierre | Verde botella (marca) | \`#1F4A38\` |
| Fondo de slides de contenido | Crema/parchment (fondo del sitio) | \`#F1EBDD\` |
| Texto principal sobre fondo crema | Marrón oscuro (tinta) | \`#241B14\` |
| Texto sobre fondo verde | Blanco | \`#FFFFFF\` |
| Palabra clave / número destacado | Naranja ember (acento) | \`#F0A04B\` |

### 2.3 — Tipografía (buscar estos nombres en el selector de fuente de Canva)

- **Títulos / ganchos grandes:** buscá **"Anton"** o **"Bebas Neue"** — son gratis en Canva, condensadas y fuertes, con el mismo espíritu que la tipografía de marca (Big Shoulders).
- **Texto de cuerpo:** buscá **"Schibsted Grotesk"** (está en la librería de Google Fonts que Canva ya tiene cargada). Si no aparece, usar **"Poppins"** como alternativa.
- **Números / datos destacados** (para el pilar "La cuenta simple"): buscá **"IBM Plex Mono"** — le da un aire de "número real", coherente con cómo se muestran los precios en el producto.

### 2.4 — Las tres capas de cada tipo de slide

**Slide de portada (página 1):**
- Fondo verde botella.
- Arriba, chico, en mayúsculas, color ember: la etiqueta del pilar (ej. "ERRORES QUE CUESTAN PLATA").
- Centro, grande, en blanco, fuente Anton/Bebas Neue: el título del carrusel.
- Abajo, chico: "@[tu usuario de Instagram]".

**Slide de contenido (páginas 2-7):**
- Fondo crema.
- Arriba, chico, color marrón: número de slide o etiqueta corta (ej. "Error 2 de 5").
- Centro, texto en Schibsted Grotesk, tamaño grande (mínimo 28pt para que se lea en miniatura): el contenido de esa slide.
- La palabra o número más importante de esa slide, en color ember.

**Slide de cierre (última página):**
- Fondo verde botella (mismo que portada — así el ojo entiende que el carrusel "cerró el círculo").
- El consejo final o CTA, en blanco.
- Abajo: "@[usuario]" + el link del demo o el WhatsApp, chico.

### 2.5 — Guardar como plantilla reutilizable

1. Una vez armado el diseño con estas 8 páginas y los estilos definidos, no lo publiques todavía.
2. Cada vez que haya que hacer un carrusel nuevo: abrí este diseño → botón **"Copiar"** (o "Duplicar") arriba a la derecha → te crea una copia nueva con el mismo formato, lista para escribir el texto de esa semana.
3. **Nunca se edita el diseño original.** Es la plantilla madre — se duplica siempre, así el estilo nunca se desarma por accidente.

---

## 3. Cómo se arma un carrusel, paso a paso

1. Claude te entrega el copy exacto de cada slide (ver los 4 primeros carruseles completos en §5, y el resto llega cada semana — ver §6).
2. Duplicás la plantilla (§2.5).
3. Slide por slide, seleccionás el cuadro de texto que ya está puesto y pegás el texto correspondiente — **no hace falta mover nada, ni elegir tamaños, ni decidir dónde va cada cosa.**
4. Si una slide de contenido tiene una palabra para destacar en ember, la seleccionás sola dentro del cuadro de texto y le cambiás el color (Canva permite formatear parte de un texto).
5. Exportar: botón "Compartir" → "Descargar" → tipo de archivo **"PNG"** → activar "Descargar todas las páginas". Te da un PNG por slide, numerados en orden.
6. Subís el carrusel a Instagram en ese mismo orden, con el caption que te da Claude (nunca el mismo texto de la portada — el caption es un segundo gancho, ver §6).

**Tiempo total, una vez que ya hiciste esto una vez:** 15-20 minutos por carrusel.

---

## 4. Reglas de contenido — para que ningún carrusel se sienta publicidad

1. **Cada carrusel tiene que servir aunque el que lo lea nunca compre nada.** Si un consejo solo tiene sentido para alguien que va a instalar el sistema, no es el consejo correcto para esta cuenta.
2. **En el pilar "La cuenta simple", los números son siempre un ejemplo, nunca una estadística real inventada.** Se dice explícitamente "ejemplo" o "hagamos la cuenta" — nunca se afirma "el 40% de los locales pierde plata así" sin una fuente real. Inventar ese dato para que suene más convincente es exactamente el tipo de cosa que después se cae en la primera visita si alguien pregunta de dónde salió.
3. **El producto aparece como mucho en la última slide, y solo si viene al caso.** La mayoría de los carruseles no necesitan mencionarlo — el valor es el consejo, no el pretexto para hablar del sistema.
4. **Un pilar, un formato.** No mezclar la estructura de Hack List con la de Problem-Proof en el mismo carrusel — cada pilar tiene su forma (ver \`plan-contenido.md\` §1) y mezclarlas confunde el ritmo de lectura.

---

## 5. Los primeros 4 carruseles — copy completo, listo para pegar

Esto responde a "ni siquiera sé cómo grabar el primer video" trasladado a carruseles: acá no hay que redactar nada, solo pegar.

### Carrusel 1 — "5 errores que te hacen perder pedidos por WhatsApp"
**Pilar:** Errores que cuestan plata · **Formato:** Hack List · **8 slides**

\`\`\`
SLIDE 1 (portada, fondo verde):
Etiqueta: ERRORES QUE CUESTAN PLATA
Título: 5 errores que te hacen perder pedidos por WhatsApp

SLIDE 2 (problema):
No es que a tus clientes no les guste tu comida. Es que en el momento
que más pedidos entran, es el momento que menos tiempo tenés para
contestar bien.

SLIDE 3:
Error 1 — No decir cuánto tarda.
El cliente que no sabe si son 20 minutos o una hora, cancela y prueba
en otro lado.

SLIDE 4:
Error 2 — Cobrar el envío recién al final.
Se siente como un cargo escondido, aunque no lo sea.

SLIDE 5:
Error 3 — No tener un lugar fijo para anotar "sin cebolla", "bien
cocido", etc.
Se pierden siempre en el mismo punto: entre el pedido y la cocina.

SLIDE 6:
Error 4 — Un solo número de WhatsApp para pedidos, proveedores y
todo lo demás.
El pedido se mezcla con el resto y tarda más en verse.

SLIDE 7:
Error 5 — Preguntar la forma de pago cuando el pedido ya está armado.
Si paga con tarjeta y no aceptás, ya perdiste los 5 minutos de armar
todo de nuevo.

SLIDE 8 (cierre, fondo verde):
Ninguno de estos errores es de mala atención. Son de sistema.
Guardá este carrusel para revisar cuál te está pasando a vos.
@[usuario]
\`\`\`

**Caption sugerido (no repite la portada):**
"Los viernes a la noche no perdés pedidos porque tu comida no guste. Los perdés por estos 5 motivos, y los 5 se arreglan. Guardalo para cuando tengas 5 minutos."

---

### Carrusel 2 — "3 errores de carta que te hacen perder plata sin darte cuenta"
**Pilar:** Errores que cuestan plata · **Formato:** Hack List · **6 slides**

\`\`\`
SLIDE 1 (portada, fondo verde):
Etiqueta: ERRORES QUE CUESTAN PLATA
Título: 3 errores de carta que te hacen perder plata sin darte cuenta

SLIDE 2 (problema):
La carta no es un trámite. Es lo primero — a veces lo único — que tu
cliente ve antes de decidir cuánto gasta.

SLIDE 3:
Error 1 — Menú sin fotos.
La gente pide lo que ve, no lo que lee. Un plato sin foto compite en
desventaja contra el de al lado que sí tiene.

SLIDE 4:
Error 2 — La carta vieja pegada arriba de la nueva.
Genera desconfianza justo en el momento de decidir cuánto gastar.

SLIDE 5:
Error 3 — No avisar que un plato se agotó.
El cliente lo pide, espera, y recién ahí se entera. Ya perdiste el
momento.

SLIDE 6 (cierre, fondo verde):
Los tres se resuelven sin gastar en imprenta: una carta que se
actualiza en el momento. Guardá esto para cuando armes la próxima
carta.
@[usuario]
\`\`\`

**Caption sugerido:**
"Antes de subir precios de nuevo, mirá si tu carta no te está costando plata por estos tres motivos."

---

### Carrusel 3 — "4 datos que necesitás pedir siempre en un pedido de delivery"
**Pilar:** Cómo se hace · **Formato:** Value-Stack · **6 slides**

\`\`\`
SLIDE 1 (portada, fondo verde):
Etiqueta: CÓMO SE HACE
Título: 4 datos que necesitás pedir siempre en un pedido de delivery
(y en qué orden)

SLIDE 2:
Dato 1 — Qué pide, con las variantes exactas ("sin cebolla", "bien
cocido") antes de hablar de precio.

SLIDE 3:
Dato 2 — Dirección completa, con un punto de referencia.
"Cerca de la plaza" no alcanza a las 21:30.

SLIDE 4:
Dato 3 — Forma de pago, antes de confirmar el pedido, no después.

SLIDE 5:
Dato 4 — Teléfono de contacto, aunque ya te esté escribiendo por ahí.
Sirve si el cadete no encuentra la dirección.

SLIDE 6 (cierre, fondo verde):
En ese orden, no en otro: si preguntás el pago antes que la
dirección, tenés que volver para atrás. Guardalo para tu mostrador.
@[usuario]
\`\`\`

**Caption sugerido:**
"El orden en el que pedís los datos importa tanto como pedirlos. Guardá esta lista para tu mostrador."

---

### Carrusel 4 — "¿Cuánto te está costando la comisión de delivery?"
**Pilar:** La cuenta simple · **Formato:** Problem-Proof (números de ejemplo) · **6 slides**

\`\`\`
SLIDE 1 (portada, fondo verde):
Etiqueta: LA CUENTA SIMPLE
Título: ¿Cuánto te está costando la comisión de delivery?
Hagamos la cuenta con tus números, no con los míos.

SLIDE 2:
La comisión no se siente cara pedido por pedido. Se siente cara
cuando la sumás en un mes — y casi nadie la suma.

SLIDE 3:
Ejemplo: pedido de $10.000, comisión del 25% = $2.500 que no llegan
a tu bolsillo.

SLIDE 4:
Si tenés 20 pedidos por semana por esa vía:
$2.500 x 20 = $50.000 por semana.

SLIDE 5:
$50.000 x 4 semanas = $200.000 al mes.
De ese pedido puntual, no de toda tu facturación.

SLIDE 6 (cierre, fondo verde):
Hacé la cuenta con tu comisión real y tu volumen real — el número te
va a sorprender más de lo que pensás. Guardalo y probalo este fin de
semana.
@[usuario]
\`\`\`

**Caption sugerido:**
"No hace falta que me creas el número. Hacé la cuenta con el tuyo — tardás dos minutos y capaz te sorprende."

---

## 6. Qué prepara Claude cada semana

Antes de cada tanda semanal, Claude entrega, listo para copiar y pegar:

| Entregable | Formato | Vos solo tenés que... |
|---|---|---|
| Copy completo de cada slide, como en §5 | Texto, copiar/pegar en Canva | Pegar, no redactar |
| Caption (distinto al título de portada) | Texto, copiar/pegar | Pegar al publicar |
| Hashtags sugeridos | Texto | Pegar |
| Qué palabra destacar en ember en cada slide | Indicado dentro del guion | Seleccionar y cambiar color |

**Lo único que ninguna IA hace por vos:** abrir Canva, pegar el texto, y tocar publicar. Con la plantilla ya armada, son 15-20 minutos, sin ninguna decisión creativa pendiente.

### Semana "modo mínimo"
Si una semana no da ni para eso: un solo carrusel de 4 slides (portada + 2 de contenido + cierre) sigue siendo mejor que nada, y entra en el mismo tiempo que lleva escribir un buen comentario en Instagram.

---

## 7. Apéndice — Reels ocasionales (opcional, 5% del contenido)

Esto es secundario y no hace falta usarlo nunca si no querés. Se activa solo cuando un carrusel ya publicado tuvo buena repuesta (guardados altos) y tiene sentido convertirlo en video corto.

**Cómo, sin filmar nada nuevo:**
1. En CapCut, importá las mismas imágenes PNG del carrusel que ya exportaste de Canva.
2. Armalas en la línea de tiempo, 2-3 segundos cada una.
3. Agregá una transición simple entre cada una (CapCut trae transiciones prearmadas, elegí cualquiera del estilo "corte" o "deslizar" — nada llamativo).
4. Exportá igual que un video normal (1080x1920 — vas a tener que recortar el 4:5 original al centro, CapCut lo hace automático al elegir el formato de exportación vertical).

**Nunca hace falta grabarte ni grabar el local para esto.** Es 100% reciclado del carrusel que ya funcionó.

---

## Changelog
- v2 (2026-07-28) — **Reescritura completa**, a pedido explícito de Gastón: reemplaza el enfoque de video/demo de producto (v1) por producción de carruseles de valor. Agrega la plantilla de Canva reutilizable con colores y tipografías de marca, 4 carruseles completos listos para publicar (slide por slide), y reglas explícitas contra estadísticas inventadas en el pilar de cálculos. La sección de video queda como apéndice opcional, no como formato principal.
- v1 (2026-07-28) — Documento inicial (reemplazado como enfoque principal).
`;

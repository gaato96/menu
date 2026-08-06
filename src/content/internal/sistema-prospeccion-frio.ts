export const sistemaProspeccionFrio = `# VivoMenu — Sistema de prospección en frío

**Fecha:** 2026-08-06 · **Versión:** v1
**Contexto base:** \`prospeccion.md\` v2 (a quién) · \`mensajes-en-frio.md\` (variantes de copy por señal) · \`plan-marketing.md\` §4 Movida 1
**Qué agrega este documento:** la mecánica de ejecución. \`prospeccion.md\` define a quién escribirle y \`mensajes-en-frio.md\` tiene el texto; acá está **cómo se opera**: el problema del empleado que contesta, el riesgo de que te bloqueen el número, cómo usar el scraper, la escalera completa con sus ramas, la oferta de valor gratuita y cuántos mensajes por día.

---

## 1. La restricción que manda todo: quién lee el mensaje

**El que abre ese WhatsApp casi nunca es el dueño.** Es el que toma los pedidos: el del mostrador, la hija, el encargado del turno. Eso no es un obstáculo a esquivar — es el dato más importante del sistema, y cambia el diseño del primer mensaje entero.

Tres cosas que se derivan de eso:

**1.1 — El empleado está en modo pedido, no en modo conversación.**
Ese chat existe para que entren pedidos. Cuando llega un mensaje de un número desconocido, el reflejo es leerlo como un cliente que va a pedir. Si tu primer mensaje no aclara en la primera línea que no sos un cliente, le hacés perder tiempo y arrancás en negativo.

**1.2 — El empleado no puede decir que sí, pero sí puede decir que no.**
No tiene poder de compra, pero tiene poder de veto: si decide que sos spam, el mensaje muere ahí y el dueño nunca se entera. Todo el primer mensaje se juega en no activar ese veto.

**1.3 — Y sin embargo, el empleado es el usuario real del producto.**
Este es el desbloqueo. El que sufre el WhatsApp desordenado un viernes a las 21:00 **es él**, no el dueño. VivoMenu le saca trabajo a él directamente. Si el primer mensaje le hace pensar *"esto me sacaría laburo a mí"*, deja de ser un filtro y pasa a ser tu mejor vendedor interno — porque se lo va a pasar al dueño con una recomendación adentro, que vale diez veces más que tu mensaje.

> **Regla que sale de acá:** el primer mensaje se escribe **para que lo lea el empleado**, aunque esté dirigido al dueño. Tiene que ser reenviable sin vergüenza y entendible por alguien que no decide nada.

**Lo que NO se hace:** fingir ser cliente para que contesten, pedir "el número personal del dueño", o tratar al empleado como un trámite ("necesito hablar con el responsable"). Las tres queman el contacto y, en una ciudad de este tamaño, se cuentan.

---

## 2. Riesgo operativo: que no te bloqueen el número

Esto no está en ningún otro documento y es lo que puede hacer fracasar todo lo demás. **WhatsApp bloquea números que mandan muchos mensajes a gente que no los tiene agendados.** No hay un umbral publicado, pero los disparadores conocidos son:

| Disparador | Cómo se evita |
|---|---|
| Muchos mensajes a números no agendados en poco tiempo | Rampa gradual (§7). Nunca 50 el primer día |
| Texto idéntico copiado y pegado | Cada mensaje cita una señal distinta. Es lo mismo que ya exige \`mensajes-en-frio.md\` §Regla 1 — resulta que además te protege el número |
| Tasa alta de "reportar spam" o bloqueos de los que reciben | Se baja con personalización real y con no insistir más de los 4 toques |
| Número nuevo, sin historial, mandando en volumen desde el día 1 | Calentarlo: primeras 2 semanas a la mitad del volumen objetivo |
| Enviar link en el primer mensaje desde un número frío | Riesgo real pero **el link es demasiado valioso para sacarlo**. Se compensa con volumen bajo y personalización |

**Decisiones concretas:**

- **Usar WhatsApp Business, no WhatsApp normal.** Perfil con nombre "VivoMenu", categoría, foto (el logo), y descripción. Un perfil comercial completo baja mucho la lectura de "spam": el que recibe ve un negocio real, no un número pelado.
- **Un solo número, el de siempre (3815976357).** No comprar chips para rotar — eso es exactamente el patrón que WhatsApp busca, y además tu número ya tiene historial legítimo, que es un activo.
- **Si te bloquean, no es el fin del mundo, pero es una señal.** Un bloqueo aislado es normal. Tres en una semana significa que el mensaje está leyéndose como spam y hay que reescribirlo, no bajarle el volumen y seguir igual.

### Instagram DM: úsalo como segunda opción, no como primera

Dos problemas concretos:

1. **La carpeta de solicitudes.** Un DM de una cuenta que el local no sigue cae en "Solicitudes", que muchos negocios no abren nunca. La tasa de lectura real es bastante peor que WhatsApp.
2. **@vivomenu.app es una cuenta nueva con 1 posteo.** Si el dueño entra a ver quién le escribió y encuentra una cuenta con 1 publicación y 3 seguidores, la credibilidad juega en contra. Además, las cuentas nuevas tienen los límites de DM más agresivos de Instagram.

**Regla:** si el local tiene WhatsApp público, se escribe por WhatsApp. Instagram DM queda para los que **solo** tienen Instagram. Y no se manda ningún DM en frío desde @vivomenu.app hasta que tenga al menos 6-8 carruseles publicados — o sea, alrededor de la semana 3. Hasta entonces, si hay que usar Instagram, se usa desde la cuenta personal de Gastón, que sí tiene historial humano.

---

## 3. Scraping de Google Maps: sí, con reglas

**Respuesta corta: sí, hacelo.** Es la forma correcta de resolver el problema que tenés. Pero hay que entender exactamente qué problema resuelve y cuál no.

### 3.1 — Qué te da y qué no

| El scraper te da | El scraper NO te da |
|---|---|
| **Volumen**: 200-400 locales de la zona en 20 minutos, algo que a mano son días | **El gancho del mensaje.** Ningún campo del CSV sirve para la primera línea personalizada |
| **Campos de descarte automático**: categoría, cantidad de reseñas, rating, si tiene web, si está cerrado | **Si es de una sola sucursal** (hay que mirar, aunque los nombres repetidos ayudan) |
| **Un teléfono** para empezar | **Si ese teléfono es WhatsApp.** Muchas fichas tienen fijo |
| **El texto de las reseñas**, si tu scraper las trae — esto vale oro (§3.3) | **Las señales de Instagram** (\`prospeccion.md\` §4), que siguen siendo manuales |

Traducido: **el scraper reemplaza el Paso 1 y 2 de \`prospeccion.md\` §5 (el barrido y el filtro), no el Paso 3 (la pasada de señales).** Eso ya es un ahorro enorme: el barrido a mano son 15 min por tanda de 20; el scraper te deja 300 filas de una.

**Sobre lo legal y lo ético:** son datos públicos de negocios (no personales), sacados de una ficha que el propio local publicó para que lo contacten. Es exactamente lo mismo que harías a mano, más rápido. Se mantienen las reglas de \`prospeccion.md\` §13: solo canales públicos del negocio, se guarda de dónde salió cada contacto y cuándo, y nada de mensajes masivos idénticos.

### 3.2 — El embudo de descarte, en orden de costo

La clave es **descartar con lo barato antes de gastar lo caro**. El recurso escaso no es el CSV: es tu tiempo mirando Instagram uno por uno (2-3 min cada uno). Así que el orden importa.

\`\`\`
300 filas del scraper
  │
  ├─ Descarte 1 (automático, 5 min con filtros de planilla) ──────► ~120
  │   • Categoría fuera del ICP (kiosco, panadería de paso, heladería,
  │     supermercado, dietética, catering de eventos)
  │   • "Permanentemente cerrado"
  │   • Nombre repetido 2+ veces = cadena → fuera (no hay multi-sucursal)
  │   • Menos de 15 reseñas → volumen probablemente muy bajo
  │
  ├─ Descarte 2 (visual rápido, 15 min) ─────────────────────────► ~60
  │   • Sin teléfono ni Instagram en la ficha → no hay por dónde entrar
  │   • Rating < 3.0 con muchas reseñas → local con problemas de fondo
  │     que un menú digital no arregla
  │
  └─ Investigación manual (2-3 min c/u, ~2-3 h en total) ────────► LISTA VIVA
      • Abrir Instagram, buscar las señales de prospeccion.md §4
      • Sacar captura de la señal
      • Confirmar el WhatsApp del día
      • Puntuar y ordenar
\`\`\`

**60 prospectos investigados = 5-6 semanas de mensajes al ritmo del §7.** No hace falta investigar 300. Investigá 60, empezá a mandar, y volvés al CSV cuando se te acabe.

### 3.3 — El campo que casi nadie usa: las reseñas de Google

Si tu scraper trae el texto de las reseñas, tenés una mina de ganchos personalizados **sin tener que abrir un solo Instagram**. Buscá con Ctrl+F en la columna de reseñas:

\`tardaron\` · \`demora\` · \`esperamos\` · \`no atendieron\` · \`me equivocaron el pedido\` · \`vino frío\` · \`no contestan\` · \`pedí por whatsapp\` · \`nunca llegó\`

Una reseña de un cliente real quejándose de la demora en tomar el pedido es **la señal más fuerte que vas a conseguir**, más que cualquier cosa de Instagram, porque es prueba pública y verificable del dolor exacto que resolvés. Y da una primera línea imbatible:

> Hola. Leí una reseña de junio en Google donde un cliente contaba que esperó 40 minutos a que le tomaran el pedido un sábado.

Eso no se puede confundir con spam. Nadie manda spam habiendo leído tus reseñas.

⚠️ **Con cuidado:** se cita el hecho, nunca se restriega. "Leí que..." y seguís. Jamás "tenés reseñas malas" — eso es atacar al dueño en su punto sensible y el chat se termina ahí.

### 3.4 — Las columnas de tu planilla

Al CSV del scraper agregale estas columnas a mano. Es el registro de \`prospeccion.md\` §12, adaptado:

\`segmento (A/B) · señales detectadas · captura · fuente de la señal · canal de contacto + fecha en que se verificó · fecha del mensaje · variante usada · respondió (sí/no/fecha) · quién respondió (dueño/empleado) · nivel de interés · visita agendada · resultado · próximo paso · fecha del próximo paso\`

La columna **"quién respondió"** es nueva y vale la pena: a las 4 semanas vas a saber si tu mensaje funciona mejor cuando lo lee un empleado o cuando lo lee el dueño, y eso te dice qué reescribir.

---

## 4. La pregunta central: ¿"Hola" solo, todo junto, o pedir permiso?

Planteaste tres opciones. Las tres tienen nombre y la respuesta no es obvia, así que va con el razonamiento.

### Opción A — Mandar "Hola" y esperar

**No. Y en tu caso específico es peor que en general.**

Le escribís a un número que existe para tomar pedidos. Un "Hola" pelado de un desconocido lo lee como un cliente que va a pedir. Te van a contestar — la tasa de respuesta a un "Hola" es alta, por eso circula como táctica — pero es una **respuesta falsa**: el empleado dejó lo que estaba haciendo pensando que era una venta suya. Cuando en el segundo mensaje aparece que sos vos vendiendo algo, la sensación es de haber sido engañado, en el peor momento posible (mientras atiende).

Cambiaste una métrica linda (tasa de respuesta) por la única que importa (conversaciones reales), y encima arrancás debiéndole algo a la persona que necesitás como aliada. En una plaza de este tamaño, no.

### Opción B — Todo en el primer mensaje

**Tampoco, si "todo" significa explicar el producto.** Un muro de texto en el chat de pedidos no se lee. Y explicar VivoMenu con palabras siempre pierde contra mostrarlo — es la regla 4 de \`mensajes-en-frio.md\`, y sigue vigente.

### Opción C — Pedir permiso para mandar algo a su favor

**Esta es la correcta, con una corrección importante.**

La corrección: **no pidas permiso para mandar el link. Mandalo.** Pedir permiso para mandar algo suena a vendedor entrenado ("¿te puedo hacer una pregunta?") y agrega un paso donde te pueden decir que no. El link del demo no le cuesta nada al que lo recibe y es tu única prueba — que exista en su chat vale más que su permiso previo.

**Dónde sí va el permiso:** en el paso siguiente, el que sí tiene costo para él. No "¿te puedo mandar algo?", sino **"¿te armo el tuyo?"** o **"¿paso a mostrártelo?"**. Ahí el sí o el no significan algo.

### El formato que sale de todo esto

**Dos burbujas, mandadas seguidas, sin esperar respuesta entre medio.** Es la forma en que escribe una persona en WhatsApp — nadie manda un párrafo perfecto de una sola vez.

- **Burbuja 1 (2-3 líneas):** quién sos + por qué le escribís *a él* (la señal) + qué hacés, en una oración.
- **Burbuja 2 (2 líneas):** el link + la pregunta de sí o no.

La primera burbuja tiene que hacer tres trabajos a la vez, y en este orden: desactivar el modo pedido, probar que miraste su local, y ser reenviable al dueño sin vergüenza.

---

## 5. La escalera completa

### Peldaño 1 — Primer contacto (día 0)

Las variantes por señal están en \`mensajes-en-frio.md\` §1 y siguen sirviendo — **actualizá los links a \`vivomenu.com.ar/m/burger-house-tuc\`**, que todavía dicen el dominio viejo. Lo que cambia acá es el envoltorio, para que funcione con el empleado como lector:

**Plantilla base (adaptar la línea de la señal):**

> Hola. No es un pedido, disculpá — te escribo por otra cosa.
>
> Soy Gastón, de acá de Tucumán. Vi que [SEÑAL CONCRETA]. Hago un link donde el cliente ve la carta con fotos, arma el pedido con los agregados, y te llega a este mismo WhatsApp ya escrito y prolijo.

*(segunda burbuja, enseguida)*

> Este es uno real, tocalo como si fueras un cliente: vivomenu.com.ar/m/burger-house-tuc
>
> ¿Este WhatsApp lo lleva el dueño, o se lo puedo pasar por acá?

**Por qué cada parte:**

| Línea | Trabajo que hace |
|---|---|
| "No es un pedido, disculpá" | Desactiva el modo pedido en el primer segundo. Le devuelve el tiempo que le estabas por sacar. Cuesta 5 palabras |
| "Soy Gastón, de acá de Tucumán" | Nombre y lugar. Un desconocido con nombre y ciudad no es un bot |
| "Vi que [señal]" | La prueba de que miraste. Es lo único que separa esto de spam |
| "te llega a **este mismo** WhatsApp ya escrito" | Habla del dolor del que está leyendo, no del dueño. Acá es donde el empleado piensa "esto me sirve a mí" |
| El link | Prueba que no depende de que nadie conteste. Va temprano, siempre |
| "¿lo lleva el dueño, o se lo puedo pasar por acá?" | Una pregunta, dos salidas fáciles, ninguna te deja sin próximo paso. No es "¿está el dueño?", que se contesta "no" y muere |

### Peldaño 2 — Según quién contestó

**Rama A — Contestó el empleado ("no, soy el encargado" / "se lo paso")**

Esta rama vale más de lo que parece. No lo trates como un trámite:

> Buenísimo, gracias. Y ya que sos vos el que atiende esto: lo que hace es que el pedido te llega armado, con los agregados y la dirección adentro, en vez de tener que ir preguntando de a uno.
>
> Si se lo pasás y quiere verlo, decile que en dos minutos se lo muestro andando. O pasame vos un horario y voy.

Le diste **una frase corta que puede repetir de memoria** ("el pedido te llega armado en vez de preguntar de a uno"). Eso es lo que necesita para pasarlo bien.

**Rama B — Contestó el dueño**

Al grano, con una pregunta de calificación disfrazada de conversación:

> Bien. Contame una cosa, para no hacerte perder tiempo: un viernes a la noche, ¿los pedidos te entran más por acá o por PedidosYa?

La respuesta te dice el segmento, el volumen y si ya está pagando comisión, en un solo mensaje. Y no es una pregunta de vendedor: es la pregunta que le haría cualquiera del rubro.

**Rama C — Silencio**

Siguen los toques 2, 3 y 4 de \`mensajes-en-frio.md\` §2 (día 3, día 7, día 14), sin cambios. Cada uno aporta algo nuevo o no se manda.

### Peldaño 3 — De interés tibio a compromiso

Cuando dice algo tipo *"ah, interesante"* / *"mandame info"* / *"¿cómo es?"*, ese es el momento de la oferta de valor (§6), no de explicar más:

> Mejor que explicártelo: pasame una foto de tu carta y te armo el tuyo con 5 o 6 productos, para que lo veas con tus precios y no con los de otro. Te lo mando y lo mirás cuando puedas. Sin compromiso, si no te gusta lo bajo.

Eso convierte una conversación en un intercambio: te da algo (la carta) y espera algo. Ya no es un desconocido vendiendo.

### Peldaño 4 — De compromiso a visita agendada

Cuando ya vio su propio menú armado:

> ¿Te parece si paso y te lo dejo funcionando de verdad, con toda la carta y las fotos? Son 40 minutos y lo usás un fin de semana. Si no te sirvió, lo sacamos.
>
> ¿Te va martes a las 16, o jueves a esa hora?

**Dos horarios concretos, nunca "¿cuándo te viene bien?".** Una pregunta abierta obliga a pensar y se pospone; dos opciones se contestan con una palabra.

### El mapa completo

\`\`\`
P1  Primer contacto (2 burbujas, señal + link + pregunta)
     │
     ├─ Empleado ──► frase reenviable + pedir horario ──┐
     ├─ Dueño ─────► pregunta de calificación ──────────┤
     └─ Silencio ──► toque 2 (día 3) ──► toque 3 (día 7)│──► toque 4 (día 14) ──► archivo 4 meses
                                                         │
P3   Interés tibio ◄─────────────────────────────────────┘
     │
     └─► "pasame la carta, te armo el tuyo" ──► manda foto ──► se lo armás (§6)
                                                                    │
P4                                                                  └─► "¿martes 16 o jueves 16?"
                                                                            │
                                                                            └─► VISITA
\`\`\`

---

## 6. La oferta de valor gratuita: cuál sí y cuál no

Preguntaste si conviene dar algo gratis. **Sí, y es probablemente la palanca más fuerte que tenés** — pero la forma importa muchísimo.

### ❌ Lo que NO funciona con este público: la guía en PDF

"Descargá la guía: 7 formas de vender más por WhatsApp." Es el lead magnet de manual y acá no sirve, por tres razones:

1. **Nadie descarga un PDF en un chat de pedidos.** El formato pertenece a otro mundo (el del que lee newsletters en la oficina), no al del dueño de una pizzería que contesta el celular entre dos comandas.
2. **No prueba nada sobre vos.** Cualquiera puede escribir una guía. Peor: si la guía es buena, demuestra que sabés escribir, no que tu sistema funciona.
3. **Ya está descartado en tu propio plan.** \`mensajes-en-frio.md\` §5 lo dice explícito: *"nunca mandar un PDF. El demo es mejor que cualquier cosa que se pueda escribir."*

### ✅ Lo que sí funciona: **el producto armado con sus datos**

**El regalo es el menú de él, ya construido, con sus platos y sus precios, en un link que anda.**

Por qué es la jugada correcta:

- **Es imposible de ignorar.** Ver tu propia hamburguesa con tu propio precio en una pantalla que funciona no se parece a nada que te pueda mandar un vendedor.
- **El costo es tuyo, no de él.** Con una foto de la carta, cargar 5-6 productos son 20-30 minutos con Claude. Ese es exactamente el tipo de trabajo que vos podés delegar y tus competidores no.
- **Elimina el salto de imaginación.** El demo de Burger House pide un esfuerzo: "imaginate que esto es tu local". El suyo no pide nada.
- **Genera reciprocidad sin manipular.** Le hiciste un trabajo real. No es un truco de vendedor, es trabajo.
- **Y es el mismo trabajo que la instalación.** Si cierra, ese menú a medio cargar ya es el arranque del paso 3 de la activación (\`plan-marketing.md\` §5). No es tiempo tirado.

**Las tres reglas para no arruinarlo:**

1. **Solo después de que contestó**, nunca en el primer mensaje. Armarle el menú a alguien que no te habló es invasivo (usaste sus fotos sin pedirle) y encima no escala: son 30 min a ciegas.
   *Excepción:* los 3-5 prospectos de máxima prioridad de toda la lista. A esos sí, armáselo antes y mandáselo hecho. Es tu mejor tiro.
2. **Parcial a propósito.** 5-6 productos, no la carta entera. Que se note que es una muestra y que falta la mitad — el que quiere ver el resto tiene que contestar. Una carta completa gratis también te saca el motivo para la visita.
3. **Decilo como boceto y ofrecé bajarlo.** *"Te armé un boceto, si no te gusta lo bajo ahora mismo."* Elimina la incomodidad de "¿este tipo publicó mi carta?".

### ✅ La versión barata: el chequeo de 3 puntos

Para cuando no querés invertir 30 minutos todavía (o el local no tiene carta visible). Es un mensaje, no un documento:

> Hice la prueba de pedirte como cliente, para ver dónde se traba. Tres cosas que vi:
>
> 1. La carta está como foto en el destacado — se lee, pero hay que agrandar para los precios.
> 2. Los agregados no están escritos en ningún lado, hay que preguntarlos.
> 3. En los comentarios del post del martes hay dos personas preguntando si hacen delivery a Yerba Buena.
>
> Ninguna de las tres es grave sola. Juntas son pedidos que se caen antes de empezar.

Cuesta 5 minutos, es específico, es honesto, y **crea el problema en la cabeza del dueño sin nombrar tu producto una sola vez.** Es el mejor mensaje de segundo toque que podés mandar.

⚠️ Ojo con el tono: son observaciones, no una corrección. Nada de "estás perdiendo plata por esto". Contás lo que viste y lo dejás ahí.

---

## 7. Cuántos mensajes por día

### 7.1 — Primero, una corrección al calendario

Dijiste martes, jueves y sábado para VivoMenu. **Martes y jueves son perfectos. El sábado es el peor día de la semana para escribirle a un local gastronómico** — es su día de máxima facturación, nadie va a leer con atención, y un mensaje comercial ese día directamente molesta. \`mensajes-en-frio.md\` §6 ya lo dice: nunca viernes ni sábado después de las 19:00.

**Propuesta: el sábado no se manda, se prepara.**

| Día | Trabajo VivoMenu | Horario |
|---|---|---|
| **Martes** | Primeros contactos + seguimientos + responder | 15:00–18:00 |
| **Jueves** | Primeros contactos + seguimientos + responder | 15:00–18:00 |
| **Sábado** | **Sin envíos.** Investigación: descarte del CSV, pasada de señales en Instagram, capturas, armar los mensajes del martes | Cuando puedas |

Esto no baja el volumen — lo sube. Al llegar el martes ya tenés 12 mensajes escritos y listos para copiar, adaptar y mandar: el martes se convierte en pura ejecución. Los sábados son además el mejor día para investigar, porque el Instagram de los locales está más activo (publican el especial del finde, los comentarios de gente preguntando precio están frescos).

*Si un sábado querés hacer algo de contacto: responder conversaciones ya abiertas, sí. Iniciar en frío, no.*

### 7.2 — La rampa

El volumen no arranca en el techo. Dos razones: calentar el número (§2) y darte margen para corregir el mensaje antes de quemar 100 prospectos con una versión mala.

| Semana | Por día de envío | Por semana | Por qué |
|---|---|---|---|
| **1** (esta) | **5** | 10 | Calentar el número y ver qué contestan. Con 10 mensajes ya sabés si el copy respira |
| **2** | 8 | 16 | Ajustado el mensaje con lo aprendido |
| **3** | 10 | 20 | Ya entra en el rango del plan |
| **4 en adelante** | **12** | **24** | Techo. Coincide con los 20-25/semana de \`prospeccion.md\` §2 |

**Por qué 12 y no 20 por día:** el límite real no es el tiempo de escribir — es el seguimiento. Cada primer contacto genera hasta 3 toques más y, si contesta, una conversación. En la semana 5, un día de envío de 12 nuevos arrastra además ~20 seguimientos y 3-4 conversaciones vivas. Eso ya son las 3 horas completas. Mandar 20 nuevos por día significa dejar de seguir a los de la semana pasada, y **el seguimiento convierte más que el primer contacto.**

### 7.3 — Cómo se reparten las 3 horas de un día de envío (semana 4+)

| Bloque | Tiempo | Qué |
|---|---|---|
| Responder lo abierto | 45 min | Primero siempre. Un dueño que contestó ayer y no tiene respuesta hoy, se enfría |
| Seguimientos (toques 2-4) | 25 min | ~20 mensajes, ya escritos, 1 min c/u |
| Primeros contactos | 60 min | 12 mensajes, 5 min c/u (adaptar el preparado del sábado + mandar + registrar) |
| Armar un menú de regalo | 30 min | Para el prospecto más caliente de la semana (§6) |
| Registrar en la planilla | 20 min | La columna "próximo paso con fecha" no se deja vacía |

### 7.4 — Hoy, jueves 6 de agosto: **5 mensajes**

Es tu primer día de envío y el objetivo de hoy no es vender, es **aprender si el mensaje funciona**. Cinco mensajes bien hechos a los cinco mejores prospectos que tengas.

Hoy, en orden:

1. **Los tibios primero.** Si de la cartera de Galu salió algún contacto del rubro, esos cinco son esos. No compiten en el mismo embudo (\`prospeccion.md\` §7) y te dan lectura rápida.
2. Si no hay tibios, los 5 con más señales de tu lista.
3. Antes de mandar, actualizá los links: las plantillas de \`mensajes-en-frio.md\` todavía dicen \`menu-digital.com\`, y ahora es **\`vivomenu.com.ar/m/burger-house-tuc\`**. Un link roto en el primer mensaje mata el contacto.
4. Verificá el perfil de WhatsApp Business (nombre VivoMenu, logo, descripción) antes del primer envío. Es lo primero que van a tocar.

**A las 3 semanas, con ~46 mensajes acumulados, hay datos suficientes para recalcular las tasas del embudo de \`prospeccion.md\` §2 con números reales en vez de estimados.**

---

## 8. Las tres métricas, y una cuarta nueva

Las tres de siempre (\`prospeccion.md\` §2): mensajes enviados, respuestas obtenidas, visitas agendadas.

**La cuarta, que solo se puede medir con este sistema: cuántos menús de regalo armaste, y cuántos de esos terminaron en visita.** Si la conversión de "le armé el menú" a "me recibió" es alta, esa es la actividad que hay que multiplicar, aunque sea la que más tiempo lleva. Si es baja, se corta y se vuelve al chequeo de 3 puntos, que es diez veces más barato.

---

## 9. Los cinco errores que arruinan esto

1. **Mandar el mismo mensaje a 12 locales cambiando el nombre.** Se nota, no convierte, y encima es lo que hace que WhatsApp te marque.
2. **Contestar tarde al que sí contestó.** Un dueño que preguntó algo el martes y le respondés el jueves ya se olvidó. Responder lo abierto va antes que mandar nuevos, siempre.
3. **Dar el precio por chat antes de mostrar nada.** Ya está resuelto en \`mensajes-en-frio.md\` §5, pero es el error más fácil de cometer bajo presión: el número solo, sin el producto al lado, es caro por definición.
4. **Insistir más de los 4 toques.** En Tucumán la reputación vale más que cualquier venta, y el que hoy dice que no le pregunta al de al lado en seis meses.
5. **Escribir sin haber mirado.** Si la primera línea funciona igual para cualquier local, no hay personalización — hay volumen disfrazado.

---

## Changelog
- v1 (2026-08-06) — Documento creado. Cubre el problema del empleado como lector real del mensaje, riesgo de bloqueo de WhatsApp e Instagram, uso del scraper de Google Maps con embudo de descarte por costo, la decisión de formato del primer contacto (dos burbujas, sin "Hola" pelado, permiso en el paso que sí tiene costo), la escalera completa con ramas, la oferta de valor gratuita (el menú propio armado, no un PDF) y la rampa de volumen ajustada al calendario compartido con Galu.
`;

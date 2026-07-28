# Product Marketing Context — Menú Digital

**Document version:** v1
**Last updated:** 2026-07-28
**Producto:** Menú Digital (SaaS gastronómico)
**Alcance:** este documento cubre **únicamente Menú Digital**. Es una marca independiente con su propia URL, su propia web y su propio funnel.

> **Regla de marca (heredada de la decisión de arquitectura de Gastón, 2026-07-27):** Menú Digital es una marca separada de Galu. Galu es la agencia que lo construyó. "Creado por Galu" es un sello de confianza al pie del sitio, nunca el protagonista. **Ninguna pieza de Menú Digital habla el idioma de una agencia.** Un dueño de hamburguesería no tiene que traducir jerga de marketing para entender que esto le sirve.

> **Regla dura de honestidad:** no se promete nada que no esté en la tabla "Existe hoy" (§2). Prometer una feature que no existe se descubre en la primera visita y quema el diferenciador entero, que justamente es la confianza personal.

---

## 1. Product Overview

**One-liner:**
Menú Digital convierte los pedidos desordenados de WhatsApp en comandas prolijas y un tablero en vivo — con el menú, las fotos y la plata en manos del local.

**Qué hace (3 frases):**
El cliente entra a un link o escanea un QR, ve la carta con fotos, arma su pedido con variantes y agregados, y lo manda. Al local le llega una comanda formateada al WhatsApp y aparece al instante en un tablero tipo Kanban con alerta sonora, que el mostrador mueve de "Nuevo" a "Cocina" a "Camino" a "Entregado". Todo funciona en el celular o la tablet que el local ya tiene, instalado como app con el nombre y el logo del negocio.

**Categoría (cómo lo busca el cliente):**
"menú digital con QR", "sistema de pedidos para restaurantes", "app para tomar pedidos por WhatsApp", "carta QR para restaurante", "comandas para cocina", "alternativa a PedidosYa sin comisión".

**Tipo de producto:** SaaS vertical B2B, nicho gastronomía, mercado local (San Miguel de Tucumán / NOA), con **componente de servicio presencial obligatorio** en el onboarding.

**Modelo de negocio:** fee de instalación y puesta en marcha (visita al local, carga del menú real con fotos, capacitación al personal) + suscripción mensual fija por plan. **Sin comisión por pedido, nunca.**

**Estado técnico:** en producción. `https://menu-murex-one.vercel.app/` · Demo público en vivo `/m/burger-house-tuc` · Catálogo scroll `/m/burger-house-tuc/catalogo`.

---

## 2. Producto real — qué existe y qué no

### Núcleo (todos los planes) — Existe hoy ✅

| Capacidad | Cómo se dice frente al dueño |
|---|---|
| Menú público con fotos, categorías, variantes, agregados y "quitar ingrediente" | "Tu carta con fotos de verdad, no un PDF que nadie abre" |
| Carrito + checkout por pasos; **el precio siempre se recalcula en el servidor** | "Nunca te va a cobrar mal, aunque el cliente toquetee" |
| Delivery con zonas y costo de envío propio por zona, o retiro por el local | "Cada barrio con su precio de envío" |
| La comanda llega armada al WhatsApp del negocio | "Te llega prolijo, no en quince mensajes" |
| Tablero Kanban en tiempo real, alerta sonora y notificación push | "El mostrador se entera sin mirar el celular" |
| Dirección, referencia, teléfono clickeable y "abona con $X" en la tarjeta | "El cadete sale sabiendo a dónde va y cuánto cambio llevar" |
| Botón de WhatsApp para pedirle confirmación al cliente que no confirmó | "Ningún pedido queda colgado" |
| Historial, facturación del día, ticket promedio, pedidos cancelados | "Sabés cuánto vendiste sin sacar la cuenta a mano" |
| Instalable como app (PWA) con **el nombre, el ícono y el color del local** | "Se instala con tu marca, no con la mía" |
| Panel autogestionable: productos, precios, fotos, horarios, abrir/cerrar el local | "Los precios los cambiás vos, sin llamarme" |
| Catálogo scroll estilo TikTok: una foto por plato, vertical, con botón de agregar | "Para mandar por historia de Instagram" |
| Cada local aislado de los demás a nivel base de datos, con tests que lo verifican | "Tus clientes son tuyos y nadie más los ve" |

### Módulos premium — se prenden y apagan por local

| Módulo | Qué hace | Estado |
|---|---|---|
| `kitchen_display` | Pantalla de cocina aparte: fondo oscuro, letra grande, sin arrastrar, pantalla que no se apaga | ✅ Existe |
| `tables` | Salón y mesas: QR por mesa imprimible, pedido en mesa **sin pedir teléfono ni pasar por WhatsApp**, mesa ocupada/libre | ✅ Existe |
| `inventory` | Stock por producto: descuenta al confirmar, repone al cancelar, avisa "queda poco", despublica al llegar a cero | ✅ Existe |
| `crm_loyalty` | Ficha de cliente automática por teléfono (junta el mismo número escrito de tres formas distintas), historial, gasto total, última visita | ✅ Existe |
| `mercadopago` | Cobro online | ❌ **No existe.** Flag reservado, nada detrás |
| `kitchen_printing` | Impresión de comanda térmica | ❌ **No existe.** Flag reservado, nada detrás |

### Fuera de alcance hoy — decir que NO existe si preguntan
MercadoPago / cobro online · impresión térmica · multi-sucursal · débito automático de la suscripción · fidelización por puntos · recetas e insumos · stock por agregado · división de cuenta de mesa · bump por ítem en cocina.

### Implicancia comercial del gating (importante)
El sistema de módulos es real y se opera desde el panel de superadmin. Eso convierte a Menú Digital de producto de precio único en **producto con planes, sin escribir una línea más de código**, y hace que el upsell no necesite migración ni visita: se activa un flag y el módulo aparece esa misma noche.

**Empaquetado recomendado:**

| Plan | Contenido | Para quién |
|---|---|---|
| **Base** | Núcleo | El local que solo hace delivery/retiro por WhatsApp |
| **Salón** | Base + `tables` + `kitchen_display` | El local que además tiene mesas. **Mayor diferencia percibida**: el QR de mesa es lo único que el comensal ve, así que el dueño lo entiende en 5 segundos |
| **Full** | Salón + `inventory` + `crm_loyalty` | Se vende en el mes 2 o 3, **nunca en la primera visita** — son features que se aprecian cuando ya te acostumbraste al sistema |

Consecuencia: el plan Base puede entrar barato sin canibalizar nada, porque el upsell es un switch.

---

## 3. Target Audience

**Dos segmentos.** El módulo de mesas cambió a quién le sirve el producto: antes era solo delivery, ahora también entra el salón.

### A — Mostrador y delivery
Hamburguesería, pizzería, rotisería, sushi, empanadas, casa de pastas. Vende sobre todo por WhatsApp, se le concentra el volumen viernes/sábado a la noche, poca o ninguna mesa.

- **Dolor:** "Los viernes se me pierden pedidos, tardo en pasar el menú y los precios, y el cliente se va a la competencia."
- **Jobs to be done:**
  1. No perder ni un pedido en hora pico.
  2. Responder más rápido sin contratar a nadie más.
  3. Que la comanda llegue a cocina igual a como la pidió el cliente.
- **Gancho que más entra:** el tablero funcionando + "te quedás con el 100%".

### B — Local con salón *(nuevo, habilitado por `tables`)*
Bar, cafetería, cervecería, parrilla, restaurante de mesa, patio de comidas. **Puede tener cero delivery y aun así comprar.**

- **Dolor:** "Me faltan mozos, la mesa espera diez minutos a que le tomen el pedido, y la carta impresa está desactualizada desde la última suba de precios."
- **Jobs to be done:**
  1. Que la mesa pida sola sin esperar a nadie.
  2. Cambiar precios sin reimprimir cartas.
  3. Que la cocina reciba directo, sin el intermediario que se olvida la mitad.
- **Gancho que más entra:** el QR sobre la mesa. Es lo único del sistema que **ve el cliente final**, así que el dueño entiende el valor sin explicación. Y es la demo más barata que existe: se imprime una hoja, se apoya en una mesa, se escanea.
- **Por qué importa estratégicamente:** duplica el universo de locales visitables en Tucumán, y **saca la conversación del terreno donde pelean PedidosYa y los SaaS de delivery**. Hoy nadie está peleando la mesa en Tucumán.

### Decisor
Dueño o encargado. Decide en el momento, no hay comité de compra, no hay departamento de sistemas. **Perfil no sofisticado digitalmente:** valora "que funcione ya" y "que alguien me lo deje andando" por encima de cualquier feature.

**[Asumido — validar con los primeros 5 clientes]:** piso de viabilidad. Hipótesis de trabajo: **segmento A desde ~15 pedidos/día de WhatsApp; segmento B desde ~8 mesas.** Debajo de eso el dolor no duele lo suficiente como para pagar todos los meses.

---

## 4. Personas

No aplica comité de compra: el dueño/encargado es usuario, campeón, decisor y pagador al mismo tiempo. Sí conviene mapear al **usuario que no decide pero puede matar la venta**:

| Quién | Le importa | Su miedo | Qué le prometemos |
|---|---|---|---|
| Dueño / encargado (decide) | No perder ventas, no sumar sueldos, plata predecible | Pagar todos los meses algo que el personal no usa | "El primer viernes estoy con vos" |
| Cajero / mostrador (usa) | Que no le complique la noche más ocupada del año | Quedar como el que no sabe usarlo | Tablero de un toque, sin arrastrar, con deshacer |
| Cocinero (usa) | Leer la comanda de un vistazo, con las manos sucias | Que le cambien el papel por una pantalla que no se entiende | Pantalla de cocina: letra grande, un botón, no se apaga |
| Mozo (segmento B, **puede sabotear**) | Su propina y su lugar | "Esto me reemplaza" | El QR le saca la parte de anotar, no la de atender. Más mesas por turno, no menos mozos |

**El mozo es el riesgo silencioso del segmento B.** Si el personal siente que el sistema lo reemplaza, no lo usa y el local da de baja. Hay que decirlo explícito en la capacitación.

---

## 5. Problems & Pain Points

**Problema central:** en el momento de mayor demanda, el canal de venta del local es un chat. Precio, agregados, dirección, forma de pago y horario, todo suelto entre audios, mientras la cocina espera y el teléfono vuelve a sonar. Así se pierden pedidos, así se equivocan, y así se llega al domingo sin saber cuánto se vendió.

**Por qué fallan las alternativas:**
- **Anotar a mano / WhatsApp manual:** no escala, depende de que alguien esté mirando la pantalla, y no deja registro.
- **Apps de delivery de terceros:** dan visibilidad pero se llevan una comisión de cada pedido, se quedan con el cliente, y no organizan el pedido que entra directo al local (que suele ser la mayoría).
- **SaaS nacional autoservicio:** te dan un panel y un usuario. Nadie te carga el menú, nadie viene, nadie contesta el viernes a las nueve de la noche.
- **Carta QR sola (PDF):** resuelve el papel, no resuelve el pedido. El cliente igual tiene que llamar o esperar al mozo.

**Qué le cuesta:** ventas concretas perdidas en las horas que más facturan, pedidos mal armados que se rehacen (comida tirada), y — el más caro y el menos visible — clientes que probaron una vez, esperaron, y no volvieron.

**Tensión emocional:** estrés operativo real en el momento de máxima presión. La frase de referencia: *"el viernes a la noche con el estómago cerrado"*.

---

## 6. Competitive Landscape

*Basado en research de SERP del mercado argentino (2026-07-27).*

**Directa — SaaS gastronómico nacional:** HivePOS, Comandar, MiRestoApp, Pido.club (~$29.900/mes), Bistrosoft, MenuconQR, OlaClick.
Modelo autoservicio, prueba gratis de 14–30 días, precio fijo mensual. **Falla:** nadie te instala nada, nadie carga tu menú, nadie está disponible cuando se rompe.

**Secundaria — WhatsApp Business con catálogo.** Gratis y ya instalado. **Falla:** es manual, sin pipeline visual, sin alerta, sin historial, y el catálogo de WhatsApp no maneja variantes ni agregados (que es donde justamente se equivocan los pedidos).

**Indirecta — PedidosYa / Rappi.** Traen demanda nueva. **Falla:** comisión por pedido, el cliente es de ellos y no del local, y no resuelven el pedido directo, que es el margen bueno.

**Indirecta — no hacer nada.** El competidor más grande y el más difícil de ganar. Lo vence solo la demo en vivo.

### ⚠️ Corrección crítica de posicionamiento

**"Sin comisiones / precio fijo mensual" NO es un diferenciador.** Comandar y MiRestoApp ya lo venden con esas mismas palabras. Ese mensaje está commoditizado y usarlo de titular hace que Menú Digital suene igual a seis competidores más baratos y más establecidos.

**Regla de uso, para no perder la ventaja del mensaje:**

| Momento | Mensaje | Por qué |
|---|---|---|
| **Atracción** (redes, landing, primer segundo, frío total) | "Sin comisión. Te quedás con el 100%." | Diferencia de PedidosYa ante alguien que no conoce la categoría. Funciona porque el enemigo mental del dueño es la comisión |
| **Cierre** (visita, cold email, objeción, propuesta) | "Vengo, te lo dejo andando con tu menú de verdad, y el primer viernes estoy." | Es lo único que ningún SaaS nacional puede copiar sin poner una persona en Tucumán |

Nunca invertir el orden. Si en la visita se argumenta precio, se compite contra empresas que no tienen que viajar a ningún local — la única pelea imposible de ganar.

---

## 7. Differentiation

**Los tres diferenciadores, en orden de defendibilidad:**

1. **Alguien te lo deja andando y está el viernes a la noche.** Instalación en el local, carga del menú real con fotos, capacitación al personal, soporte a 15 minutos. **El fee de instalación es la prueba del diferencial, no un costo a disculpar.** Menú Digital se vende como *servicio con software adentro*, no como software con soporte.
2. **Cubre el pedido entero, de la mesa a la cocina.** No es "un menú QR" ni "un tablero": es carta con fotos → carrito → comanda → tablero → pantalla de cocina → stock → ficha de cliente. La mayoría de los competidores hace bien una punta de esa cadena.
3. **Se instala con la marca del local, no con la nuestra.** La app lleva el nombre, el ícono y el color del negocio. El dueño no está poniendo el cartel de otro en su vidriera.

**Refuerzos (ciertos, pero no son el titular):** sin comisión por pedido, precio fijo mensual, el pedido va al WhatsApp del local y no a una plataforma de terceros, los datos del cliente son del local.

**Por qué lo eligen:** porque cuando termina la visita ya está funcionando con su menú real, no con un menú de ejemplo que tienen que cargar ellos un domingo.

**Ángulo específico del segmento B (salón):** contra un mozo más, el sistema es barato. Contra reimprimir cartas en cada suba de precios, se paga solo. Y el QR entra por los ojos.

---

## 8. Objections

| Objeción | Respuesta |
|---|---|
| **"Ya uso Comandar / Pido / MenuconQR."** *(la objeción real, no el precio)* | "¿Y quién te cargó el menú? ¿A quién llamás el viernes a las nueve de la noche?" Después: ofrecer correrlo en paralelo un fin de semana, sin dar de baja nada. |
| "Es caro / no sé si lo vale." | Lo comparamos contra lo que ya perdés: un pedido de $X que se cae por semana ya paga el mes. Y no hay comisión: si vendés más, no pagás más. |
| "No tengo tiempo para aprender un sistema nuevo." | No lo cargás vos. Vengo yo, cargo tu menú con tus fotos, capacito al personal, y el primer fin de semana estoy disponible. |
| "Mi personal no lo va a usar." | Por eso el tablero es de un toque y la pantalla de cocina no tiene nada que arrastrar. Y por eso la capacitación es presencial, no un video. |
| "Mi cliente es grande, no va a escanear un QR." *(segmento B)* | La carta impresa sigue existiendo. El QR es para el que no quiere esperar al mozo — que en la práctica es la mesa que se cansa y se va. |
| "¿Y si se cae internet?" | El local sigue tomando pedidos como siempre. El sistema no reemplaza al mostrador, le saca el trabajo repetido. |
| "¿Los datos de mis clientes son míos?" | Sí, y no los ve nadie más: cada local está aislado en la base y hay tests automáticos que lo verifican en cada cambio. Es exactamente lo contrario de una plataforma de delivery, que se queda con tu cliente. |
| "¿Y si dejo de pagar, pierdo todo?" | Si una transferencia llega tarde, el local **no se apaga** — nadie corta un servicio un viernes a la noche. La baja es una decisión conversada, no un botón automático. |

**Anti-persona (no vender, o vender último):**
- Locales sin operación real todavía (proyecto "en idea", sin volumen).
- Cadenas o franquicias con más de una sucursal: **el producto no soporta multi-sucursal hoy.** Decirlo antes de la demo.
- El que solo busca lo más barato sin importar el resultado: va a comparar contra $29.900 de autoservicio y no valora lo único que ofrecemos.
- Locales cuyo volumen es 90% PedidosYa: no tienen el dolor del pedido directo.

---

## 9. Switching Dynamics (JTBD)

- **Push (qué lo empuja a irse de lo actual):** pedidos perdidos y clientes enojados cada fin de semana; la sensación de que el viernes lo maneja el caos y no él.
- **Pull (qué lo atrae):** ver el tablero funcionando en vivo, en 90 segundos, en su propio celular. Y que alguien se lo deje instalado sin que él tenga que hacer nada.
- **Habit (qué lo mantiene quieto):** "así lo hicimos siempre". El cuaderno de comandas y el WhatsApp funcionan *lo suficiente* como para no cambiar nada un martes.
- **Anxiety (qué lo frena):** miedo a que el personal no sepa usarlo justo en el momento de más presión. **Este es el miedo dominante y es operativo, no económico.** Toda la comunicación de cierre tiene que atacarlo: instalación presencial, capacitación, y estar el primer viernes.

---

## 10. Customer Language

**Cómo describen el problema (usar textual):**
- "Los viernes se me vuelve loco el WhatsApp."
- "Se me pierden pedidos."
- "Tardo un montón en pasar la carta y los precios."
- "Se equivocan con los agregados y hay que rehacer el pedido."
- "PedidosYa se lleva una fortuna."
- "No tengo mozos suficientes."
- "La carta está desactualizada desde que subí los precios."

**Cómo hablar del producto:**
- Palabras a usar: **comanda, tablero, mostrador, cocina, mesa, carta, pedido, hora pico, se te queda toda la plata, te lo dejo andando, sin comisión, prolijo, de un toque.**
- Palabras a evitar: "solución integral", "transformación digital", "optimizar procesos", "ecosistema", "plataforma omnicanal", "potenciamos tu negocio", "onboarding", "SaaS", "stack", "dashboard", "KPI". **Si suena a agencia, está mal escrito.**
- Tratamiento: **vos**, siempre. Nunca "usted", nunca "ustedes" corporativo.

**Glosario interno:**
| Término | Qué es |
|---|---|
| Comanda | El pedido formateado que recibe cocina/mostrador |
| Tablero | Kanban en vivo: Nuevo → Cocina → Camino → Entregado |
| Pantalla de cocina | Vista aparte, fondo oscuro, letra grande, para el que cocina |
| Catálogo scroll | Vista vertical estilo TikTok, una foto por plato |
| Módulo | Feature premium que se prende o apaga por local |

---

## 11. Brand Voice

**Tono:** directo, de mostrador. Habla alguien que entiende cómo es un viernes a la noche en un local, no un departamento de marketing.

**Estilo:** frases cortas. Preguntas que interpelan el dolor antes de nombrar el producto ("¿cuántos pedidos se te pierden el viernes?"). Números concretos antes que adjetivos. Cero signos de admiración.

**Personalidad:** práctico, cercano, confiable, sin vueltas, del lado del dueño.

**Regla de CTA:** siempre una acción concreta y de bajo riesgo. **"Mirá un menú real"** (frío) / **"Mandame un WhatsApp"** (caliente). Nunca "contactanos", nunca "solicitá información".

**Referencia viva:** el copy de la landing actual, que ya acierta el tono —
> *"Tu menú. Tu pedido. Tu plata."*
> *"Un pedido no debería tardar quince mensajes."*
> *"Un catálogo que se mira, no se lee."*
> *"Sin tarjeta. Sin contrato atado. Hablás con una persona, no con un bot."*

---

## 12. Proof Points

**Métricas propias:** ninguna documentada todavía. **Es el bloqueante #1 de todo el marketing.**

**Los dos números que hay que conseguir del primer cliente** (son los que más venden a otro dueño):
1. "¿Cuántos pedidos por WhatsApp se te perdían antes, y ahora?"
2. "¿En cuánto bajó el tiempo desde que entra el pedido hasta que sale de cocina?"

Secundarios: ticket promedio antes/después (el menú con fotos y los agregados suben el ticket), y cuántas mesas rota por turno (segmento B).

| Prueba | Estado | Cómo se usa |
|---|---|---|
| **Demo público en vivo** (`/m/burger-house-tuc`) | ✅ Listo | **La única prueba que hoy no depende de que nadie conteste.** Menú real con fotos, pedido completo, catálogo scroll. Va en el cold email, en la visita, en redes y en la ficha de Google |
| Video del tablero en hora pico real | ⬜ Pendiente | El activo de contenido de mayor palanca: es hipnótico y es prueba de producto al mismo tiempo |
| Testimonio del primer local instalado | ⬜ Pendiente | Pedirlo el lunes después del primer fin de semana, en caliente |
| Hoja de QR impresa sobre una mesa real | ⬜ Pendiente | Foto. Es la prueba más barata y la más entendible del segmento B |
| Auditoría de performance del menú público | ✅ 93 performance / 100 accesibilidad / 100 SEO | Al dueño no le dice nada; sirve contra el "¿no va a andar lento en el celular de mi cliente?" |

---

## 13. Goals

**Objetivo de negocio (90 días):** validar que hay locales dispuestos a pagar todos los meses. Meta: **3–5 locales pagando al día 90.** La restricción de esta etapa es validación, no escala — por eso las metas son de conversaciones y primeros clientes, no de tráfico ni seguidores.

**Acción de conversión clave:** WhatsApp a **`wa.me/543815976357`** → visita presencial con el menú del local **ya cargado** antes de llegar.

**Canal principal declarado:** venta directa presencial. El producto se demuestra en un celular en 90 segundos y ningún competidor nacional puede entrar a una hamburguesería un martes a las 4 de la tarde. Todo el contenido existe para que cuando toques timbre ya te hayan visto.

**Métricas actuales:** sin tracking implementado. Pendiente: GA4 + Search Console sobre el dominio propio de Menú Digital.

### Decisiones abiertas que bloquean la venta

| # | Decisión | Por qué bloquea |
|---|---|---|
| 1 | **Precio de los tres planes + fee de instalación** | No se puede vender lo que no tiene precio. Ancla de mercado: Pido.club ~$29.900/mes. Posicionamiento correcto: **arriba** del autoservicio nacional, no debajo |
| 2 | **Dominio propio** (hoy vive en una URL de Vercel) | Una URL `.vercel.app` en una tarjeta o un cold email resta credibilidad frente a un dueño que no sabe qué es Vercel |
| 3 | Nombre definitivo de marca | "Menú Digital" es descriptivo y no registrable; ayuda al SEO, pero no se defiende |

---

## Changelog
*Newest first. Una línea por revisión: qué cambió y por qué.*

- v1 (2026-07-28) — Documento inicial, **independiente del contexto de Galu**. Definido a partir del producto real ya desplegado (Fases 0–6 + Tandas A–D): inventario verificado de features separando lo que existe de lo que no (MercadoPago e impresión térmica **no existen**, corrigiendo una afirmación errónea que circulaba en el contexto de la agencia), apertura del ICP en dos segmentos tras el módulo de mesas, empaquetado en tres planes derivado del gating de módulos, regla de uso de "sin comisión" (atracción) vs. "instalación presencial" (cierre), y mapa de personas incluyendo al mozo como riesgo de sabotaje en el segmento salón.

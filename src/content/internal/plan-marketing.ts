export const planMarketing = `# Menú Digital — Plan de marketing y adquisición

**Cliente:** Menú Digital (marca independiente, construida por Galu)
**Preparado para:** Gastón Gutierrez
**Fecha:** 2026-07-28 · **Versión:** v1
**Contexto base:** \`.agents/product-marketing.md\` v1 · \`marketing/prospeccion.md\`

---

## 1. Resumen ejecutivo

**Qué optimiza este plan:** no facturación. Optimiza **demos hechas frente a un dueño de local, por semana**. Con presupuesto $0 y un solo operador, la restricción no es la conversión — es que hoy nadie está viendo el producto. Todo lo demás existe para que cuando Gastón toque timbre, ya lo hayan visto.

### Las tres apuestas

**Apuesta 1 — El producto ya no es el cuello de botella. La distribución sí.**
Menú Digital está terminado y en producción: menú con fotos, tablero en vivo, pantalla de cocina, stock, CRM, mesas con QR, catálogo scroll, PWA con la marca del local. Hay más producto construido que marketing hecho. **Este plan no pide una sola feature nueva.** Todo lo que sigue se hace con lo que ya existe, y cualquier hora de desarrollo que se meta en el producto en los próximos 90 días es una hora robada a la validación.

**Apuesta 2 — El módulo de mesas abrió un mercado donde no hay nadie peleando.**
Hasta hace una semana esto era un producto de delivery, compitiendo de frente con siete SaaS nacionales y con la sombra de PedidosYa. El módulo \`tables\` cambió el juego: **el QR de mesa es lo único del sistema que ve el cliente final**, se demuestra apoyando una hoja impresa sobre una mesa, y le sirve a bares, cafeterías, parrillas y cervecerías que hoy nadie está visitando en Tucumán. Es el segmento con menos competencia, ciclo de venta más corto y demo más barata. **Empezar por ahí, no por delivery.**

**Apuesta 3 — El fee de instalación es el producto, no el peaje.**
Todos los competidores nacionales venden autoservicio: te dan un usuario y te arreglás. Lo único que ninguno puede copiar sin poner una persona en Tucumán es venir, cargar el menú real con fotos, capacitar al personal y estar el primer viernes a la noche. Eso no se disculpa: se cobra y se pone en el centro. **Menú Digital es un servicio con software adentro.** Competir en precio contra empresas que no tienen que viajar a ningún lado es la única pelea imposible de ganar.

### Los 90 días, en seis prioridades

| # | Semana | Prioridad | Por qué bloquea |
|---|---|---|---|
| 1 | 1 | **Definir precio de los tres planes + fee de instalación** | No se puede salir a la calle sin precio. "Te paso el presupuesto" mata la visita |
| 2 | 1 | **Dominio propio + GA4 + Search Console** | Una URL \`.vercel.app\` resta credibilidad; sin medición, los otros 89 días son a ciegas |
| 3 | 1–2 | **Instalar el primer local, aunque sea gratis** | Sin un local real no hay video, no hay testimonio, no hay números. Es el desbloqueo de todo lo demás |
| 4 | 2–12 | **8–12 visitas presenciales por semana** | El canal principal. Es lo único que no se puede delegar |
| 5 | 3–12 | **Un formato de video, repetido: el tablero en hora pico real** | Contenido hipnótico y prueba de producto al mismo tiempo |
| 6 | 4–12 | **Ficha de Google Business Profile de Menú Digital** | El único canal inbound de intención alta que es gratis y rankea en semanas |

### Cómo se ve el mes 12, de forma plausible

- **12–20 locales pagando** en Gran Tucumán → primer ingreso recurrente real.
- 3–4 casos documentados **con números**, no con adjetivos.
- Un video del tablero en hora pico con tracción orgánica, reutilizado en todo.
- Ficha de Google en el paquete local de "menú digital Tucumán" y variantes.
- El proceso de instalación documentado al punto de que **otra persona pueda hacerlo** — el disparador de la primera contratación.

**Lo que este plan sacrifica a propósito:** pauta paga, blog/SEO de contenido largo, LinkedIn, email marketing masivo, expansión fuera de Tucumán, y cualquier feature nueva. Ver §13.

---

## 2. Marco estratégico

### La categoría que reclamamos

El mercado gastronómico argentino está partido en dos y el medio está vacío:

| Extremo | Quiénes | Qué falla |
|---|---|---|
| SaaS nacional autoservicio | Comandar, MiRestoApp, Pido.club, MenuconQR, OlaClick, HivePOS, Bistrosoft | Barato e impersonal. Nadie te instala nada. Nadie contesta el viernes |
| Sistemas de gestión de cadena | Bistrosoft enterprise, POS tradicionales | Caros, complejos, pensados para 20 sucursales |

**El hueco:** *"alguien que te lo instala, te lo configura con tu menú real y está el viernes a la noche."* Ese es el territorio de Menú Digital y está vacío en Tucumán. No inventamos una categoría de producto — inventamos una categoría de **entrega**.

### ICP destilado

Dueño o encargado de un local gastronómico **de una sola sucursal** en San Miguel de Tucumán o Yerba Buena. No es sofisticado digitalmente. Decide solo, en el momento. Dice que necesita "un sistema"; lo que en realidad compra es **no vivir el viernes a la noche con el estómago cerrado**.

Dos segmentos (detalle en \`.agents/product-marketing.md\` §3):
- **A — mostrador/delivery:** hamburguesería, pizzería, rotisería. Dolor: pedidos que se pierden en hora pico.
- **B — salón:** bar, cafetería, cervecería, parrilla. Dolor: la mesa espera al mozo y la carta está desactualizada.

**Prioridad de este plan: B primero.** Menos competencia, demo más barata, y saca la conversación del terreno donde pelean PedidosYa y los SaaS de delivery.

### La lógica del modelo de negocio

Fee de instalación + suscripción mensual fija. El fee cubre el recurso escaso (las horas presenciales de Gastón) y filtra al que solo busca lo más barato. La suscripción es el activo: **cada local que se suma reduce la dependencia de vender proyectos nuevos.**

El gating de módulos ya construido convierte esto en tres planes sin escribir código, y el upsell es un switch — no requiere migración ni una segunda visita. Eso permite que **Base entre barato sin canibalizar nada**.

### Voz de marca (no negociable)

- **SÍ:** comanda, tablero, mostrador, cocina, mesa, carta, hora pico, prolijo, de un toque, te lo dejo andando, se te queda toda la plata. Tratamiento de **vos**, siempre.
- **NO:** solución integral, transformación digital, optimizar procesos, ecosistema, omnicanal, onboarding, SaaS, dashboard, KPI. **Si suena a agencia, está mal escrito.**
- **Regla de CTA:** acción concreta y de bajo riesgo. *"Mirá un menú real"* (frío) / *"Mandame un WhatsApp"* (caliente). Nunca "contactanos".
- **Cero signos de admiración.** El tono es de mostrador, no de vendedor.

---

## 3. Estado actual

### Equipo

| Persona | Rol | Superficie de marketing |
|---|---|---|
| Gastón | Fundador, dev, vendedor, instalador, soporte | Todo lo que requiere cuerpo o cara |
| Claude (IA) | Ejecución | Copy, guiones, contenido, listas, análisis, landing |

**El hueco no es de habilidad, es de horas.** Con ~5–8 h/semana de marketing, cada hora de Gastón debe ir a **lo que solo él puede hacer: entrar a un local y mostrar el producto.** Todo lo demás se delega.

**Cuándo hace falta la primera contratación:** no en estos 90 días. El disparador es llegar a ~10 locales pagando — ahí el soporte y las instalaciones empiezan a comerse las horas de venta. La primera contratación es de **instalación y soporte, no de marketing**.

### Presupuesto

Pauta $0 · Herramientas $0 (todo lo necesario tiene capa gratuita) · Retainers $0 · CAC desconocido.
**Implicancia dura:** este plan no contiene una sola táctica que dependa de plata que todavía no existe.

### Fase de crecimiento

**$0 ARR — fase de validación**, no de escala. La restricción vinculante es probar que alguien paga todos los meses. Por eso las metas son de **conversaciones y primeros clientes**, no de tráfico ni de seguidores.

### Lo que ya está hecho

| Activo | Estado | Palanca |
|---|---|---|
| Producto completo en producción | ✅ Fases 0–6 + Tandas A–D | Más producto que marketing. El desbalance es el diagnóstico |
| Demo público en vivo con fotos reales | ✅ \`/m/burger-house-tuc\` | **La única prueba que hoy no depende de que nadie conteste** |
| Landing propia con copy sólido | ✅ Vive en URL de Vercel | Estructura dolor → beneficios → 3 pasos → demo → CTA. Ya funciona |
| Catálogo scroll estilo TikTok | ✅ | Formato nativo de redes: es contenido y producto a la vez |
| Módulos premium gateados | ✅ 4 de 6 reales | Convierte el producto en tres planes sin escribir código |
| Hoja de QR de mesa imprimible | ✅ | La demo más barata que existe para el segmento B |
| Checklist de instalación presencial | ✅ \`docs/instalacion-presencial.md\` | Es el diferenciador, documentado. Base de la primera contratación |
| Performance auditada | ✅ 93/100/100/100 | Munición contra "¿no va a andar lento?" |

### Lo que está trabado

| Problema | Costo de no hacer nada | Cuándo |
|---|---|---|
| **Sin precio definido** | No se puede vender. La visita muere en "te paso el presupuesto" | Semana 1 |
| **Sin dominio propio** | \`.vercel.app\` en una tarjeta resta credibilidad ante un dueño que no sabe qué es Vercel | Semana 1 |
| **Cero medición** | 90 días de decisiones a ciegas | Semana 1 |
| **Cero clientes reales** | Sin video, sin testimonio, sin números. **Bloquea todo el contenido** | Semanas 1–2 |
| **Cero presencia de marca** | Un dueño que googlea "Menú Digital Tucumán" no encuentra nada | Semana 4 |
| Flags de MercadoPago e impresión térmica sin nada detrás | Riesgo de prometer lo que no existe en una visita | Ya — regla escrita en el contexto |

### Auditoría de estado actual (17 secciones)

*Puntuado desde materiales disponibles. Corregir donde haya mejor información.*

| # | Sección | Puntaje | Nota |
|---|---|---|---|
| 1 | Posicionamiento | 4/5 | Diferenciador identificado y defendible. Falta probarlo con un cliente |
| 2 | Investigación de cliente | 2/5 | Research de competencia sólido. Cero entrevistas a dueños reales |
| 3 | Homepage / landing | 4/5 | Copy y diseño por encima del promedio del rubro. Le falta precio y prueba social |
| 4 | Páginas de producto | 1/5 | No hay páginas por segmento ni por módulo |
| 5 | Páginas de conversión | 2/5 | Un CTA a WhatsApp. Sin página de precios |
| 6 | Comparación con competencia | 0/5 | Nada. Y la objeción real es "ya uso Comandar" |
| 7 | Recursos / contenido | 0/5 | Ninguna superficie de contenido |
| 8 | Onboarding | 4/5 | **El punto más fuerte.** Instalación presencial documentada. Es el producto |
| 9 | Email lifecycle | 0/5 | Nada. Apropiado para la etapa |
| 10 | Material de venta | 2/5 | El demo en vivo es excelente. Sin one-pager, sin comparativa, sin precio |
| 11 | Mensajería | 4/5 | Voz genuina y documentada. Falta operativizarla por canal |
| 12 | Precios | 1/5 | Modelo claro, monto sin definir. **Bloqueante #1** |
| 13 | CRO | 1/5 | Sin instrumentación |
| 14 | Lanzamientos | 0/5 | El producto está terminado y nunca se anunció |
| 15 | Ads | 0/5 | Decisión, no debilidad |
| 16 | SEO | 1/5 | Sin dominio, sin ficha de Google, sin contenido |
| 17 | Internacionalización | 0/5 | Apropiado — el negocio es local por diseño |

**Total: 28 / 85 (33%).**

**Interpretación:** el perfil es *"producto y posicionamiento fuertes, distribución inexistente"*. Alto en 1, 3, 8 y 11 — que es exactamente donde la mayoría falla. Cero en 6, 7, 9, 13, 14, 16 — que es todo lo que hace que la gente se entere. Es la forma clásica de **producto terminado que nadie lanzó**. La buena noticia: casi todo lo que falta es de esfuerzo bajo, porque se parte de cero y no hay que desarmar nada mal hecho.

---

## 4. Acquisition — cómo se enteran

### Estado actual
**Cero.** Ningún canal activo. El producto lleva meses funcionando y nunca se anunció.

### Movida 1 — Venta directa presencial *(semanas 2–12, el canal principal)*

Es el motor de validación y lo único que no se puede delegar. Detalle operativo completo en \`marketing/prospeccion.md\`.

- **8–12 puertas por semana**, martes a viernes, 15:00–18:00 (horario muerto).
- **Una zona por semana**, ordenada: Av. Aconquija → Barrio Norte → microcentro → Barrio Sur.
- **Segmento B primero**, con la hoja de QR impresa en la mano.
- **La oferta de la primera visita no es la venta:** *"dejame instalarlo con tu menú de verdad y usalo un fin de semana"*. Ataca el miedo real, que es operativo y no económico.
- **Métrica semanal: puertas tocadas y demos hechas.** Clientes cerrados es consecuencia, no palanca.

*Skills: \`prospecting\`, \`sales-enablement\`, \`cold-email\`.*

### Movida 2 — Un solo formato de video, repetido *(semanas 3–12)*

No "hacer contenido". **Un formato:** el tablero funcionando durante hora pico real en un local real. Entran pedidos, suena la alerta, se mueve la tarjeta a Cocina. Es intrínsecamente hipnótico y es prueba de producto al mismo tiempo. Nada de cara a cámara, nada de tips.

Formatos secundarios, en orden de facilidad:
1. **El QR de mesa en acción** — alguien escanea, pide, y el pedido aparece en la cocina. 15 segundos, cero edición.
2. **El chat vs. la comanda** — captura de un WhatsApp real de quince mensajes al lado de la comanda ordenada. Es el copy de la landing convertido en video.
3. **El catálogo scroll** — se graba solo, ya está construido y es nativo del formato.

**3 publicaciones por semana en Instagram Reels y TikTok.** Claude escribe todos los guiones; Gastón graba en tandas de una hora dentro del local que instale. **Esto solo se desbloquea con el primer cliente instalado** — es la razón número uno para instalar el primero aunque sea gratis.

*Skills: \`social\`, \`video\`, \`content-strategy-sms\`.*

### Movida 3 — Dominio propio + medición *(semana 1)*

- Dominio de Menú Digital, DNS apuntando a Vercel.
- GA4 + Search Console. Sin esto, los otros 89 días son a ciegas.
- Título, meta description y schema de \`LocalBusiness\` con "Tucumán" adentro.
- OpenGraph ya existe.

*Skills: \`analytics\`, \`seo-audit\`, \`schema\`.*

### Movida 4 — Google Business Profile *(semana 4)*

En búsqueda local, el paquete de Maps aparece arriba de lo orgánico y compite con muchísima menos disciplina que las páginas SEO. Ficha con categoría "Proveedor de software", zona de servicio Tucumán, fotos reales de instalaciones, y **reseñas de los primeros clientes pedidas el lunes después del primer fin de semana**. Una ficha con 5 reseñas reales le gana a fichas abandonadas con 0.

*Skill: \`seo-audit\`. Costo: $0.*

### Movida 5 — Página de precios y página de comparación *(semanas 5–8)*

Dos páginas, en este orden:

1. **\`/precios\`** — los tres planes con monto visible. Publicar el precio filtra al que no puede pagar antes de gastar una visita, y es lo primero que busca alguien que llegó a la landing. Es el arreglo de CRO de mayor impacto disponible.
2. **\`/vs/comandar\`, \`/vs/pedidosya\`** — la objeción real no es el precio, es *"ya uso X"*. Estas páginas existen para el momento en que el dueño googlea después de la visita. Honestas: decir qué hace mejor el otro.

*Skills: \`pricing\`, \`competitors\`, \`cro\`, \`copywriting\`.*

### Movida 6 — Instagram como vidriera, no como canal *(semanas 3–12)*

Cuenta propia de Menú Digital, separada de Galu. Su trabajo no es conseguir clientes: es que **el dueño que googlea después de la visita encuentre algo vivo**. Una cuenta muerta hace parecer que la empresa cerró. Basta con las 3 publicaciones semanales de la Movida 2 y las historias de cada instalación.

### Canales que NO vamos a hacer, y por qué

| Canal | Por qué no |
|---|---|
| Pauta paga | $0 de presupuesto, y sin CAC conocido sería quemar plata a ciegas |
| Blog / SEO de contenido largo | Retorno a 6–9 meses. No ayuda a validar ahora |
| LinkedIn | El dueño de una pizzería de barrio no está ahí |
| Email marketing masivo | No hay lista y el ICP no lee mail |
| Product Hunt / directorios de SaaS | Público equivocado. Nadie en Tucumán entra a Product Hunt |
| Expandir fuera de Tucumán | **El diferenciador es estar a 15 minutos.** Expandir lo destruye |

---

## 5. Activation — de interesado a funcionando

**La activación de este producto no es un signup. Es una visita.** Y es el punto más fuerte del negocio: el checklist de instalación presencial ya existe.

### El momento de activación
No es "el dueño se registró". Es **"entró el primer pedido real de un cliente real"**. Todo el proceso se ordena para llegar ahí lo más rápido posible.

### El flujo, tal como debería quedar

| Paso | Qué pasa | Cuándo |
|---|---|---|
| 1 | Visita + demo de 90 segundos | Día 0 |
| 2 | **Se saca el menú y las fotos ahí mismo** (foto de la carta impresa con el celular) | Día 0, sin irse |
| 3 | Claude + Gastón cargan el menú real | Día 0–1 |
| 4 | Segunda visita: se instala en la tablet/celular del local, se capacita al mostrador y a cocina, se pegan los QR | Día 1–3 |
| 5 | **Primer fin de semana con Gastón disponible por WhatsApp** | El viernes siguiente |
| 6 | Lunes: se muestran los números de la semana y se piden el testimonio y la reseña | Día +3 del fin de semana |

**El paso 5 es el producto.** Es lo que ningún competidor puede copiar y es donde se gana o se pierde la renovación del mes 2.

**El paso 6 es marketing, no soporte.** El lunes después del primer fin de semana es el único momento en que el dueño está impresionado y disponible. Ahí se pide todo: el testimonio, la reseña de Google, y permiso para grabar el video del tablero.

### Riesgo de activación #1 — el personal
El miedo dominante del dueño es operativo: *"mi gente no lo va a usar el viernes"*. La capacitación tiene que incluir explícitamente al **mozo del segmento B**, que es quien puede sabotear la instalación si siente que lo reemplaza. El mensaje: el QR le saca la parte de anotar, no la de atender.

### Riesgo de activación #2 — el menú a medio cargar
Un local con 6 de 30 productos cargados no usa el sistema y da de baja al mes. **La instalación no termina hasta que el menú está completo y con fotos.** Es preferible demorar una semana la puesta en marcha que arrancar a medias.

*Skills: \`onboarding\`, \`sales-enablement\`.*

---

## 6. Retention — que sigan pagando el mes 2

Con 0 clientes, la retención es teórica. Pero las decisiones que la determinan se toman **ahora**, en el diseño de la instalación.

### Las tres causas de baja que hay que prevenir desde el día 0

| Causa | Señal temprana | Prevención |
|---|---|---|
| **El personal no lo usa** | Pedidos que entran pero nadie mueve las tarjetas del tablero | Capacitar al que lo usa, no solo al que paga. Volver a la semana 2 |
| **El menú quedó desactualizado** | Productos marcados no disponibles hace semanas; precios viejos | Enseñar a editar el menú en la capacitación, no solo a leer pedidos |
| **Bajó la temporada** | Menos pedidos en el tablero mes a mes | Contacto proactivo, no esperar a que avisen la baja |

**Ventaja estructural ya construida:** un local con la suscripción vencida **no se apaga** — \`past_due\` sigue sirviendo, solo \`suspended\` corta. Nadie apaga un local un viernes a la noche porque una transferencia llegó tarde. Eso es retención de producto y hay que decirlo en la venta: *"si te atrasás una semana no te quedás sin sistema"*.

### El ritual mensual (única automatización que vale la pena hoy)
Un WhatsApp por mes a cada local con **sus propios números**: cuántos pedidos entraron, cuánto facturó por el sistema, cuál fue su producto más vendido. Sale del panel, que ya lo calcula. Es el mejor argumento de renovación posible porque no es una opinión: es su plata.

### Upsell como retención
El plan Full (\`inventory\` + \`crm_loyalty\`) **no se vende en la primera visita.** Se ofrece en el mes 2 o 3, cuando el dueño ya se acostumbró, y se activa con un switch. Un cliente que sube de plan es un cliente que no se va.

*Skills: \`churn-prevention\`, \`emails\`, \`sms\`.*

---

## 7. Referral — el canal que va a terminar siendo el principal

**Predicción honesta: en el mes 12, la mayoría de los clientes va a venir de otros dueños de locales, no del marketing.** El rubro gastronómico de una ciudad de este tamaño es un grupo de WhatsApp: los dueños se conocen, se copian y se preguntan qué usan.

Eso tiene una consecuencia estratégica dura: **la calidad de la instalación es el canal de adquisición.** Un local mal instalado no solo se da de baja — cuenta que no funcionó.

### Mecánica, simple a propósito
- **Pedir la referencia en el momento correcto:** el lunes después del primer fin de semana bueno. No antes, no por mail, en persona o por WhatsApp.
- **Un mes gratis por cada local referido que instale.** Simple de explicar, simple de cumplir, y se activa con un flag.
- **Pedir el nombre, no "si conocés a alguien".** *"¿Quién de los que conocés la está pasando peor con el WhatsApp los viernes?"* — pregunta concreta, respuesta concreta.
- **El vecino de al lado.** Después de instalar, tocar los dos locales contiguos: *"acabo de instalarlo acá al lado, ¿querés verlo?"* Prueba social a diez metros.

*Skill: \`referrals\`.*

---

## 8. Revenue — precio y empaquetado

**Decisión bloqueante #1.** No se puede ejecutar §4 sin esto.

### El marco correcto
Ancla de mercado: **Pido.club ~$29.900/mes** en autoservicio. El error a evitar es ponerse debajo. Menú Digital tiene un costo que ellos no tienen (las horas presenciales de Gastón) y una entrega que ellos no dan. **El precio va arriba, y el fee de instalación va explícito.**

### Estructura recomendada

| Plan | Contiene | Posicionamiento |
|---|---|---|
| **Base** | Menú con fotos, carrito, comanda a WhatsApp, tablero, historial, PWA con la marca del local | Entrada. Puede ser agresivo — el upsell es un switch, no canibaliza nada |
| **Salón** | Base + mesas con QR + pantalla de cocina | **El plan estrella.** Mayor diferencia percibida: el QR lo ve el cliente final |
| **Full** | Salón + stock + CRM de clientes | Se vende en el mes 2–3, nunca en la primera visita |

**Fee de instalación único**, cobrado siempre, sin excepciones. Cubre: visita, carga del menú completo con fotos, capacitación al personal, impresión de QR y el primer fin de semana de acompañamiento. **No es un costo a disculpar — es el argumento.** Regalarlo destruye el posicionamiento entero y enseña al cliente que el trabajo presencial no vale nada.

### Cómo se presenta el precio en la visita
Nunca solo. Siempre contra lo que ya pierde:
> *"¿Cuántos pedidos se te caen un viernes porque no llegás a contestar? ¿De cuánto es cada uno? Bueno, con uno por semana ya está pagado. Y no hay comisión: si vendés el doble, pagás lo mismo."*

### Las tres excepciones permitidas
1. **El primer local: instalación gratis a cambio de testimonio, números y permiso para grabar.** Es una inversión en el activo que desbloquea todo el contenido, no un descuento.
2. **Un mes gratis por referido efectivo.**
3. **Nada más.** Ningún descuento por regatear en la visita: enseña que el precio es negociable y se propaga por el mismo grupo de WhatsApp que trae los referidos.

*Skill: \`pricing\`, \`offers\`.*

---

## 9. Roadmap de 90 días

**Owner de todo: Gastón**, salvo donde dice Claude. Las horas de Gastón son el recurso escaso; todo lo que puede hacer Claude, lo hace Claude.

### Semanas 1–2 — Destrabar

| Acción | AARRR | Quién |
|---|---|---|
| Definir precio de los 3 planes + fee de instalación | Revenue | Gastón |
| Comprar dominio propio y apuntarlo | Acq | Gastón |
| GA4 + Search Console + schema LocalBusiness | Acq | Claude |
| Escribir \`/precios\` con los montos definidos | Rev | Claude |
| Armar lista de 40 locales por zona con señales (§prospeccion) | Acq | Claude + Gastón |
| Imprimir hojas de QR de demo para llevar | Acq | Gastón |
| **Instalar el primer local, gratis si hace falta** | Act | Gastón |

### Semanas 3–4 — Fundaciones

| Acción | AARRR | Quién |
|---|---|---|
| Arrancar las visitas: 8–12 puertas/semana | Acq | Gastón |
| **Grabar el video del tablero en hora pico del primer local** | Acq | Gastón |
| Abrir Instagram y TikTok de Menú Digital, 3 posts/semana | Acq | Claude escribe, Gastón graba |
| Crear ficha de Google Business Profile | Acq | Gastón |
| Pedir testimonio + reseña + números al primer local | Ref | Gastón |
| Escribir la secuencia de WhatsApp en frío (§cold-email) | Acq | Claude |

### Semanas 5–8 — Velocidad

| Acción | AARRR | Quién |
|---|---|---|
| Sostener 8–12 visitas/semana, rotando zona | Acq | Gastón |
| Publicar \`/vs/comandar\` y \`/vs/pedidosya\` | Acq | Claude |
| Agregar prueba social a la landing (testimonio + números reales) | Acq | Claude |
| Segunda visita de seguimiento a cada local instalado | Ret | Gastón |
| Primer reporte mensual por WhatsApp a los clientes | Ret | Gastón |
| Pedir el primer referido | Ref | Gastón |

### Semanas 9–12 — Componer

| Acción | AARRR | Quién |
|---|---|---|
| Seguir visitas + capitalizar referidos y vecinos | Acq/Ref | Gastón |
| Primer upsell a plan Full en un local del mes 1 | Rev | Gastón |
| Revisar métricas de GA4 y calcular el primer CAC real | Todas | Claude |
| Documentar el proceso de instalación al punto de delegarlo | Act | Gastón + Claude |
| Decidir con datos: ¿precio bien puesto? ¿segmento correcto? | Rev | Gastón |

### Las métricas semanales (solo dos)
1. **Puertas tocadas** — meta 8–12.
2. **Demos hechas frente a un dueño** — meta 4+.

Todo lo demás es consecuencia. **No usar "clientes cerrados" como métrica semanal:** no se puede accionar sobre ella y desmoraliza en las semanas malas.

---

## 10. Perspectiva a 12 meses

| Trimestre | Foco | Hito | Qué se desbloquea |
|---|---|---|---|
| **Q1 (mes 1–3)** | Validación | 3–5 locales pagando · 1 video con tracción · precio validado | Se sabe si el modelo funciona y a qué precio |
| **Q2 (mes 4–6)** | Repetibilidad | 8–12 locales · CAC medido · referidos generando 1 de cada 3 altas | El proceso de instalación documentado y delegable |
| **Q3 (mes 7–9)** | Palanca | 15–18 locales · **primera contratación de instalación/soporte** | Las horas de Gastón vuelven a la venta y al producto |
| **Q4 (mes 10–12)** | Consolidación | 20+ locales · MRR predecible · decidir MercadoPago | Con MRR real, la decisión de construir cobro online deja de ser una apuesta |

### El punto de quiebre a vigilar
Alrededor de **los 10 locales**, el soporte y las instalaciones se comen las horas de venta y el crecimiento se frena solo. Ese es el momento de la primera contratación, y hay que verlo venir un mes antes — no el día que ya no se puede.

### Qué cambia si hubiera presupuesto
No hay ronda ni inversión prevista; esto se autofinancia con proyectos de agencia. Igual conviene tenerlo escrito:

| Si aparece | Primer destino | Por qué |
|---|---|---|
| $200–500/mes | Instagram/Facebook Ads geolocalizados a 5 km, con el video del tablero | Es el único canal pago donde el ICP realmente está, y el creativo ya existiría |
| Una contratación | Instalación y soporte, **no marketing** | El cuello de botella es físico, no de demanda |
| $1.000+/mes | Recién ahí, un segundo mercado (Salta, Santiago) con una persona local | Sin persona local, el diferenciador no existe |

---

## 11. Stack de operación de marketing

Lo que hace viable un plan de este tamaño con una persona: la estrategia y el cuerpo los pone Gastón, la producción la pone Claude.

| Etapa | Qué se ejecuta | Skills | Herramientas |
|---|---|---|---|
| **Acquisition** | Listas, guiones de visita, mensajes en frío, guiones de video, landing, comparativas, SEO local | \`prospecting\`, \`cold-email\`, \`social\`, \`video\`, \`copywriting\`, \`competitors\`, \`seo-audit\`, \`schema\` | Google Maps, Instagram, TikTok, GBP, GA4, Search Console — todo gratis |
| **Activation** | Checklist de instalación, capacitación, carga de menú | \`onboarding\`, \`sales-enablement\` | \`docs/instalacion-presencial.md\`, panel propio |
| **Retention** | Reporte mensual, prevención de baja, upsell | \`churn-prevention\`, \`emails\`, \`sms\` | WhatsApp, panel propio (ya calcula todo) |
| **Referral** | Mecánica de referidos, pedido de reseñas | \`referrals\` | WhatsApp, GBP |
| **Revenue** | Precio, empaquetado, presentación de la oferta | \`pricing\`, \`offers\` | Panel de superadmin (gating ya construido) |

**Costo total del stack: $0/mes**, salvo el dominio.

---

## 12. Banco de ideas — qué sí y qué no

Leyenda: **Ahora** (90 días) · **Q2** · **Q3+** · **Skip** (con razón)

### Ahora
Venta directa presencial · demo en vivo como material de venta · video del tablero en hora pico · QR de mesa como demo física · página de precios pública · ficha de Google Business Profile · testimonio y reseña el lunes siguiente · instalación del primer local gratis a cambio de contenido · referidos por nombre concreto · tocar los dos vecinos después de instalar · reporte mensual por WhatsApp con sus números · Instagram como vidriera viva.

### Q2
Páginas comparativas \`/vs/\` · caso de éxito escrito con números · secuencia de re-contacto a los que dijeron "ahora no" · upsell a plan Full · programa formal de referidos · optimización de la landing con prueba social real · pedir reseñas de Google sistemáticamente.

### Q3+
Ads geolocalizados (si aparece presupuesto) · segundo mercado con persona local · contenido educativo para dueños de locales · partnerships con proveedores de gastronomía (distribuidores, imprentas de cartas) · programa de instaladores.

### Skip, y por qué
| Idea | Por qué no |
|---|---|
| Product Hunt / directorios de SaaS | Público equivocado. Cero dueños de pizzerías ahí |
| Blog con SEO de contenido largo | 6–9 meses de retorno. No valida nada ahora |
| LinkedIn | El ICP no está |
| Email marketing masivo | No hay lista, y el ICP no lee mail |
| Prueba gratis autoservicio | **Destruiría el diferenciador.** Si se puede probar solo, somos Comandar pero más caro |
| Freemium | Mismo problema, peor: atrae exactamente al cliente que no queremos |
| Expandir a otras provincias | El diferenciador es estar a 15 minutos |
| Construir MercadoPago ahora | No hay evidencia de que sea lo que traba una venta. Preguntar en las primeras 20 visitas antes de decidir |

---

## 13. Medición, RACI y decisiones abiertas

### North-star metric
**Locales pagando la suscripción.** Nada más. No usuarios, no pedidos procesados, no tráfico.

### Indicadores adelantados por etapa

| Etapa | Indicador | Meta 90 días |
|---|---|---|
| Acquisition | Puertas tocadas / semana | 8–12 |
| Acquisition | Demos frente a un dueño / semana | 4+ |
| Activation | Días de la visita al primer pedido real | < 7 |
| Activation | % del menú cargado al arrancar | 100% |
| Retention | Locales que renuevan el mes 2 | 100% de los primeros |
| Referral | Altas que vienen de otro cliente | 1 de cada 3 hacia el mes 6 |
| Revenue | Ticket mensual promedio por local | Definir con el precio |

### RACI

| Área | Responsable | Aprueba | Consultado |
|---|---|---|---|
| Precio y empaquetado | Gastón | Gastón | Claude |
| Lista de prospectos | Claude | Gastón | — |
| Visitas y demos | Gastón | — | — |
| Instalación y capacitación | Gastón | — | — |
| Copy, landing, guiones, contenido | Claude | Gastón | — |
| Grabación de video | Gastón | Gastón | Claude (guion) |
| Medición y análisis | Claude | Gastón | — |

### Decisiones abiertas (en orden de urgencia)

1. **🔴 Precio de los tres planes y del fee de instalación.** Bloquea todo §4. Sin esto no se sale a la calle.
2. **🔴 Dominio propio.** Bloquea la credibilidad de cualquier pieza escrita.
3. **🟡 ¿Cuántas horas por semana reales para visitas?** Si la respuesta honesta es 4 y no 12, el plan de 90 días se recalcula con 4. **Un número real es mejor que uno lindo** — todo el resto del plan depende de este.
4. **🟡 ¿Hay algún local conocido para instalar primero?** Un conocido con un local vale por veinte puertas frías, y desbloquea el video, el testimonio y los números.
5. **🟡 Nombre y marca definitivos.** "Menú Digital" es descriptivo, ayuda al SEO, y no se puede defender. No bloquea los 90 días, sí bloquea cualquier inversión seria en marca.
6. **⚪ ¿MercadoPago traba ventas de verdad?** No decidirlo por intuición: preguntarlo en las primeras 20 visitas y contar.

### Anexos
- \`.agents/product-marketing.md\` — posicionamiento, ICP, objeciones, voz
- \`marketing/prospeccion.md\` — lista, señales de compra, territorio, mecánica de la visita
- \`marketing/cold-email.md\` — copy de mensajes en frío
- \`docs/instalacion-presencial.md\` — checklist de instalación (el diferenciador, documentado)
`;

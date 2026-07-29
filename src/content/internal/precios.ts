export const precios = `# Menú Digital — Estrategia de precios

**Fecha:** 2026-07-28
**Construido con:** skill \`pricing\`
**Contexto base:** \`.agents/product-marketing.md\` §6–8 · \`marketing/plan-marketing.md\` §8

---

## ⚠️ Corrección importante antes de leer el resto

Los documentos anteriores (\`product-marketing.md\`, \`plan-marketing.md\`) usaban **"Pido.club ~$29.900/mes"** como ancla de mercado. Volví a verificar los precios reales de los tres competidores nombrados y **ese dato está mal**:

| Competidor | Lo que se creía | Lo que realmente cobra (verificado 2026-07-28) |
|---|---|---|
| **Pido.club** | $29.900/mes de suscripción | **$29.900 es un pago único de puesta en marcha** (antes $65.000, "promo"). Después no hay suscripción fija: cobran **comisión escalonada sobre las ventas** ("si no vendés, no pagás") |
| **SoyMenu** | — (no estaba en la lista) | **$20.000/mes**, plan único, incluye MercadoPago, soporte por WhatsApp, carga del menú en 24hs (remota, no presencial), fotos ilimitadas |
| **Nedify** | — (no estaba en la lista) | Tres planes: **$7.000 / $8.500 / $10.000/mes** |

**Por qué importa:** si un prospecto te dice "Pido.club me sale $29.900 por mes" y vos repetís esa cifra en una visita, él sabe que no es así — y ahí se cae la credibilidad de todo lo demás que le estás diciendo. El ancla de mercado real de un **SaaS de menú digital puro, sin instalación presencial**, en Argentina hoy, está entre **$7.000 y $20.000 por mes**. Ninguno de los tres tiene instalación presencial, capacitación al personal, ni nadie disponible el viernes a la noche — que es exactamente lo que se está cobrando de más acá.

*(Nota: no encontré precios públicos verificables de Comandar, MiRestoApp, HivePOS, Bistrosoft ni OlaClick — sus sitios no exponen precio o no resolvieron en la búsqueda. Tratalos como parte del mismo rango hasta confirmar uno por uno, no como ancla dura.)*

---

## 1. El metro de valor (qué es lo que se cobra)

**No se cobra por pedido, ni por producto cargado, ni por usuario.** Se cobra por **local con el sistema funcionando**, en tres niveles según cuánto del flujo cubre. Es la métrica correcta acá porque:

- Escala con el valor real que recibe el local (más módulos = más problema resuelto).
- Es fácil de entender sin explicación ("plan Base, plan Salón, plan Full").
- No castiga al local por vender más — cobrar por pedido repetiría el error de PedidosYa, exactamente lo que este producto evita.

---

## 2. La lógica del precio: entre la próxima mejor alternativa y el valor percibido

- **Piso (próxima mejor alternativa):** $20.000/mes — SoyMenu, el más completo de los autoservicio puro.
- **Techo (valor percibido):** lo que el dueño ya pierde. Un pedido que se cae por semana, en un local chico, ronda los $8.000–$15.000. Perder 2-3 por semana ya son $70.000–$150.000/mes en ventas caídas — ese es el techo real de lo que estaría dispuesto a pagar alguien que ya sintió el dolor.
- **El precio va entre esos dos números, más cerca del piso que del techo** (nunca hay que cobrar el máximo que alguien pagaría — eso genera resentimiento y cancelaciones a los dos meses). La franja sana está en **1,5x a 2x el piso del autoservicio puro**, justificado explícitamente por lo que el autoservicio no tiene: instalación presencial, menú cargado a mano, capacitación, soporte real.

---

## 3. Los tres planes — precios recomendados

**Moneda: pesos argentinos. Vigencia: 90 días desde esta fecha (2026-07-28) — ver §5, la cláusula de ajuste es obligatoria, no opcional, en un país con esta inflación.**

| Plan | Precio mensual | Fee de instalación (único) | Contiene |
|---|---|---|---|
| **Base** | **$34.900/mes** | **$55.000** | Menú con fotos, carrito, comanda a WhatsApp, tablero en vivo, historial, PWA con la marca del local |
| **Salón** | **$49.900/mes** | **$70.000** | Base + mesas con QR + pantalla de cocina |
| **Full** | **$64.900/mes** | *(sin fee nuevo — ver §4)* | Salón + stock + CRM de clientes |

### Por qué estos números, no otros

- **Base a $34.900** está ~75% arriba del piso de SoyMenu ($20.000), lo cual es defendible: cubre más flujo (comanda + tablero en tiempo real + alertas + PWA con marca propia, ninguno de los cuales tiene SoyMenu) y viene con instalación presencial. No es agresivo, pero tampoco regala el trabajo.
- **Salón a $49.900** es el salto más grande en términos absolutos (+$15.000) porque agrega el módulo de mayor diferencia percibida (\`tables\`) — el QR que ve el cliente final. Es el plan que hay que empujar en la venta, así que el precio tiene que sentirse justificado de un vistazo: "ahora tu cliente también lo ve" vale ese salto.
- **Full a $64.900** es el techo, pensado para venderse en el mes 2-3, no en la visita — no compite contra nadie en el momento cero, así que puede ser el más caro de los tres sin poner en riesgo el cierre inicial.

**Regla de charm pricing:** terminar en 900, no en números redondos — es el mismo patrón que usa Pido.club y la mayoría de suscripciones locales (Netflix, gimnasios, etc.), y transmite "precio calculado", no "precio inventado".

---

## 4. El fee de instalación — por qué existe y cuánto cubre

**No es un costo a disculpar. Es el diferenciador entero, con precio.** \`product-marketing.md\` ya lo dice: el fee es la prueba de que hay una persona real detrás. Cobrar poco o nada acá enseña al cliente que ese trabajo no vale nada — y es la parte que después no se puede subir sin fricción.

**Qué cubre, en horas de trabajo real** (referencia para vos, para poder recalcular si tu tiempo vale más o menos):

| Tarea | Horas aprox. |
|---|---|
| Visita + demo | 0,5–1 h |
| Carga del menú completo con fotos (~20-30 productos) | 2–4 h |
| Capacitación al personal | 0,5–1 h |
| Impresión y colocación de QR (solo plan Salón) | 0,5 h |
| Disponibilidad el primer fin de semana | Costo de oportunidad, no horas exactas |

Con esas horas y una tarifa de referencia de **~$12.000–$15.000/hora** (ajustable — es tu costo de oportunidad real, no un número universal), el fee de Base ($55.000) cubre 4-5 horas, y el de Salón ($70.000) cubre el trabajo extra de imprimir y colocar los QR y capacitar también al mozo.

**El upgrade a Full NO lleva un fee de instalación nuevo.** El sistema de módulos ya está construido para que activar \`inventory\` y \`crm_loyalty\` sea un flag, sin visita — cobrar un fee ahí contradice tu propio producto. Si hace falta una charla de 20-30 minutos para explicar el stock y el CRM, se puede sumar como una **"activación" de $15.000** opcional, no como un fee completo — pero no es necesario para que la venta funcione.

**La única excepción al fee:** el primer local, gratis, a cambio de testimonio, números y permiso para grabar (ya está en \`plan-marketing.md\` §8, punto 1). Es una inversión puntual, no un precedente — no se repite con el cliente #2.

---

## 5. La cláusula que no podés saltear: ajuste por inflación

Esto es lo más específico de vender en Argentina y lo que un asesor de pricing genérico no te va a decir: **un precio fijo en pesos, escrito en un contrato o dicho de palabra sin fecha de revisión, se vuelve un regalo al cliente en 4-6 meses.**

**Lo que hacen los negocios locales que ya resolvieron esto** (gimnasios, alquileres, seguros): ajuste periódico explícito, dicho desde el primer día, no como sorpresa.

**Recomendación concreta para Menú Digital:**
- **Revisión cada 90 días**, no anual. Anual es demasiado tiempo en esta economía.
- Decirlo en la visita, como parte normal de la oferta, no como letra chica: *"El precio se actualiza cada tres meses. Te aviso siempre con anticipación, nunca de sorpresa en la factura."*
- **No ofrecer descuento por pago anual.** Es la tentación clásica de pricing genérico (\`references/tier-structure.md\` sugiere 17-20% off anual) y **acá es un error**: te obliga a vos a sostener un precio de hoy durante 12 meses de inflación, license perdiendo valor real todo el año. Si un cliente quiere pagar por adelantado, se puede aceptar **trimestral, nunca anual**, sin descuento — el beneficio para él ya es no tener que pensarlo por 3 meses.
- Formato sugerido de comunicación del ajuste: un WhatsApp simple, el mismo canal de siempre — *"Che, te aviso que desde el mes que viene el plan pasa a $X. Es el ajuste de cada trimestre, nada cambia del servicio."*

---

## 6. Cómo se presenta el precio (nunca solo, nunca primero)

Ya está en \`mensajes-en-frio.md\` §5 y sigue siendo la forma correcta — este documento solo confirma los montos a usar ahí:

> *"¿Cuántos pedidos se te caen un viernes porque no llegás a contestar? ¿De cuánto es cada uno? Bueno, con uno por semana ya está pagado."*

Con Base a $34.900/mes, esa frase se sostiene matemáticamente: un pedido perdido por semana de ~$9.000 ya son ~$36.000/mes — el mensaje sigue siendo literalmente cierto, no una exageración de venta.

**Nunca dar el número por chat antes de mostrar el producto** (regla ya escrita en \`mensajes-en-frio.md\` §5) — sigue aplicando sin cambios.

---

## 7. Objeción de precio — respuesta actualizada

| Objeción | Respuesta |
|---|---|
| "Comandar/Pido me sale más barato" | "Pido en realidad no cobra mensual — es un pago único y después te cobran comisión sobre lo que vendas. Achicá cuenta: cuánto más vendés, más les das. Acá es fijo, siempre, sin importar cuánto vendas." |
| "SoyMenu tiene un plan de $20.000" | "Sí, y es solo el menú digital — vos seguís cargando todo a distancia y sin nadie que te capacite. Acá vengo, te lo dejo andando con tu menú real y estoy el primer viernes. Es otro producto, no el mismo más caro." |
| "¿Por qué el fee de instalación, si el software ya está hecho?" | "El software es la parte fácil. Lo que cobra el fee es que vos no tengas que cargar 30 productos con fotos un domingo a la noche — lo hago yo, con vos, ese mismo día." |

---

## 8. Boceto de página \`/precios\`

Para cuando se construya la página pública (\`plan-marketing.md\` §4, Movida 5). Estructura mínima, sin vueltas:

\`\`\`
Título: Tres planes. Ninguno cobra comisión.

[Base]                    [Salón]  ⭐ Más elegido    [Full]
$34.900/mes               $49.900/mes                $64.900/mes
+ $55.000 instalación     + $70.000 instalación       (upgrade sin fee)

Menú con fotos             Todo lo de Base             Todo lo de Salón
Comanda por WhatsApp       + Mesas con QR              + Stock por producto
Tablero en vivo            + Pantalla de cocina         + Ficha de cliente
Historial y facturación

[Mandame un WhatsApp]      [Mandame un WhatsApp]       [Mandame un WhatsApp]

Los tres incluyen: instalación presencial, capacitación al personal,
soporte el primer fin de semana. Sin contrato atado. Precio revisado
cada 3 meses, siempre avisado antes.
\`\`\`

**No poner el toggle mensual/anual** que sugiere el pricing genérico — ya se explicó por qué en §5.

---

## 9. Próxima revisión

**Fecha sugerida de revisión: 2026-10-28** (90 días). En esa fecha, recalcular contra:
1. Inflación acumulada del trimestre (índice de referencia, no una corazonada).
2. Lo que efectivamente contestaron los primeros prospectos sobre el precio (si nadie objeta nunca, está bajo; si todos objetan, está alto — la primera señal real es la calle, no este documento).
3. Si Pido.club, SoyMenu o Nedify cambiaron su modelo.

---

## Changelog
- v1 (2026-07-28) — Documento inicial, construido con la skill \`pricing\`. Corrige un dato mal citado en documentos anteriores (Pido.club no cobra $29.900/mes, cobra $29.900 una vez + comisión sobre ventas) tras verificar precios reales de Pido.club, SoyMenu y Nedify. Precios recomendados: Base $34.900 + $55.000 instalación, Salón $49.900 + $70.000, Full $64.900 sin fee nuevo. Incluye cláusula de ajuste trimestral por inflación (recomendación específica para operar en Argentina) y recomendación explícita de NO ofrecer descuento por pago anual.
`;

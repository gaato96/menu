# marketing/ — el departamento de marketing y ventas de VivoMenu

Se arma siguiendo `D:\Gutmark\Diseño Web\Claude Proyectos\Contenido\PROMPT-MAESTRO-marketing-nuevo-negocio.md`,
fase por fase, con el visto bueno de Gastón al cerrar cada una. Arrancó el 2026-11-18.
El `CLAUDE.md` de la raíz del repo es del código y no se mezcla con este.

## Qué manda sobre qué

| Tema | Manda | Estado |
|---|---|---|
| Producto, público, objeciones, tono, metas | `../.agents/product-marketing.md` (v3) | ✅ fase 0 |
| Cómo habla el cliente | `investigacion/voz-del-cliente.md` | ✅ fase 0 (se completa en la 1) |
| Competencia y cuentas del nicho | `investigacion/competencia-2026-11.md` | ✅ fase 1 (falta grupo C) |
| Qué contenido rinde | `investigacion/matriz-2026-11.md` | ✅ fase 2 |
| A quién, qué y a qué precio | `notas/01-plan.md` | ✅ fase 3 (faltan las confirmaciones de §8) |
| Estado y fechas (cada viernes) | `notas/02-panorama.md` | ✅ se actualiza cada viernes |
| Cómo se consiguen los clientes | `notas/02b-adquisicion.md` + `ventas/mensajes.md` y `ventas/respuestas.md` (y el Galu CRM, sistema VivoMenu) | 📝 fase 10, borrador |
| Día por día (seis semanas) | `notas/03-dia-por-dia.md` (y el calendario en `/interno-64a0f7d0/calendario`) | ✅ fase 9 |
| Medición y reglas de cambio | `notas/05-medicion.md` | ✅ fase 9 |
| Contenido 90 días | `notas/04-contenido.md` | ✅ fase 4 (reemplazó a `plan-contenido.md`) |
| Ideas de reels | `contenido/reels/backlog.md` | ✅ fase 5 (30 ideas, 12 con fecha) |
| Historias y estados | `contenido/historias/README.md` | ✅ fase 6 (las de fundadores esperan el §8 del plan) |
| Cómo se arma cada reel | `../.claude/skills/paquete-reel-vivomenu/` (skill) y `../.claude/skills/radar-contenido/` (radar mensual) | ✅ fase 7 |
| Cómo se produce cada video | `contenido/reels/PRODUCCION.md` (con las reglas de edición de Gastón) y los moldes de `contenido/reels/moldes/` | ✅ fase 8 |
| Recursos que se mandan por DM | `contenido/recursos/` | fase 3 y 5 |
| Lo que se creía antes | `notas/10-archivo.md` | se suma con cada cambio |

**El CRM:** la prospección de VivoMenu se trabaja en el Galu CRM (`D:\Gutmark\Diseño Web\SaaS\Galuweb CRM\galuweb-crm`), módulo Prospección, sistema VivoMenu. Los mensajes viven en su `src/lib/vivomenu-mensajes.ts`: si cambian acá, se cambian allá.

**Los documentos viejos de esta carpeta** (`plan-marketing.md`,
`prospeccion.md`, `sistema-prospeccion-frio.md`, `mensajes-en-frio.md`, `precios.md`,
`progreso.md`, `reel-01-comision.md`, de julio y agosto) **ya no mandan**,
salvo `manual-de-marca.md` / `nombres-y-marca.md` en la identidad visual. **`precios.md` tampoco
manda desde el 2026-11-18:** instalación gratis, Base propuesto a $24.900 (ver `notas/10-archivo.md`). Se leen como antecedente. Cuando la fase que los
reemplaza esté aprobada, se borran y lo que se creía antes pasa a `notas/10-archivo.md` (regla 8).
**El calendario de contenido** (`/interno-64a0f7d0/calendario`) sale de `src/content/internal/calendario-contenido.ts`: cuando cambia el backlog o el día por día, se cambia ahí también.
**El panel interno** (`/interno-64a0f7d0`, solo superadmin) muestra las notas vigentes, generadas con `npm run docs:internal` (correrlo y commitear después de cada cambio). Los `src/content/internal/*.ts` viejos son copias de los documentos de julio y agosto que muestra
`/interno-64a0f7d0` (ahora solo para el superadmin). Cuando se reemplacen, hay que actualizar
también esa página.

## Las reglas (del prompt maestro, no se negocian)

1. **Nada inventado.** Ni números, ni clientes, ni testimonios, ni funciones que el producto no
   tiene. Un número sale de una prueba real o de una fuente; un caso ajeno se confirma en dos
   fuentes serias. Un ejemplo se dice que es un ejemplo. **Hoy no hay ningún caso real.**
2. Antes de escribir sobre el producto, leer `.agents/product-marketing.md` §2 (lo que existe).
   Mercado Pago e impresión existen pero **no están probados en real**: no se muestran en un reel
   hasta probarlos.
3. El contenido posiciona; la venta va por mensajes, historias y conversaciones.
4. Se le habla al dueño gastronómico desde el primer reel.
5. Ninguna pieza le dice al dueño que no necesita lo que vendemos. Tampoco "dejá PedidosYa": la
   postura es "que el cliente que ya te pide directo no se te pierda".
6. De otras cuentas se copia la estructura, nunca las frases.
7. Se planifica con el tiempo real. Nada después de las 23.
8. Lo superado se borra y va al archivo con fecha.
9. Español rioplatense en todo; los prompts de video e imagen, en inglés.
10. Todo texto público pasa por `humanizer` antes de entregarse.

## Cómo trabaja Gastón

Delegar en Claude todo lo automatizable. Gastón hace solo lo que necesita su intervención: publicar,
mandar mensajes desde su teléfono, generar voz (ElevenLabs) y clips (Google Flow) en sus cuentas,
visitar locales. Contenido **sin cara** (B-roll + motion graphics + voz en off), **3 reels por
semana**. Publicidad: $0. Comparte la semana con Galu (ver `../../Contenido/web-galu`).

## Datos que no cambian

- Sitio: `vivomenu.com.ar` · demo `vivomenu.com.ar/m/burger-house-tuc` · WhatsApp `wa.me/543815976357`
- Instagram `@vivomenu.app` al 2026-11-18: 23 seguidores (21 en la captura de ese día), 154 seguidos, 7 publicaciones: 6 carruseles y 1 reel ("Por cada venta de $10.000, −$2.500 se los lleva la app"). Bio: "Menú QR en vivo para mesas y delivery · Menos caos en WhatsApp, más ventas · Tucumán · Probá el demo", link al demo
- Zona de arranque: San Miguel de Tucumán, **delivery y mostrador primero** (allá predominan los delivery sin local al público)
- Modelo (2026-11-18): **instalación gratis hecha por Gastón** (carga la carta con IA), 15 días de prueba, cobro a mano. Base propuesto **$24.900/mes** con todo; adicionales Stock, Mercado Pago y Salón (precios a definir en la fase 3)
- Cuentas para la matriz: **las elige Gastón** (la búsqueda de la fase 1 le pareció insuficiente)
- **Apify: nunca pasar el plan gratis** (USD 5/mes). Estimar, topar y, si no entra, partir en tandas

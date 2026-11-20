# Archivo — lo que se creía antes y por qué cambió

Regla 8 del prompt maestro: lo superado no se deja dando vueltas en las notas vigentes, se anota
acá con fecha. Lo más nuevo, arriba.

---

## 2026-11-20 — Lo de julio y agosto, al archivo

A pedido de Gastón, el panel interno muestra solo lo vigente. `plan-marketing.md`, `prospeccion.md`,
`sistema-prospeccion-frio.md`, `mensajes-en-frio.md`, `precios.md`, `progreso.md` y
`reel-01-comision.md` pasaron a `marketing/archivo/2026-07-08/` y sus copias del panel se borraron.
Los reemplazan `notas/01-plan.md`, `02b-adquisicion.md`, `ventas/` y `02-panorama.md`.

## 2026-11-20 — Fase 8: la producción en video (`contenido/reels/PRODUCCION.md`)

| Lo que se creía | Desde | Lo que cambió | Por qué |
|---|---|---|---|
| La producción era **una plantilla de carrusel** (Canva/Figma, paleta y tipografía, 15 a 20 minutos por carrusel) | 2026-07-28 (`guia-produccion.md` v2) | **Tres moldes de video en hyperframes** (historia animada, corto de texto, pantalla real), sin cara, con la misma paleta y las mismas tipografías | La fase 4 pasó el contenido a reels; el carrusel queda solo para repartir una pieza que ya anduvo |

`guia-produccion.md` y `src/content/internal/guia-produccion.ts` se borraron (también su pestaña en
`/interno-64a0f7d0`). El texto completo queda en el historial de git. La paleta y las tipografías
siguen en `manual-de-marca.md`.

## 2026-11-19 — Fase 4: el plan de contenido nuevo (`notas/04-contenido.md`)

| Lo que se creía | Desde | Lo que cambió | Por qué |
|---|---|---|---|
| **Carrusel como formato principal**; reels "solo como repurposing ocasional" (5 %) | 2026-07-28 (`plan-contenido.md` v2) | **Reels como formato principal**, 3 por semana, sin cara, en tres formatos (historia animada, pantalla real, corto de texto) | Con 15 a 23 seguidores el carrusel casi no llega a nadie (lo decía el mismo plan en su §3.1), y la matriz del 19/11 muestra que en el rubro rinde la escena animada |
| Pilares "Errores que cuestan plata", "Cómo se hace", "La cuenta simple", "Lecciones de locales reales" | 2026-07-28 | **Seis series** con patrón de la matriz: Dos deliverys, El dato, Viernes 21:30, ¿Y si…? Probé, El chat del viernes, Tu carta de Instagram | Cada serie sale de un patrón medido contra la mediana de su cuenta |
| "Filmar el tablero en hora pico es una demo, no contenido" | 2026-07-28 (`plan-contenido.md` §0) | **El tablero vuelve, pero dentro de una escena con hora y contador** ("Viernes 21:30") | En la matriz, el producto mostrado así rinde de 6,8 a 27 veces (Menu4D); lo que no rinde es la autopromoción sin escena |
| Seguir 20 a 30 gastronómicos por día y buscar colaboraciones con locales | 2026-07-28 (`plan-contenido.md` §3.1) | **15 minutos de comentarios por día** donde está el dueño; las colaboraciones, con los fundadores y con permiso | El método que se usa en @galu.web; seguir en masa no trae al que compra |

`plan-contenido.md` y `src/content/internal/plan-contenido.ts` se borraron (también su pestaña en
`/interno-64a0f7d0`). El texto completo queda en el historial de git.

## 2026-11-18 — Decisiones de Gastón después de la fase 1

| Lo que se creía | Desde | Lo que cambió | Por qué |
|---|---|---|---|
| Se cobra una **instalación presencial** ($55.000 Base, $70.000 Salón): visita, carga de la carta, capacitación. "El fee es la prueba del diferencial" | 2026-07-28 (`precios.md` §4) | **La instalación la hace Gastón, gratis** (carga la carta con IA y deja andando todo). Se suman recorrido guiado y guía de uso | Nadie más cobra instalación (Fudo, Comandar, SoyMenu cargan gratis o no cobran) y VivoMenu era el más caro del rubro |
| (Por unas horas) **Autoinstalable**: que el local se dé de alta solo | 2026-11-18 | **Descartado** el mismo día | Sin ningún cliente todavía, conviene acompañar a cada uno; el alta y el cobro siguen a mano desde el superadmin |
| **Tres planes:** Base $34.900, Salón $49.900, Full $64.900 | 2026-07-28 (`precios.md` §3) | **Un plan Base propuesto a $24.900** con todo lo de operar (tablero, cocina, impresión, caja, clientes, IA, resumen) + adicionales Stock, Mercado Pago y Salón | Comandar $9.900, SoyMenu $20.000, Fudo Inicial $23.900 (fase 1). El precio final se confirma en la fase 3 |
| Diferenciador #1: **"Alguien te lo deja andando y está el viernes a la noche"** | 2026-07-28 (`product-marketing.md` §6-7) | **Descartado** | Gastón: no diferencia de nada. Se busca otro en la fase 3 |
| El plan **Salón** era "el que hay que empujar en la venta"; el segmento B (salón) "duplica el universo de locales" | 2026-07-28 (`precios.md` §3, `product-marketing.md` §3) | **Se entra por delivery y mostrador; Salón es un adicional** | En Tucumán hay más delivery sin local al público que locales con salón (Gastón), el salón cae 7 meses seguidos y el delivery es hasta 80% de la facturación en hamburgueserías y sushi (fase 1) |
| **Canal principal: venta directa presencial**, "cuando toques timbre ya te hayan visto" | 2026-07-28 (`product-marketing.md` §13) | Queda abierto hasta la fase 10 | Si el producto es autoinstalable, la visita deja de ser obligatoria para cerrar |
| `marketing/precios.md` mandaba en los montos | 2026-11-18 (fase 0, `marketing/CLAUDE.md`) | **Ya no manda** | Los montos cambiaron (arriba) |

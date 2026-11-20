# VivoMenu — Progreso y próximas tareas

**Última actualización:** 2026-08-13 (jueves — día de contacto de VivoMenu)
**Cómo usar este documento:** se actualiza cada vez que se completa algo del roadmap (`plan-marketing.md` §9) o del plan de contenido (`plan-contenido.md`). Sirve para ver de un vistazo qué está hecho y qué es lo próximo a priorizar — no duplica el detalle de cada plan, solo lleva el estado.

---

## 1. Hecho

| Fecha | Ítem | Detalle |
|---|---|---|
| 2026-08-06 | Rebrand completo | Logo, nombre VivoMenu, manual de marca — landing, login, header/footer, iconos PWA, favicon |
| 2026-08-06 | Dominio propio | `vivomenu.com.ar` comprado y apuntando a Vercel. Sitio en vivo |
| 2026-08-06 | Instagram creado | `@vivomenu.app` |
| 2026-08-06 | Primer carrusel publicado | "5 errores que te hacen perder pedidos por WhatsApp" (pilar 1.1 — Errores que cuestan plata) |
| 2026-08-06 | Cuenta Gmail de VivoMenu | Creada. Es la cuenta dueña de GA4, Search Console y (semana 4) Google Business Profile |
| 2026-08-06 | Sistema de prospección en frío | `sistema-prospeccion-frio.md` — escalera de mensajes, uso del scraper, oferta de valor, rampa de volumen |
| 2026-08-06 | Links de los mensajes actualizados | `mensajes-en-frio.md` pasó de `menu-digital.com` a `vivomenu.com.ar` en las 8 plantillas |
| 2026-08-06 | Análisis competitivo de Menuly | Comparación completa + roadmap de 7 fases para cerrar la brecha. Plan aprobado |
| 2026-08-06 | **Generador de fotos con IA (Fase 1)** | En producción. Modelo con tier gratuito por defecto, acepta foto de cámara o archivo existente |
| 2026-08-06 | **Módulo de Caja (Fase 2)** | En producción, apagado por defecto. Apertura, cobro con propina y descuento, movimientos, arqueo y reportes |
| 2026-08-10 | **Módulo Salón** | En producción, verificado en vivo. Plano visual de mesas (redondas/cuadradas, arrastrables), pedido cargado por el mozo desde la mesa (entra directo confirmado), y corregido un bug preexistente que rompía el primer pedido de cada día nuevo (`create_priced_order`, código de orden sin fecha) |
| 2026-08-10 | Rendimiento del panel | Auth reescrita para verificar el JWT local en vez de contra el servidor, más lecturas en paralelo — 40-60% más rápido en la primera carga. Agregados skeletons de carga por módulo |
| 2026-08-10 | Reordenamiento de la navegación | Pestañas de uso diario (Comandas, Caja, Salón, Cocina) primero; ajustes y configuración al desplegable |
| 2026-08-13 | 5 carruseles publicados | "5 errores...", "3 errores de carta...", "4 preguntas en el orden correcto", "¿Cuánto te cuesta la comisión?", "El cliente no cancela por 45 min". Interacción mínima — diagnosticado como problema de distribución de cuenta fría (15 seguidores), no de contenido (`plan-contenido.md` §3.1) |
| 2026-08-13 | Guion del primer Reel | Guion completo (ElevenLabs), prompts de clips (Google Veo) y brief de motion graphics en `marketing/reel-01-comision.md` — adelantado desde la semana 8 del plan original |

## 2. En curso

| Ítem | Estado | Próximo paso |
|---|---|---|
| Reel 01 — "La comisión que no ves" | Guion y prompts listos, sin producir | Generar los 6 clips en Veo, la voz en ElevenLabs, y pasarle el brief al editor (`reel-01-comision.md`) |
| Visibilidad de la cuenta | 15 seguidores, sin atajo disponible (se descartó usar una cuenta previa de Gastón — historial de marca incompatible) | Seguir ICP gastronómico de Tucumán desde la cuenta, buscar colaboraciones con locales reales (`plan-contenido.md` §3.1) |
| Medición (Movida 3) | Dominio y Gmail listos. Falta GA4, Search Console, schema | Ver §3 |
| Prospección en frío | Sistema escrito, sin enviar todavía | Primeros mensajes (§3) |
| Producto — cerrar brecha con Menuly | Fases 1, 2 y Salón subidas. **Sin más fases hasta tener el primer cliente** | Rotar la API key de Gemini que quedó expuesta en chat |

## 3. Próximas tareas, priorizadas

### Hoy — jueves 13/8 (día de contacto)

| # | Tarea | Quién |
|---|---|---|
| 1 | **Rotar la API key de Gemini** que quedó pegada en el chat y actualizarla en Vercel | Gastón |
| 2 | Generar los 6 clips del Reel 01 en Google Veo con los prompts de `reel-01-comision.md` §2 | Gastón |
| 3 | Generar la voz en off en ElevenLabs con `reel-01-comision.md` §1 | Gastón |
| 4 | Grabar la captura real de pantalla del tablero para el editor (`reel-01-comision.md` §3.4) | Gastón |
| 5 | Mandar mensajes de prospección del día — tibios primero si hay (`sistema-prospeccion-frio.md` §7.4) | Gastón |
| 6 | Confirmar estado de GA4 y Search Console (verificar si ya se hizo — quedaba pendiente al 6/8) | Gastón |

### Esta semana

| # | Tarea | Quién |
|---|---|---|
| 7 | Pasarle el brief de edición (`reel-01-comision.md` §3) al editor y publicar el Reel 01 | Gastón |
| 8 | Empezar a seguir ICP gastronómico de Tucumán desde `@vivomenu.app`, 20-30/día (`plan-contenido.md` §3.1) | Gastón |
| 9 | Identificar 1-2 locales para proponer una colaboración de Instagram | Gastón |
| 10 | Confirmar en el sitio deployado (no en el pane del navegador embebido) que un hard refresh de una pantalla del panel carga bien — quedaba pendiente de verificar | Gastón |

### Sábado — día de investigación, no de envío

| # | Tarea | Quién |
|---|---|---|
| 11 | Pasada de señales en Instagram sobre el CSV filtrado, con capturas (`prospeccion.md` §4) | Gastón |
| 12 | Dejar escritos los mensajes del próximo martes | Claude + Gastón |

**No hace falta todavía:** Google Tag Manager. Con GA4 directo alcanza — GTM suma recién cuando hay más de un tag que coordinar (ej. Píxel de Meta), y `plan-marketing.md` §4 descarta pauta paga por presupuesto $0.

## 4. Calendario de contacto (compartido con Galu)

| Día | Quién | Trabajo |
|---|---|---|
| Lunes, miércoles, viernes | Galu | — |
| **Martes, jueves** | **VivoMenu** | Envíos: primeros contactos + seguimientos + responder (15:00–18:00) |
| **Sábado** | **VivoMenu** | **Sin envíos.** Investigación y preparación de los mensajes del martes |

**Rampa de volumen** (`sistema-prospeccion-frio.md` §7.2): semana 1 → 5 por día de envío · semana 2 → 8 · semana 3 → 10 · semana 4+ → 12 (techo, ~24/semana).

## 5. Preguntas abiertas

- ¿12 mensajes por día de envío es sostenible una vez que se acumulen los seguimientos? Se responde solo en la semana 4.
- A las 3 semanas (~46 mensajes): recalcular las tasas reales del embudo contra las estimadas en `prospeccion.md` §2.
- Una vez instalado el primer local: ¿el cuello de botella pasa a ser escribir mensajes o hacer las visitas?

---

## Changelog
- v3 (2026-08-13) — Sumado: módulo Salón completo (plano visual, pedido del mozo, fix del bug de código de orden por día), mejora de rendimiento del panel, reordenamiento de navegación, 5 carruseles publicados, guion y prompts del Reel 01 (`reel-01-comision.md`). Diagnosticada la baja interacción como problema de distribución de cuenta fría, no de contenido. Evaluado y descartado usar una cuenta de Instagram previa de Gastón para ganar seguidores — incompatible por historial de marca. Reescrita la sección de próximas tareas al estado real del 13/8; varias tareas del 6/8 (GA4, Search Console, envío de mensajes) quedan sin confirmar y hay que chequear su estado antes de asumir que están hechas.
- v2 (2026-08-06) — Corregidas las fechas (v1 decía 2026-07-31 por error). Sumado: Gmail creado, sistema de prospección en frío, links actualizados en `mensajes-en-frio.md`. Reorganizadas las tareas por horizonte (hoy / esta semana / sábado) y agregado el calendario de contacto compartido con Galu.
- v1 (2026-08-06) — Documento creado.

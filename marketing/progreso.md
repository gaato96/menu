# VivoMenu — Progreso y próximas tareas

**Última actualización:** 2026-08-06 (jueves — día de contacto de VivoMenu)
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

## 2. En curso

| Ítem | Estado | Próximo paso |
|---|---|---|
| Carruseles de arranque | 1 de 3 publicados | Los 2 restantes de la semana 1 (`plan-contenido.md` §2 — sugeridos: 1.2 "Los 4 datos que necesitás pedir siempre" y 1.3 "¿Cuánto te cuesta la comisión de delivery?") |
| Medición (Movida 3) | Dominio y Gmail listos. Falta GA4, Search Console, schema | Ver §3 |
| Prospección en frío | Sistema escrito, sin enviar todavía | Primeros 5 mensajes hoy (§3) |
| Producto — cerrar brecha con Menuly | Fases 1 y 2 subidas. **Sin más fases hasta tener el primer cliente** | Correr la migración de Caja y probar el flujo completo |

## 3. Próximas tareas, priorizadas

### Hoy — jueves 6/8 (día de contacto)

| # | Tarea | Quién |
|---|---|---|
| 1 | Verificar el perfil de WhatsApp Business: nombre "VivoMenu", logo, descripción, categoría | Gastón |
| 2 | **Mandar los primeros 5 mensajes** — empezando por contactos tibios de Galu si los hay (`sistema-prospeccion-frio.md` §7.4) | Gastón |
| 3 | Crear propiedad GA4 con la cuenta nueva y pasar el Measurement ID (`G-XXXXXXX`) | Gastón |
| 4 | Verificar el dominio en Search Console con la misma cuenta | Gastón |
| 5 | **Correr las migraciones pendientes**: `20260806001000_ai_images_model.sql` y `20260806002000_cash_register.sql` | Gastón |
| 6 | Probar el generador de fotos y confirmar en Cloud Billing si figura consumo | Gastón |
| 7 | Prender el módulo Caja para Burger House desde `/admin` y probar el ciclo completo (abrir, cobrar, gasto, arquear, cerrar) | Gastón |

### Esta semana

| # | Tarea | Quién |
|---|---|---|
| 5 | Instalar GA4 + evento de conversión en el botón de WhatsApp | Claude (al recibir el ID) |
| 6 | Sitemap a Search Console + título, meta description y schema `LocalBusiness` con "Tucumán" | Claude |
| 7 | Revisar cartera de Galu, marcar gastronómicos, pedir referidos | Gastón |
| 8 | Correr el scraper de Google Maps y hacer el descarte automático (`sistema-prospeccion-frio.md` §3.2) | Gastón |
| 9 | Publicar los 2 carruseles que faltan | Gastón (Claude escribe el copy) |

### Sábado 8/8 — día de investigación, no de envío

| # | Tarea | Quién |
|---|---|---|
| 10 | Pasada de señales en Instagram sobre el CSV filtrado, con capturas (`prospeccion.md` §4) | Gastón |
| 11 | Dejar escritos los 8 mensajes del martes | Claude + Gastón |

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
- v2 (2026-08-06) — Corregidas las fechas (v1 decía 2026-07-31 por error). Sumado: Gmail creado, sistema de prospección en frío, links actualizados en `mensajes-en-frio.md`. Reorganizadas las tareas por horizonte (hoy / esta semana / sábado) y agregado el calendario de contacto compartido con Galu.
- v1 (2026-08-06) — Documento creado.

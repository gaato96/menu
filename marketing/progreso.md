# VivoMenu — Progreso y próximas tareas

**Última actualización:** 2026-07-31
**Cómo usar este documento:** se actualiza cada vez que se completa algo del roadmap (`plan-marketing.md` §9) o del plan de contenido (`plan-contenido.md`). Sirve para ver de un vistazo qué está hecho y qué es lo próximo a priorizar — no duplica el detalle de cada plan, solo lleva el estado.

---

## 1. Hecho

| Fecha | Ítem | Detalle |
|---|---|---|
| 2026-07-31 | Dominio propio | `vivomenu.com.ar` comprado y apuntando a Vercel. Sitio en vivo: `https://vivomenu.com.ar/` |
| 2026-07-31 | Instagram creado | `@vivomenu.app` |
| 2026-07-31 | Primer carrusel publicado | "5 errores que te hacen perder pedidos por WhatsApp" (pilar 1.1 — Errores que cuestan plata) |
| — | Rebrand completo | Logo, nombre VivoMenu, manual de marca — landing, login, header/footer, iconos PWA, favicon |

## 2. En curso

| Ítem | Estado | Próximo paso |
|---|---|---|
| Carruseles de arranque (semana 1) | 1 de 2-3 publicados | Publicar los 2 restantes de la semana 1 (`plan-contenido.md` §2 — sugeridos: 1.2 "Los 4 datos que necesitás pedir siempre" y 1.3 "¿Cuánto te cuesta la comisión de delivery?") |
| Movida 3 — Dominio + medición | Dominio listo. Falta: cuenta Gmail dedicada, GA4, Search Console, schema | Ver §3 abajo |

## 3. Próximas tareas — semana 1 (priorizadas)

| # | Tarea | Quién | Por qué ahora |
|---|---|---|---|
| 1 | Crear cuenta de Gmail dedicada a VivoMenu (no la de Galu) | Gastón | Va a ser la cuenta "dueña" de Search Console, GA4 y (semana 4) Google Business Profile. Separarla de entrada evita tener que migrar propiedades más adelante |
| 2 | Crear propiedad GA4 en analytics.google.com con esa cuenta nueva, agregar a Gastón (o Galu) como usuario editor, y pasarle a Claude el Measurement ID (`G-XXXXXXX`) | Gastón | Sin esto, no se puede medir nada de lo que ya está en producción |
| 3 | Instalar GA4 en el código + evento de conversión en el botón "Escribinos" de WhatsApp | Claude | En cuanto llegue el Measurement ID del punto 2 |
| 4 | Verificar el dominio en Google Search Console (con la misma cuenta) y enviar el sitemap | Gastón (verificación) + Claude (sitemap) | Indexación en Google empieza a contar desde que se verifica, no desde que se sube el sitio |
| 5 | Título, meta description y schema `LocalBusiness` con "Tucumán" | Claude | SEO local — barato y ya está planificado en `plan-marketing.md` §4 Movida 3 |
| 6 | Revisar la cartera de Galu, marcar contactos del rubro gastronómico, pedir referidos | Gastón | `prospeccion.md` §7 — es el canal con mejor tasa de respuesta, va antes que cualquier mensaje frío |
| 7 | Armar lista de 40 locales con señales (`prospeccion.md` §5) | Claude + Gastón | Insumo para empezar a mandar los ~20-25 mensajes/semana |
| 8 | Empezar a mandar mensajes (WhatsApp/IG DM) | Gastón | Arranca el embudo de adquisición real, en paralelo al contenido |

**No hace falta todavía (más adelante):** Google Tag Manager. Con GA4 instalado directo alcanza — GTM solo suma valor cuando hay más de un tag que coordinar (ej. Pixel de Meta para pauta paga), y `plan-marketing.md` §4 descarta pauta paga por ahora ($0 de presupuesto). Se agrega GTM el día que eso cambie.

## 4. Preguntas abiertas

- ¿20-25 mensajes/semana es sostenible de verdad, o el número real es otro? (`prospeccion.md` §Preguntas abiertas)
- Una vez instalado el primer local: ¿el cuello de botella pasa a ser escribir mensajes o hacer las visitas? Decide si conviene delegar más la redacción o si el límite es el tiempo de visita.

---

## Changelog
- v1 (2026-07-31) — Documento creado. Registra dominio propio + Instagram + primer carrusel como hechos, y prioriza medición (GA4/Search Console) y prospección como próximos pasos de la semana 1.

# Auditoría de VivoMenu — 18/11/2026

> **Estado al 18/11 (misma fecha, más tarde):** 1.1, 1.2, 2.1 y 2.2 arreglados en el código (2.2
> dejó de ser un error porque Mercado Pago e impresión ya existen). De la §4 se hicieron 4.1
> (importar carta), 4.2 en su versión "ya salió", 4.3 (impresión), 4.4 (Mercado Pago) y 4.5
> (resumen semanal). Las migraciones están aplicadas en Supabase. **Falta desplegar** para que
> llegue a vivomenu.com.ar.

Qué se revisó: el código (154 archivos, ~20.000 líneas), typecheck, lint, tests unitarios, build de
producción, y el sitio en vivo (`vivomenu.com.ar`) con pedidos GET de solo lectura. **No** se
corrieron `test:rls` ni `test:e2e` porque escriben en el proyecto real de Supabase.

**Lo que anda bien:** typecheck limpio, lint con 0 errores (2 avisos por `<img>`), 71 tests
unitarios pasan, el build de producción termina sin errores. La arquitectura (RLS como autoridad,
precio recalculado en el servidor, pedido guardado antes del WhatsApp, tres canales de tiempo real)
está bien pensada y bien documentada.

---

## 1. Errores críticos (arreglar ya)

### 1.1 Falta `NEXT_PUBLIC_SITE_URL` en Vercel → los QR de las mesas apuntan a `localhost`

En producción, `og:image` sale como `http://localhost:3000/opengraph-image…` y el sitemap y el
robots también dicen `localhost:3000`. Es la misma variable que usa la pantalla de QR
(`src/app/(panel)/panel/salon/qr/page.tsx:29`), así que **cada QR de mesa generado en producción
lleva a `http://localhost:3000/m/…` y no abre en el teléfono de nadie.**

Además:
- **Cada link a `vivomenu.com.ar` que mandás por WhatsApp sale sin imagen de vista previa** (la
  imagen OG apunta a localhost). Le pega directo a la prospección.
- Google recibe un sitemap con una URL que no existe.

**Arreglo:** cargar `NEXT_PUBLIC_SITE_URL=https://vivomenu.com.ar` en Vercel (Production) y volver a
desplegar (las `NEXT_PUBLIC_*` se fijan en el build). En el código, que la reserva sea
`VERCEL_PROJECT_PRODUCTION_URL` antes que `localhost`, para que no vuelva a pasar. Si se imprimió
algún QR, hay que reimprimirlo.

### 1.2 Las notas internas están públicas, y el robots.txt dice dónde buscarlas

`/interno-64a0f7d0` responde 200 sin login y muestra el plan de marketing, los precios y su
razonamiento, los guiones de mensajes en frío y el análisis de competidores. El `robots.txt`
publica `Disallow: /interno-`, o sea que cualquiera que lo abra ve el prefijo. Un competidor (o un
prospecto que recibe un mensaje tuyo) puede leer el guion que le estás aplicando.

**Arreglo:** ponerla detrás de `requireSuperadmin()` (ya existe y en el teléfono es un login), o
sacarla del deploy. Sacar `/interno-` del robots. No apareció ninguna llave en el contenido.

---

## 2. Errores altos

### 2.1 Un mozo o cajero puede gastar la cuota de IA y romper fotos y videos de la carta

`uploadProductImage`, `uploadProductVideo`, `removeProductVideo`, `generateProductImage` y
`acceptGeneratedImage` (`src/app/(panel)/panel/menu/actions.ts`) chequean que la persona sea del
local, pero **no su rol**. La lectura de `products` la permite RLS a todo el personal; el `update`
no (solo dueño y encargado), pero falla en silencio y **el código igual borra el archivo viejo con
el cliente admin**. Resultado: alguien con rol `waiter` o `cashier` que llame a esas acciones deja
productos apuntando a archivos borrados (foto rota en la carta pública) y puede gastar las 30 fotos
de IA del mes (plata real).

**Arreglo:** exigir `owner`/`manager` al principio de esas cinco acciones y borrar el archivo viejo
solo si el `update` afectó una fila (`.select("id")` y comprobar el resultado).

### 2.2 Dos módulos se prenden pero no existen

`mercadopago` y `kitchen_printing` están en el registro de módulos y se pueden activar desde
`/admin`, pero no hay nada implementado detrás. Riesgo comercial: prometer algo que no está.
**Arreglo:** ocultarlos del panel de admin o mostrarlos como "próximamente".

---

## 3. Errores medios y menores

| # | Qué | Por qué importa | Arreglo |
|---|---|---|---|
| 3.1 | La página del pedido del comensal (`/m/[slug]/pedido/[id]`) no se actualiza sola | El cliente no ve "en preparación" ni "listo"; vuelve a escribir por WhatsApp, justo lo que el producto promete evitar | Sondeo cada 20 s del estado (endpoint por UUID) |
| 3.2 | La carta pública tarda ~1,4 s en responder (medido en `/m/burger-house-tuc`) y no tiene caché | Es lo primero que abre un prospecto y lo que abre cada comensal | Cachear los datos de la carta con revalidación por etiqueta al editar el menú |
| 3.3 | `test:rls` y `test:e2e` escriben en el proyecto real | Con el primer cliente real, un test puede tocar sus datos | Un segundo proyecto de Supabase (plan gratis) solo para tests |
| 3.4 | Limitador de pedidos en memoria | Ya está documentado como conocido; alcanza a esta escala | Nada por ahora |
| 3.5 | 2 avisos de lint por `<img>` en `catalog-media.tsx` | Menor | Dejarlo o pasar a `next/image` |

---

## 4. Lo que le falta para ser más útil (ordenado por impacto en la venta)

1. **Cargar la carta desde una foto o un PDF con IA.** Ya hay Gemini en el proyecto. Hoy la carga
   lleva 2 a 4 h por local (según `marketing/precios.md`). Con esto: (a) la instalación baja a
   minutos; (b) **se puede armar la demo con los datos del prospecto antes de escribirle**, que es
   el mensaje que más convierte en el método del prompt maestro ("su caso andando antes que una
   explicación").
2. **Avisar al cliente que su pedido está listo**, con un botón en el tablero que abre WhatsApp con
   el mensaje armado (sin API, sin costo). Es el momento en que el comensal siente el sistema.
3. **Impresión de comandas** (impresora térmica). En Argentina es lo primero que pregunta una
   cocina que ya tiene una.
4. **Cobro con Mercado Pago** (link o QR por pedido). Hoy es solo efectivo o transferencia.
5. **Resumen para el dueño en una pantalla:** pedidos por día, ticket promedio, platos más
   pedidos, horas pico. Sirve para retener (el dueño ve el valor cada semana) y es la materia
   prima de los casos reales para el contenido.
6. **Pedido de reseña de Google después del pedido.** Le suma al local, y un local al que le
   suma no se va.
7. **Productos por horario** (desayunos, almuerzo) y promociones simples (happy hour, 2×1).
8. **Alta de prueba sin intervención tuya** (más adelante): hoy cada local lo crea el superadmin.
   Tiene sentido recién cuando la venta presencial deje de dar abasto.

## 5. Orden recomendado

1. Hoy: 1.1 (variable en Vercel, 5 minutos) y 1.2.
2. Esta semana: 2.1, 2.2 y 3.1.
3. Antes de la prospección fuerte: 4.1 y 4.2, porque cambian lo que se le puede mostrar a un
   prospecto.
4. Después del primer cliente: 4.3 a 4.7, según lo que pida.

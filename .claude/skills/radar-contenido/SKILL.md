---
name: radar-contenido
description: Radar mensual de contenido de VivoMenu. Trae los últimos reels de las cuentas del nicho (LaCarta, Menu4D, Menuly, DougMenu y las que se sumen), detecta los que rinden muy por encima de la mediana de su propia cuenta, junta lo que comentan y buscan los dueños gastronómicos y las tendencias del mes, y deja ideas nuevas en el banco de reels. Usala cuando Gastón pida "el radar", "qué está funcionando", "mirá la competencia" o "tendencias", o el primer lunes de cada mes, dentro del repo menu-digital.
---

# Radar de contenido — VivoMenu

Deja dos cosas:
1. **`marketing/investigacion/radar/AAAA-MM.md`**, con los aciertos y las tendencias del mes.
2. **De 6 a 9 ideas nuevas** al final de "Las siguientes" en
   `marketing/contenido/reels/backlog.md`, marcadas `propuesta (radar)`.

**No se copia contenido de nadie:** se toma la estructura que funcionó (el tipo de gancho, el
formato, el ángulo) y se cuenta con lo de VivoMenu.

Antes de empezar, leé `marketing/notas/04-contenido.md` (§2 a §4), la matriz
(`marketing/investigacion/matriz-2026-11.md`) y el radar anterior si existe.

## 0. La plata: Apify nunca pasa el plan gratis

**Regla de Gastón:** Apify no pasa nunca el plan gratis (USD 5 por mes). La matriz de noviembre
costó USD 0,30 por 115 reels.

1. Mirá cuánto se usó en el ciclo antes de traer nada: en la consola de Apify (Billing), en el
   Chrome de Gastón, o preguntándole. El script no lo informa.
2. **Estimá antes de correr** (`--estimar`) y **topá cada corrida** (`--tope`).
3. Si no entra, se parte en dos meses o se baja el número de reels. Nunca se pasa el plan.

## 1. Los aciertos de las cuentas

**Con los scripts del repo de la matriz** (`D:\Gutmark\Diseño Web\Claude Proyectos\Contenido\matriz-viralidad`,
su `.env` tiene la llave: **nunca la imprimas**):

```bash
node scripts/apify.mjs posts <cuenta> instagram-reels --limite 15 --tope 0.15 --estimar
node scripts/apify.mjs posts <cuenta> instagram-reels --limite 15 --tope 0.15
node scripts/mediana.mjs <archivo normalizado>
node scripts/apify.mjs comentarios <cuenta> instagram-reels --posts 3 --limite 20 --tope 0.10 --estimar
```

**Las cuentas:** `lacarta.app`, `menu4d`, `menuly.ar`, `dougmenu.app` (las eligió Gastón) y las que
él sume. **@vivomenu.app también**, desde la semana 5: es la que dice qué rinde para nosotros.

**Por cuenta:**
1. La mediana de vistas de sus últimos 15 reels (y la del mes pasado, para comparar).
2. **Un acierto es un reel con 3 veces o más la mediana de su cuenta.**
3. **Descartá los que tienen muchas vistas y casi ningún like o comentario** (menos de 1 like cada
   1.000 vistas, o 0 comentarios con miles de vistas): pueden ser pauta. Pasó con DougMenu.
4. De cada acierto: la primera frase (el gancho), el formato, el tema, el pedido, la duración y
   **por qué creés que funcionó**, en una línea. Si hace falta verlo por dentro, `scripts/descargar.mjs`
   y `scripts/fotogramas.mjs` (o una hoja de fotogramas con ffmpeg), como en la matriz.

## 2. Lo que dicen los dueños

1. En los comentarios de los aciertos y de cuentas que les hablan a gastronómicos argentinos,
   **copiá frases textuales de dueños** con una queja o una pregunta ("los viernes no doy abasto",
   "¿y si se corta internet?"). Son los ganchos más fuertes: están dichos con sus palabras.
2. Si Chrome está conectado y Gastón confirma que la sesión de Instagram está iniciada, se mira de a
   un perfil por vez, con pausas, **solo lectura** (no se sigue, no se da like, no se comenta). Si
   no, se usa lo que trajo Apify.
3. `last30days` (skill) con "delivery WhatsApp pedidos", "sistema gastronómico", "PedidosYa
   comisión" para ver qué se discute en el mes.

## 3. Las tendencias

- **Google Trends**, región Argentina (y Tucumán si hay datos): "carta digital", "menú QR",
  "pedidos por WhatsApp", "PedidosYa", "sistema para restaurante", en los últimos 90 días.
- **La Biblioteca de Anuncios de Meta** (`facebook.com/ads/library`): anuncios activos de Fudo,
  Comandar, SoyMenu, LaCarta, Menu4D. **Un anuncio activo hace semanas funciona:** anotá su gancho
  y su formato.
- **Los audios en tendencia de Instagram** no se ven desde afuera: se le recuerda a Gastón que los
  mire en su panel profesional.

**Una tendencia entra solo si se puede contar con algo verdadero de VivoMenu** (una escena del
servicio, una prueba en la demo, un dato con dos fuentes).

## 4. Qué deja

**`marketing/investigacion/radar/AAAA-MM.md`:**
1. **En cinco líneas:** lo más importante del mes.
2. **Cuentas:** con seguidores, reels del mes y mediana, para comparar.
3. **Aciertos:** cuenta, gancho, formato, tema, pedido, veces la mediana, por qué funcionó, link.
4. **Las palabras de los dueños:** las frases textuales.
5. **Tendencias:** cada una con fuente y fecha.
6. **Qué cambia en VivoMenu:** si hay que tocar algo de la estrategia, se propone acá. **No se
   cambia `04-contenido.md` sin que Gastón lo apruebe.**
7. **El costo de Apify** de la corrida y lo que queda del ciclo.

**En el backlog**, de 6 a 9 ideas al final de "Las siguientes", `propuesta (radar)`: el gancho
escrito con `.claude/skills/paquete-reel-vivomenu/referencias/ganchos.md`, la serie, el formato, el rubro
rotando, lo que hace falta antes, el pedido y, en "Patrón", la cuenta y el mes del radar que la
inspiró.

**Al terminar:** `npm run docs:internal`, commit y push de `marketing/investigacion/radar/`,
`marketing/contenido/reels/backlog.md` y `src/content/internal/marketing-docs.ts`, y un resumen
corto para Gastón con los tres hallazgos más útiles y el costo.

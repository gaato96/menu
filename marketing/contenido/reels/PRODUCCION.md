# Producción — del paquete al video publicado

**Escrito el 2026-11-20 (fase 8).** Cómo se pasa de un paquete de `contenido/reels/NN-slug.md` a un
MP4 listo para Instagram y TikTok, con los tres moldes de hyperframes de `moldes/`. Reemplaza a
`guia-produccion.md` de julio (la plantilla de carruseles), que pasó al archivo.

**Lo que no cambia en ningún formato:** 1080×1920 a 30 fps, texto en pantalla siempre (la mayoría
mira sin sonido), el primer cuadro ya se mueve y ya tiene el gancho, nada importante arriba de los
170 px ni abajo de los 1330 px (ahí van la interfaz de Instagram y los subtítulos de TikTok), el
final empalma con el principio, y las pantallas del sistema son reales, del local de demostración.

---

## El prompt para la sesión de edición

Gastón abre Claude Code en `menu-digital` y pega esto, con la idea que toca:

```
Usá la skill paquete-reel-vivomenu en modo manual con la idea ⟨V04⟩. Después produjimos el video: decime qué tengo que generar o grabar (la voz de ElevenLabs, las grabaciones de la demo), y cuando te lo pase armá la edición con hyperframes partiendo del molde del formato en marketing/contenido/reels/moldes/, siguiendo marketing/contenido/reels/PRODUCCION.md. Al final, la portada y la secuencia de historias quedan listas.
```

Si el paquete ya está generado (lo generó el día anterior), en vez de la primera frase: *"El paquete
del reel ⟨NN⟩ ya está en marketing/contenido/reels/. Produzcamos el video: …"*.

---

## Los tres moldes

| Molde | Formato | Qué trae | Lo que se cambia en cada reel |
|---|---|---|---|
| `moldes/historia-animada/` | A · historia animada (Dos deliverys, El dato) | Fondo noche, tipografías de la marca, diez escenas de línea (`compositions/t01…t10.html`), subtítulos palabra por palabra que se arman solos desde la voz, y `armar.py` | La voz, el guion, las escenas y las palabras clave |
| `moldes/corto-texto/` | C · corto de texto (El chat del viernes) | Gancho fijo arriba, la burbuja del cliente, la respuesta con su hora, la vuelta en ember y el puente a la descripción. 9 s en bucle | Los siete textos (son variables) |
| `moldes/pantalla-real/` | B · pantalla real (Viernes 21:30, ¿Y si…? Probé, Tu carta) | La grabación a pantalla completa, la hora y un contador arriba, "local de demostración", y los pasos numerados abajo | La grabación, desde qué segundo y a qué velocidad, la hora y los pasos |

**Para empezar un reel se copia el molde entero** a `produccion/reel-NN/` (fuera del repo, o adentro:
`produccion/` está en el `.gitignore`) y se trabaja en la copia. El molde no se toca salvo para
mejorarlo a propósito.

---

## A · historia animada (45 a 75 s) — unos 60 minutos

1. **La voz** (Gastón, 5 min): el bloque de §1 del paquete en ElevenLabs → `voz.mp3`. Si se acabó la
   cuota, la voz de Windows en español ("Helena") sirve para un borrador, nunca para publicar.
2. **El guion:** `guion.txt` es el mismo texto de la voz, un párrafo por tramo (un párrafo = una
   escena `tNN`). `claves.txt`, las palabras clave de la lista del prompt de edición.
3. **Los tiempos** (Claude, 2 min):
   ```
   npx hyperframes transcribe voz.mp3 --model small --language es
   python armar.py voz.mp3
   ```
   `armar.py` alinea el guion con la transcripción y escribe el comienzo y el largo de cada escena,
   el largo total y los subtítulos (con el texto del guion bien escrito, no el de Whisper).
4. **Las escenas** (Claude, 30 a 40 min): se reescriben `compositions/t01…tNN.html` con lo que dice
   "Las escenas" del paquete. Las piezas que ya están dibujadas se reusan: la fachada, la
   hamburguesa, el celular con burbujas, la comanda con borde dentado, el reloj, el contador, el
   cadete en moto, la persona esperando, la caja de comentario. Si el reel tiene más o menos tramos
   que diez, se suman o se sacan hosts en `index.html`.
5. **Revisión** (10 min): `npx hyperframes check` sin errores, y `npx hyperframes snapshot --at …`
   en un momento de cada escena, mirado en tamaño de celular.
6. **Render** (4 min en esta PC): `npx hyperframes render -o renders/reel-NN.mp4`.
7. **La música:** Instagram y TikTok dejan sumar un audio de su biblioteca al publicar. Si se pone
   ahí, en volumen bajo, el video sale sin música desde hyperframes. Si se quiere fija, un
   `musica.mp3` sin derechos y un `<audio id="musica" data-volume="0.1">` en `index.html`.

## C · corto de texto (7 a 10 s) — unos 20 minutos

1. Se cambian las siete variables de `index.html` (el gancho, la hora y el mensaje del cliente, la
   hora y la respuesta, la vuelta y el puente) con lo que dice "El texto en pantalla" del paquete.
   También se pueden cambiar desde la app de escritorio de HyperFrames, en el panel de variables.
2. Si el texto es más largo, se mueven los `top` del CSS para que nada se pise. **Todo tiene que
   leerse antes del segundo 4,5**, así la segunda vuelta lo confirma.
3. `check`, `snapshot --at 0.1,4.5`, `render`. Sin voz: la música se suma al publicar.

## B · pantalla real (20 a 40 s) — unos 45 minutos

1. **La grabación** (Gastón, 10 min): lo que dice "Qué grabar" del paquete, en el celular (el menú)
   o la tablet (el tablero), con la grabación de pantalla del teléfono, vertical, sin
   notificaciones (modo no molestar). Los pedidos de prueba se cancelan después en el tablero.
   Se guarda en `pantallas/p1-….mp4`.
   - Si la grabación es del menú público, Claude la puede sacar sola con Playwright, sin hacer
     ningún pedido (así se sacó la de ejemplo, `p1-menu-demo.mp4`).
2. **El recorte:** en el `<video>` de `index.html`, `data-media-start` (desde qué segundo de la
   grabación), `data-playback-rate` (1 a 1,6: más rápido en lo que no importa) y `data-duration`
   (cuánto dura en el reel).
3. **Los pasos:** las variables `paso1…paso5` y, en el script, el segundo en que entra cada uno.
   Cada paso tiene que quedar en pantalla 1,5 s como mínimo; el último, 2 s.
4. **La voz**, si lleva: como en el formato A (pasos 1 y 3), con un `<audio id="voz">`. Si no lleva,
   los pasos son el texto en pantalla.
5. `check`, `snapshot`, `render`.

---

## La portada y las historias

- **Portada:** el prompt de §5 del paquete en Nano Banana. Si escribe mal las letras, un cuadro del
  propio render: `npx hyperframes snapshot --at 0.5` y se le pone el título en Canva.
- **Historias:** los tres prompts de §7 en Nano Banana, el día del reel. Las respuestas a la
  encuesta, por mensaje directo.

## Cuánto lleva una semana

| | Gastón | Claude |
|---|---|---|
| Lunes · A | Voz (5 min), revisar y publicar (15 min) | Paquete el domingo, escenas y render (45 min) |
| Miércoles · C | Revisar y publicar (10 min) | Paquete el martes y edición (20 min) |
| Viernes · B | Grabar (10 min), voz si lleva (5 min), revisar y publicar (15 min) | Paquete el jueves y edición (35 min) |
| Todos los días | Historias (10 min), contestar comentarios y mensajes (15 min) | Los prompts de las historias ya están en el paquete |

Unas 2 horas por semana de Gastón, sin contar los mensajes.

## El primer reel

`moldes/historia-animada/` es el reel 01 armado, con una **voz de borrador** (la de Windows, en
español de España) para probar los tiempos. El render de borrador queda en
`moldes/historia-animada/renders/reel-01-borrador.mp4` (no se sube al repo). **Para publicarlo**
falta la voz de ElevenLabs: se genera, se pone como `voz.mp3` en la carpeta, se corren los dos
comandos del paso 3 y se vuelve a renderizar. Las escenas no cambian.

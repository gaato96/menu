# 02b · Adquisición — a quién se le escribe, cómo y cuántos por día

**Escrito:** 2026-11-20 (fase 10). **Qué manda sobre esto:** `01-plan.md` (a quién se le vende, la
oferta y el precio). Los mensajes, palabra por palabra, están en `ventas/mensajes.md`. Las
respuestas y la visita, en `ventas/respuestas.md`. **Dónde se trabaja:** el módulo de Prospección del
Galu CRM, sistema **VivoMenu**.

> **Reemplaza a** `prospeccion.md`, `sistema-prospeccion-frio.md` y `mensajes-en-frio.md` (julio y
> agosto). Se borran cuando Gastón apruebe esta fase; lo que decían va a `10-archivo.md`.

---

## 0. En una pantalla

- **La lista ya existe:** 575 locales de comida de Tucumán importados en agosto, que el 2026-11-20 se
  repartieron en cuatro listas del CRM. **La que se trabaja es "VivoMenu · Tucumán · Delivery y
  mostrador": 244 locales.**
- **Lo que se manda primero es su carta andando.** A los 2 o 3 de score más alto de cada día,
  Gastón les arma la carta en VivoMenu con la importación por IA antes de escribirles. Al resto, el
  menú de demostración y la oferta de armarles la suya.
- **Tres mensajes en ocho días:** el primero, el día 3 (lo que se ve de afuera) y el día 8 (el
  cierre). Después, nada hasta que el local conteste o pida que le escriban más adelante.
- **La cuota sube de a poco** (lo cuenta el CRM): 5 por día la primera semana, 8 la segunda, 10 la
  tercera y 12 desde la cuarta. De lunes a viernes; el sábado y el domingo no se escribe en frío.
- **Control a los 40 contactos** y **lectura a los 100**, con tres caminos según lo que pase (§6).

**Lo que tiene que estar antes del primer mensaje:**
1. El logo del local de demostración cambiado (hoy es el de Galu).
2. El §8 del plan confirmado (precio, fundadores, IVA, cobro). **Sin eso no se puede ofrecer nada
   en la visita.**
3. El CRM actualizado en producción (los mensajes nuevos se subieron el 2026-11-20).

---

## 1. A quién, con nombre y apellido

**El cliente principal** (`01-plan.md` §1): el dueño de un delivery o de un local de mostrador que
toma los pedidos por WhatsApp. Hamburgueserías, pizzerías, sushi, rotiserías, empanadas, pollerías,
casas de pastas, comida rápida, cocinas sin local al público.

**Cómo se lo reconoce en dos minutos** (en la ficha de Google y en su Instagram):

| Señal | Dónde | Qué dice |
|---|---|---|
| Hace delivery o para llevar | Ficha de Google (el escaneo del CRM lo lee) | Que tiene el pedido directo |
| "Pedidos por WhatsApp" o un `wa.me` en la bio | Instagram | Que el pedido entra por un chat |
| La carta como foto o en una historia destacada | Instagram | Que el cliente tiene que preguntar |
| Reseñas que hablan de demora, de pedidos mal armados o de que no contestan | Google | El dolor, con sus palabras |
| Publica seguido | Instagram | Que el local está vivo |

**Quién lee el mensaje y quién decide.** Son dos ventas distintas, y el CRM tiene un mensaje para
cada una:
- **El dueño atiende su WhatsApp** (local chico, cocina sin salón): lee y decide la misma persona.
  Va derecho a la carta armada.
- **Atiende un empleado o un cajero:** lee alguien que no decide. El mensaje le pregunta si el
  WhatsApp lo lleva el dueño; si contesta el empleado, se le habla de lo que le ahorra a él ("el
  pedido te llega armado") y se le pide que se lo pase al dueño.

**A quién no:** cadenas con varias sucursales, el que vende casi todo por PedidosYa o Rappi, los
proyectos que no abrieron, y los locales con salón hasta tener 3 casos de delivery.

## 2. Dónde están y cómo se arma la lista

### Lo que ya está en el CRM

| Lista | Locales | Qué se hace |
|---|---|---|
| **VivoMenu · Tucumán · Delivery y mostrador** | 244 | **Se trabaja desde la semana 1** |
| VivoMenu · Tucumán · Salón (después) | 308 | Se espera a tener 3 casos. Si al escanear uno resulta hacer mucho delivery, se pasa a la de arriba |
| VivoMenu · Tucumán · Fuera del público | 16 | Tiendas, carnicerías, hotel, casino: no se les escribe |
| VivoMenu · Tucumán · Revisar rubro | 7 | La importación puso una dirección en el rubro: se mira la ficha y se pasan a la que corresponda |

Las listas se armaron por la categoría de Google Maps. **Casi ninguno tiene teléfono ni Instagram
cargado** (vienen de una planilla de agosto con el link de Maps): **el escaneo del CRM los completa**.

### Cómo se prepara cada día (el escaneo)

1. En el CRM, Prospección → sistema VivoMenu → lista "Delivery y mostrador".
2. **Escanear** a los que toca escribir mañana: el CRM lee la ficha de Google (teléfono, si hace
   delivery, reseñas y su texto, horarios) y busca su Instagram. Con eso calcula el score y sugiere
   el dato para la primera línea.
3. Se ordena por score y se toman los del día.

**Costo:** el escaneo usa la API de Google Places con la cuenta del CRM, la misma que usa Sarvo, y
Google cobra cada consulta que pasa del uso gratis del mes. **Se escanea de a 10 o 15 por día, nunca
los 244 de una vez**, y una vez por semana se mira el uso en la consola de Google Cloud (es la misma
cuenta para VivoMenu y Sarvo).

### Para sumar locales nuevos (cuando se terminen los 244)

- **El scraper del CRM** (Google Maps por rubro y zona): "hamburguesería", "pizzería", "sushi
  delivery", "rotisería", "empanadas", en San Miguel de Tucumán, Yerba Buena y Tafí Viejo. Cada
  búsqueda, una lista nueva ("VivoMenu · Yerba Buena · Pizzerías"), para medirla aparte.
- **Instagram:** las ubicaciones de Tucumán y los hashtags del rubro (#hamburguesastucuman,
  #deliverytucuman, #pizzatucuman). Los que dicen "pedidos por WhatsApp" en la bio van primero.
- **La Biblioteca de anuncios de Meta:** los locales de comida de Tucumán que pagan anuncios sienten
  más el problema del pedido.
- **Conocidos:** a quién conoce Gastón (y su familia) que tenga un local de comida. Van antes que
  nadie (§5).

**La planilla para importar** (Prospección → Importar, pegando desde Google Sheets), con estos
encabezados fijos, que el CRM reconoce solo:

```
Negocio | Rubro | Teléfono | Instagram | Dirección | Ciudad | Sitio web | Google Maps | Rating | Reseñas | Notas
```

## 3. Qué se le manda

**Su caso andando antes que una explicación.** Dos formas, según el score:

| Quiénes | Qué se manda | Cuánto le lleva a Gastón |
|---|---|---|
| **Los 2 o 3 de score más alto de cada día** | **Su carta armada en VivoMenu.** Gastón crea el local de demostración desde `/admin` ("Demo · nombre del local"), importa la carta desde la foto de su Instagram con la IA, revisa precios y agregados, y pega el link en el campo "revisión" del prospecto en el CRM. El mensaje 1 sale con ese link | 10 a 15 min cada uno |
| **El resto de la cuota** | El menú de demostración (Burger House) y la oferta de armarle la suya | 2 min cada uno |

**Los locales de demostración** que no contesten en 30 días se borran desde `/admin`, para que no
se acumulen ni los cuente el seguimiento de pruebas del superadmin.

**Los mensajes** (palabra por palabra en `ventas/mensajes.md`; el CRM los arma solos con el dato
del escaneo):
1. **El primero** (día 0): quién es Gastón, lo que vio de su local (una reseña, su carta en foto) si
   hay algo verdadero, y el link. Termina preguntando si el WhatsApp lo lleva el dueño.
2. **El del día 3:** lo que se ve de afuera cuando alguien quiere pedirle (de uno a tres hallazgos
   reales del escaneo, nunca inventados).
3. **El del día 8:** el cierre. Deja la carta (o la oferta de armarla) y se despide.

**La primera línea es verdad solo de ese local.** Si el escaneo no encontró nada verdadero, el
mensaje no inventa: se presenta y muestra el link. Sin "IA", sin "sistema de gestión", sin
"solución": se habla de la carta, el pedido y el WhatsApp.

## 4. Cuando contestan

La tabla de respuestas, la visita de 15 minutos y lo que se dice del precio están en
`ventas/respuestas.md`. **La regla:** se contesta el mismo día, y lo antes posible: un dueño de
delivery que contesta a las 17 está libre hasta las 19, después entra al servicio.

## 5. Los canales, por orden de confianza

| Canal | Cuándo | Límite |
|---|---|---|
| **Conocidos** (de Gastón y su familia, ex clientes de Galu con local de comida) | Semana 1, antes que nadie | Ninguno: son los que más contestan |
| **Comunidades** (grupos de Facebook y WhatsApp de gastronómicos de Tucumán) | Desde la semana 2, aportando, no vendiendo (`01-plan.md` §5) | Un aporte por semana, nunca un aviso |
| **WhatsApp en frío** (al número del local) | La cuota diaria | **WhatsApp bloquea un número que abre muchos chats nuevos de golpe:** por eso la cuota sube de a poco (5 → 8 → 10 → 12) y no se manda el mismo texto a todos sin cambiar la primera línea |
| **Instagram en frío** (DM a la cuenta del local) | Cuando el local no publica WhatsApp | Instagram limita los mensajes a cuentas que no te siguen: pocos por día, desde @vivomenu.app, y nunca con links en el primer mensaje si la cuenta es nueva |

**Días y horas:** de lunes a viernes, **de 15 a 18**, antes del servicio de la noche. Nunca el
viernes después de las 19, nunca el sábado ni el domingo (el CRM lo avisa).

## 6. La cuota, el control y la lectura

| | Cuándo (aprox.) | Qué se mira | Qué se hace |
|---|---|---|---|
| **Cuota** | Todos los días hábiles | Lo que dice el CRM (sube sola por semana) | Si un día no se llega, no se compensa al día siguiente |
| **Control a los 40** | Fin de la semana 1 o principio de la 2 | ¿Contestó alguien? | **Si nadie contestó:** se leen cinco mensajes mandados. ¿La primera línea es de ese local o se la podrías mandar a cualquiera? ¿Iba con su carta armada? Si no, los siguientes van con carta |
| **Lectura a los 100** | Semana 3 (alrededor del viernes 11/12) | Respuestas, cartas pedidas, visitas, fundadores | Los tres caminos de abajo |

**Los tres caminos a los 100:**

| Lo que pasó | Qué quiere decir | Qué se hace desde ahí |
|---|---|---|
| **8 respuestas o más, y 2 visitas o más** | El mensaje y el público funcionan | Se sigue igual, con la cuota en el techo (12), y se suman Yerba Buena y Tafí Viejo con el scraper |
| **Entre 3 y 7 respuestas, 0 o 1 visita** | El mensaje engancha, la oferta no cierra | **Todos los contactos con su carta armada**, y en la respuesta la visita ofrecida con dos horarios, no "cuando quieras" |
| **Entre 0 y 2 respuestas** | El frío no contesta, o el mensaje no sirve | Se cambia de canal: más conocidos, comunidades y la visita en persona a la hora muerta (de 16 a 18), con la carta ya armada en el celular |

**En cualquiera de los tres:**
- **El que diga "después de las fiestas" o "en marzo"** queda en el CRM con la fecha que dijo, y el
  mensaje "Recontacto" (fu3) ese día.
- **Enero es flojo para vender a gastronómicos** (`01-plan.md` §4): del 21/12 al 10/1 la cuota baja
  a la mitad y se atiende a los que ya contestaron.

## 7. Dónde entra en el día

Es el punto 2 del orden del día de `03-dia-por-dia.md` (después de contestar):

| Qué | Tiempo |
|---|---|
| Contestar a los que respondieron | 10 min |
| Escanear los de mañana y ordenar por score | 10 min |
| Armar 2 o 3 cartas para los de score más alto | 30 a 45 min |
| Mandar la cuota del día (el CRM arma el mensaje) | 15 a 25 min |
| Los seguimientos del día 3 y del día 8 que vencen | 10 min |

**Unos 75 a 100 minutos por día hábil**, de 15 a 18. **Si el día se cae, se contesta y se manda la
cuota con el menú de demostración, sin cartas armadas.** Nunca se arman cartas a costa de contestar.

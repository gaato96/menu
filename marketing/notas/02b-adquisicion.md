# 02b · Adquisición — a quién se le escribe, cómo y cuántos por día

**Escrito:** 2026-11-20 (fase 10). **Qué manda sobre esto:** `01-plan.md` (a quién se le vende, la
oferta y el precio). Los mensajes, palabra por palabra, están en `ventas/mensajes.md`. Las
respuestas y la visita, en `ventas/respuestas.md`. **Dónde se trabaja:** el módulo de Prospección del
Galu CRM, sistema **VivoMenu**.

> **Reemplaza a** `prospeccion.md`, `sistema-prospeccion-frio.md` y `mensajes-en-frio.md` (julio y
> agosto). Se borran cuando Gastón apruebe esta fase; lo que decían va a `10-archivo.md`.

---

## 0. En una pantalla

> **Corregido el 2026-11-20** después de que Gastón leyó la primera versión: las listas no confirman
> que los locales hagan delivery (salen de la categoría de Google), los mensajes sonaban armados, se
> daba por hecho que teníamos la carta de cada local y el flujo del CRM no servía para el celular.
> Lo que sigue ya está corregido, y el CRM tiene la pantalla nueva.

- **Se trabaja desde el celular**, en el CRM: **Prospección → VivoMenu → "VivoMenu · Locales"**
  (`/prospeccion/vivomenu`). Tres pestañas: **Hoy, Seguir, Contestaron**.
- **No hay que escanear ni completar nada.** Al abrir, la pantalla lee sola la ficha de Google de los
  que tocan hoy: el teléfono (y si es celular, porque un fijo no abre WhatsApp), si hace delivery, para
  llevar o tiene salón, y si cerró. Los ordena: primero los que hacen delivery o para llevar.
- **Cada local es una tarjeta con el mensaje escrito y un botón:** "Mandar por WhatsApp" abre el chat
  con el texto y lo marca como enviado. Si Google no tiene su WhatsApp, la tarjeta ofrece buscar su
  Instagram.
- **Lo que se manda es el menú de muestra y la oferta de armarle el suyo gratis con una foto de su
  carta.** No se da por hecho que tenemos su carta.
- **Tres mensajes en ocho días** (el primero, el día 3 y el día 8) y se cierra solo.
- **La cuota sube de a poco** (la calcula el CRM): 5 por día la primera semana, 8, 10 y 12 desde la
  cuarta. De lunes a viernes, de 15 a 18.

**Lo que tiene que estar antes del primer mensaje:**
1. El logo del local de demostración cambiado (hoy es el de Galu): es lo primero que ven.
2. El §8 del plan confirmado (precio, fundadores, IVA, cobro), para la visita.

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

Los 575 locales de comida de Tucumán importados en agosto, repartidos el 2026-11-20 en cuatro listas
**por la categoría de Google Maps**. La categoría no confirma si un local hace delivery: eso lo dice
la ficha de cada uno, que la pantalla lee antes de escribirle.

| Lista | Locales | Qué pasa |
|---|---|---|
| **Comida rápida y para llevar** (hamburguesas, pizza, comida rápida, para llevar, pollo, sushi, sándwiches…) | 244 | Entran primero a la cola |
| **Restaurantes, bares y cafés** | 308 | También están en la cola, después. Muchos hacen delivery: si la ficha lo dice, suben |
| Fuera del público (tiendas, carnicerías, hotel, casino) | 16 | No entran a la cola |
| Revisar rubro (la importación puso una dirección en el rubro) | 7 | No entran a la cola hasta revisarlos |

**Lo que dice la ficha y cómo pesa:** hace delivery (+40), para llevar (+25), solo salón (−30), las
reseñas (hasta +20) y si tiene un celular para WhatsApp (+10). Si cerró, sale de la cola solo.

**Costo:** cada ficha leída es una consulta a la API de Google Places de la cuenta del CRM (la misma
que usa Sarvo). La pantalla lee solo las del día y unas pocas más, nunca las 575 juntas. Una vez por
semana conviene mirar el uso en la consola de Google Cloud.

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

**El menú de muestra y la oferta de armarle el suyo.** Casi ningún local publica su carta entera, así
que no se le arma antes de escribirle: se le pide una foto cuando contesta. Si alguno la tiene
publicada completa (en Instagram o en las fotos de Google) y Gastón quiere armarla antes, pega el link
en "Más opciones" de la tarjeta y el mensaje cambia solo.

**Cuando pide la suya:** Gastón crea el local de demostración desde `/admin` de VivoMenu ("Demo ·
nombre del local"), importa la carta desde la foto con la IA, revisa precios y agregados, pega el link
en la tarjeta de "Contestaron" y toca "Mandarle su carta". Los de demostración que no sigan en 30
días se borran.

**Los mensajes**, palabra por palabra, en `ventas/mensajes.md`.

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

Es el punto 2 del orden del día de `03-dia-por-dia.md` (después de contestar), desde el celular:

| Qué | Tiempo |
|---|---|
| Abrir "VivoMenu · Locales" y contestar lo que haya en "Contestaron" | 10 min |
| "Hoy": mandar la cuota (un toque por local; los que no tienen WhatsApp, buscar su Instagram) | 10 a 20 min |
| "Seguir": los del día 3 y del día 8 | 5 min |
| Armar las cartas que pidieron (en la computadora o el celular, desde `/admin` de VivoMenu) | 10 min cada una |

**Unos 30 a 45 minutos por día hábil**, de 15 a 18, más las cartas que pidan.

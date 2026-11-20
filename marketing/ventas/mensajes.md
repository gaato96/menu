# Los mensajes en frío de VivoMenu

**Escrito:** 2026-11-20 (fase 10). Son los mismos que arma el Galu CRM (sistema VivoMenu,
`src/lib/vivomenu-mensajes.ts`), que además pone la primera línea con el dato del escaneo. Acá
están para leerlos enteros y para usarlos fuera del CRM (un conocido, un DM de Instagram). Lo que va
entre `[ ]` se completa; si no hay un dato verdadero para ponerlo, la frase se saca entera.

**Las reglas:** de lunes a viernes, de 15 a 18. La primera línea es verdad solo de ese local. Sin
"IA", sin "sistema", sin "solución". Si el local publica precios viejos o la carta en foto, eso se
dice como lo ve un cliente, nunca como un reto.

---

## 1. El primero (día 0)

### Con su carta ya armada (los 2 o 3 de score más alto del día)

```
Hola. No es un pedido, disculpá. Te escribo por otra cosa.

Soy Gastón, de acá de Tucumán. [Vi que …: una reseña citada entre comillas, o algo de su carta.] Agarré la carta que tienen publicada y te la armé en VivoMenu, para que tus clientes pidan desde un link y el pedido te llegue a este WhatsApp ya escrito, con los agregados y la dirección.

Mirala como si fueras un cliente: [link de su carta]

Si algún precio está viejo me decís y lo cambio. Este WhatsApp lo lleva el dueño, o se lo puedo pasar por acá?
```

### Sin carta armada (el resto de la cuota)

```
Hola. No es un pedido, disculpá. Te escribo por otra cosa.

Soy Gastón, de acá de Tucumán. [Vi que …] Hago un link donde el cliente ve la carta con fotos, arma el pedido con los agregados y te llega acá ya escrito, en vez de tener que ir preguntándole de a uno.

Este es uno real, tocalo como si fueras un cliente: https://vivomenu.com.ar/m/burger-house-tuc/catalogo

Si querés, te armo el tuyo con tu carta para que lo veas andando. Este WhatsApp lo lleva el dueño, o se lo puedo pasar por acá?
```

**Si el local está en PedidosYa o Rappi**, la segunda frase cambia a: *"Hago un link propio donde
el cliente ve la carta con fotos, arma el pedido solo y te entra directo a este WhatsApp, sin
comisión por pedido. Para el que ya te conoce y te pide directo."* Nunca "dejá la app".

### Por Instagram (DM, cuando no publica WhatsApp)

```
Hola! Soy Gastón, de Tucumán. Vi que la carta la tienen en las destacadas, así que te la armé para que tus clientes pidan desde un link y el pedido te llegue ordenado al WhatsApp. ¿Te la paso para que la veas?
```

Sin link en el primer DM (Instagram los frena en cuentas nuevas): el link va cuando contesta.

## 2. Cuando contesta el empleado

```
Buenísimo, gracias. Y ya que sos vos el que atiende esto: lo que hace es que el pedido te llega armado, con los agregados y la dirección adentro, en vez de tener que ir preguntando de a uno.

Si se lo pasás y quiere verlo, decile que en dos minutos se lo muestro andando. O pasame vos un horario y voy.
```

## 3. Cuando contesta el dueño

Si está en una app de delivery:
```
Bien. Contame una cosa, para no hacerte perder tiempo: de lo que vendés por PedidosYa, tenés idea de cuánto se te va en comisión por mes?
```

Si no:
```
Bien. Contame una cosa, para no hacerte perder tiempo: un viernes a la noche, los pedidos te entran más por acá o por PedidosYa?
```

## 4. El del día 3

Lo arma el CRM con lo que encontró el escaneo (de uno a tres hallazgos reales). Si no encontró
nada, el CRM avisa y no se manda. La forma:

```
Estuve mirando cómo se pide desde afuera, como lo ve alguien que todavía no te conoce. [Dos] cosas que vi:

1. [La carta está como foto en las destacadas, y hay que agrandarla para leer los precios.]
2. [Para saber el envío hay que preguntar por WhatsApp.]

Ninguna de las dos es grave sola. Juntas son pedidos que se caen antes de empezar.
```

## 5. El del día 8 (el cierre)

Con su carta armada:
```
Última por acá para no ser pesado. Tu carta queda armada en el link, por si un viernes querés probarla: [link]. Si te sirve, te lo dejo andando en el local sin costo de instalación. Éxitos con el local!
```

Sin carta:
```
Última por acá para no ser pesado. Si en algún momento querés ver cómo quedaría tu carta para pedir desde un link, pasame una foto y te la armo, sin compromiso. Éxitos con el local!
```

## 6. Cuando pide verlo con su carta

```
Mejor que explicártelo: pasame una foto de tu carta (o el link de tu Instagram) y te la armo entera, con tus precios y tus agregados, para que la veas andando. La cargo con IA, así que en un rato la tenés. Sin compromiso: si no te gusta, la bajo.
```

## 7. La visita

```
Te parece si paso y te lo dejo funcionando de verdad, con toda la carta y las fotos? La instalación es gratis y lo probás 15 días con tus pedidos reales. Si no te sirvió, lo sacamos.

Ahí te muestro también la otra parte, que es donde se ve de verdad: los pedidos entran a una pantalla en orden, con la hora y el estado de cada uno, y queda el registro de lo que más sale y de lo que se te termina. Eso es lo que hoy vive en papelitos y en la cabeza del que atiende.

Te va [martes 1] a las 16, o [jueves 3] a esa hora?
```

El CRM pone solo los dos días (el próximo martes y el próximo jueves, en orden).

## 8. El recontacto (el que dijo "después")

Se manda el día que él dijo, una vez:
```
Hola! Te escribo como quedamos. ¿Cómo viene el local? Lo que te había comentado sigue en pie: te armo tu carta en VivoMenu y, si te sirve, te lo dejo andando sin costo de instalación. ¿Te la armo esta semana?
```

## 9. A un conocido

```
Hola [nombre]! Te cuento en qué ando: armé VivoMenu, un link donde los clientes de un local de comida arman el pedido solos y le llega ordenado al WhatsApp. Estoy buscando los primeros locales de Tucumán para dejárselo andando gratis. ¿Conocés a alguien con un delivery, o lo tenés vos?
```

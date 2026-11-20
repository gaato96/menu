# Los mensajes de VivoMenu

**Rehecho el 2026-11-20** con las correcciones de Gastón: se habla como se habla en Tucumán ("Hola,
cómo están? Me llamo Gastón, soy de acá de Tucumán"), sin "No es un pedido, disculpá" (hace que no
lo lean) y **sin dar por hecho que tenemos su carta**: casi ningún local la publica entera, así que se
manda la de muestra y se ofrece armar la suya con una foto.

**Son los mismos que arma el Galu CRM** (`src/lib/vivomenu-mensajes.ts`), en la pantalla
**Prospección → VivoMenu · Locales**, que los manda con un toque. Acá están para leerlos y para usarlos
fuera del CRM (un conocido, un grupo). Al número de un local se le habla en plural ("les escribo"),
porque lo lee cualquiera; cuando contesta alguien, se pasa al vos.

---

## 1. El primero

**Por WhatsApp:**
```
Hola, cómo están? Me llamo Gastón, soy de acá de Tucumán.

Les escribo porque hice un sistema para locales de comida: el cliente entra a un link, ve la carta con fotos, arma su pedido y les llega a este WhatsApp ya escrito, con la dirección y cómo paga.

Les dejo uno de muestra para que lo vean: https://vivomenu.com.ar/m/burger-house-tuc

Si les interesa, les armo el de ustedes gratis con su carta.
```

**Por Instagram** (cuando Google no tiene su WhatsApp):
```
Hola, cómo están? Me llamo Gastón, soy de Tucumán. Hice un sistema para que los clientes les pidan desde un link y el pedido les llegue al WhatsApp ya escrito. Si quieren les paso uno de muestra, y si les sirve les armo el de ustedes gratis.
```

**Solo si Gastón ya les armó la carta** (porque la tenían publicada o se la pasaron), el CRM cambia
el mensaje cuando se pega el link en "Más opciones":
```
Hola, cómo están? Me llamo Gastón, soy de acá de Tucumán.

Les armé la carta en un link para que los clientes les pidan desde ahí: ven los productos con fotos, arman el pedido y les llega a este WhatsApp ya escrito, con la dirección y cómo paga.

Mírenla como si fueran un cliente: [link]

Si les sirve, se los dejo andando gratis.
```

## 2. El día 3

```
Hola de nuevo! No sé si pudieron ver el link que les mandé. Si me pasan una foto de la carta les armo la de ustedes y se las mando para que la vean, sin compromiso.
```

## 3. El día 8 (el último)

```
Última vez que les escribo por esto, no quiero molestar. Si algún día quieren probarlo, me escriben y se los armo. Éxitos!
```

## 4. Cuando contestan

| Quién o qué | El mensaje |
|---|---|
| **Contestó el dueño** | Buenísimo! Te hago una pregunta: los pedidos te entran más por WhatsApp o por PedidosYa? |
| **Contestó un empleado** | Gracias! Si le podés pasar el mensaje al dueño, te agradezco. A vos también te sirve: los pedidos llegan armados y no hay que preguntar todo de a uno. |
| **Le interesa ver el suyo** | Dale! Pasame una foto de la carta, con los precios, y te la armo. En un rato te mando el link para que la veas. |
| **Su carta ya armada** | Listo, acá está tu carta: [link]. Probá armar un pedido como si fueras un cliente y decime qué te parece. |
| **Proponer la visita** | Si te parece, paso por el local y te lo dejo andando. La instalación es gratis y lo probás 15 días con tus pedidos. Si no te sirve, lo sacamos. ¿Te queda bien el [martes] a las 16, o el [jueves]? |
| **Dijo "después"** (el día que dijo) | Hola, cómo andan? Les escribo como habíamos quedado, por lo del link para los pedidos. ¿Les armo la carta esta semana? |
| **No le interesa** | Dale, gracias igual por responder. Éxitos con el local! |

Las respuestas a "¿cuánto sale?", "no tengo tiempo", "ya uso otra cosa", etc., en `respuestas.md`.

## 5. A un conocido

```
Hola [nombre]! Te cuento en qué ando: armé un sistema para que los clientes de un local de comida pidan desde un link y el pedido le llegue armado al WhatsApp. Estoy buscando los primeros locales de Tucumán para dejárselo andando gratis. ¿Conocés a alguien con un delivery, o lo tenés vos?
```

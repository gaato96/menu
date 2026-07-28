# Checklist de instalación presencial

Para la visita al local, de punta a punta. Pensado para que lo siga alguien de
Galu sin tener que abrir el código.

## Antes de ir

- [ ] Alta del negocio desde `/admin/negocios/nuevo` (nombre, WhatsApp,
      dirección, color de marca, cuenta del dueño). Guardá la contraseña
      temporal — no se vuelve a mostrar.
- [ ] Cargado el menú real: categorías, productos, precios, grupos de
      opciones. Ideal hacerlo antes de la visita, no en el local.
- [ ] Definidos horarios, zonas de delivery y método(s) de pago en
      `/panel/config` (con la cuenta del dueño, o vos mismo si te dieron los
      datos).
- [ ] Verificado que `whatsapp_phone` sea el número real que el local
      atiende — un pedido a un número muerto es peor que no tener el sistema.

## En el local — tablet del mostrador (Android recomendado)

- [ ] Abrir `/login` en Chrome, entrar con la cuenta del dueño o encargado.
- [ ] Confirmar que el tablero (`/panel`) carga y muestra el nombre del local
      correcto en el header.
- [ ] Instalar como app: tocar el ícono de instalar en la barra de Chrome, o
      menú ⋮ → "Instalar app". Confirmar que abre en pantalla completa, sin
      barra de navegador, con el ícono de Menú Digital en el escritorio.
- [ ] Activar el sonido: tocar el banner rojo "El sonido está desactivado".
      Sin este paso no van a escuchar los pedidos nuevos.
- [ ] Activar notificaciones push cuando lo pida el banner correspondiente.
      **Requiere Android o iOS 16.4+ con la app ya agregada a inicio** — en
      iPhone sin instalar, Web Push no llega.
- [ ] Dejar la tablet enchufada y con el brillo bajo pero no apagado — el
      Wake Lock evita que se duerma, pero la batería igual se consume.

## Prueba real — no te vayas sin hacer esto

- [ ] Desde tu celular (fuera del WiFi del local, con datos), abrir
      `/m/[slug]`, armar un pedido real con una variante y un extra, y
      confirmarlo.
- [ ] Confirmar que la comanda aparece en el tablero en menos de 2 segundos.
- [ ] Confirmar que suena la alerta y aparece el overlay.
- [ ] Confirmar que el mensaje de WhatsApp que armó el sistema llega al
      número real del local, con el total correcto.
- [ ] Bloquear la tablet con el pedido de prueba sin tocar → confirmar que
      igual llega la notificación push (si se activó arriba).
- [ ] Mover la comanda de prueba por los 5 estados con los botones rápidos
      (no hace falta usar drag & drop para la prueba). Cancelarla al final o
      dejarla en Completado — no debe quedar basura en Pendiente de pago.

## Celular del cliente — instalación del menú (opcional, pero vale la pena)

- [ ] Mostrarle al dueño cómo se ve `/m/[slug]` instalado desde un celular:
      nombre y logo del local en el ícono, no "Menú Digital". Es un buen
      argumento de venta para que él mismo lo recomiende a sus clientes
      frecuentes.
- [ ] En iPhone: Compartir → Agregar a inicio (no hay botón automático de
      instalar en iOS).

## Cierre

- [ ] Suscripción cargada en `/admin/negocios/[id]` con el plan y el
      vencimiento acordados. Mientras no se active la cobranza automática,
      esto se actualiza a mano cada vez que el local paga.
- [ ] Le dejaste al dueño/encargado la contraseña temporal por escrito y le
      mostraste dónde cambiarla (su propio perfil).
- [ ] Si el local tiene más de un empleado, cargaste el resto desde
      `/panel/usuarios` (solo el dueño puede invitar).

# Chifa Apolo: carta digital con pedidos por WhatsApp (demo)

Página única (`index.html`) sin dependencias. Muestra la carta del local, deja armar el pedido
(acompañamiento, entrada, cambio de proteína, nota y cantidad) y lo envía ordenado por WhatsApp.

## Configurar

En el bloque `CONFIG` de `index.html`:

- `whatsapp`: número que recibe los pedidos, con código de país (`51987654321`).
  También se puede pasar en el link: `index.html?wa=51987654321`.
  Si queda vacío, WhatsApp abre para elegir a quién enviar el pedido.
- `phone`: teléfono fijo para el botón "Llamar" (vacío = se oculta).

## Por confirmar con el local

- Precios ilegibles en la foto de la carta: **N.º 3** (Combinado, puesto en S/ 18), **N.º 4**
  (Pollo con verduras y arroz blanco, S/ 17) y **N.º 20** (Lomo saltado con arroz blanco, S/ 19).
- En qué platos aplica el cambio a chancho asado o carne de res (+S/ 3). Ahora está en N.º 1, 2 y 3.
- Costo de delivery por zona, horario y número de WhatsApp del local.

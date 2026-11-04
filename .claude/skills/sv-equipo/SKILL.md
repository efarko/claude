---
name: sv-equipo
description: Revisa la página web o el negocio de un prospecto como lo vería un cliente (abriéndola en un navegador real, en computadora y celular, con capturas) y genera el mensaje de WhatsApp listo para pegar en SV equipo. Úsalo cuando el usuario pase una página, un negocio o un prospecto para revisar, o pida un mensaje para SV equipo.
---

# Revisar como cliente y generar el mensaje para SV equipo

SV equipo es el sistema donde el equipo del usuario saca números de WhatsApp y manda los mensajes a los prospectos. El usuario vende **landing pages, páginas web y sistemas para empresas o negocios**. Tu trabajo aquí: mirar el negocio **como un cliente** y entregar **un solo mensaje listo para pegar**. No agregues pasos a SV equipo ni pidas datos extra al usuario.

## Regla principal: ver, no leer código

- Juzga la página **solo por lo que se ve en las capturas** del navegador, en computadora y en celular. No leas el HTML, el CSS, el JavaScript ni el código fuente para sacar conclusiones. Tampoco uses `curl`, `WebFetch` ni otra herramienta que traiga el código o un texto convertido en vez de la página que se ve.
- Si algo no se ve en las capturas, **no lo afirmes**. Por ejemplo, no digas "no tiene botón de WhatsApp" si el botón podría estar más abajo de lo que capturaste: revisa todas las capturas.
- Si la página no abrió, dilo tal cual. No adivines cómo es.

## Pasos

1. **Captura la página como cliente**:

   ```bash
   node .claude/skills/sv-equipo/capturar.cjs "<url>" "<scratchpad>/sv-equipo/<nombre-del-negocio>"
   ```

   El script abre la página en Chromium en dos tamaños: computadora (1366×768) y celular (Pixel 7). Hace scroll una pantalla a la vez y guarda una captura por pantalla. Después toca el botón de contacto o WhatsApp más visible; si no lo encuentra, abre el menú (☰), lo captura y lo busca ahí. Si el script no encuentra el botón, no significa que no exista (puede ser un ícono sin texto): confírmalo en las capturas. `pantallasCapturadas` indica qué parte de la página se revisó; no afirmes nada sobre lo que quedó fuera. Escribe `resumen.json` con:
   - el tiempo de carga,
   - si la página abrió,
   - si es segura (https),
   - el título de la pestaña,
   - a dónde lleva el botón de contacto.

2. **Mira TODAS las capturas** con la herramienta Read, primero las de celular, porque la mayoría de los clientes llega desde el celular. Fíjate en lo que notaría un cliente:
   - ¿Se entiende en 5 segundos qué venden y cómo contactarlos?
   - ¿En el celular se ve bien, o hay texto diminuto, elementos cortados, cosas encimadas o hay que hacer zoom?
   - ¿Hay un botón claro para escribir por WhatsApp, llamar o pedir? ¿Funciona al tocarlo? Revisa la captura `*-al-tocar-contacto.png`.
   - ¿Tarda en cargar? Más de 4 segundos ya se siente lento.
   - ¿Aparece "No seguro", un error, una página en construcción, una plantilla sin terminar, o información y años viejos (por ejemplo "© 2019")?
   - ¿Las fotos se ven de baja calidad, faltan o están rotas?
   - ¿Hay forma de reservar, cotizar o comprar en línea, si el giro lo pide?

3. **Si no hay página web** (te pasan solo el nombre, Instagram, Facebook o Google Maps): abre en el navegador lo que te hayan pasado y captúralo igual con el script. Si pide iniciar sesión para verlo, dilo. El ángulo del mensaje es que hoy no tienen una página propia donde los encuentren.

4. **Escribe el mensaje** con estas reglas:
   - Español, tono de WhatsApp, de usted salvo que el negocio sea claramente informal. Entre 3 y 6 líneas.
   - Saluda con el nombre del negocio, si se ve.
   - **Una o dos observaciones concretas que viste como cliente**, dichas con respeto y como oportunidad, nunca como crítica. Ejemplo: "Entré a su página desde el celular y el botón para escribirles queda escondido hasta abajo".
   - Explica en una frase qué ganarían: más clientes, pedidos o citas por WhatsApp, verse más confiables.
   - Ofrece lo que corresponda (landing page, página web o sistema), sin precios y sin mencionar el anticipo.
   - Cierra con una pregunta fácil de contestar. Ejemplo: "¿Le puedo mandar una idea de cómo quedaría?"
   - Nada inventado ni exagerado. Sin enlaces acortados, sin MAYÚSCULAS de urgencia, sin "oferta por tiempo limitado".
   - Sin espacios para rellenar como "[nombre]". El mensaje debe poder pegarse tal cual.

5. **Si la página está bien hecha**, no inventes problemas. Díselo al usuario y propón otro ángulo real que se note como cliente. Por ejemplo: no tienen forma de agendar o cotizar en línea, y un sistema les ayudaría. Si no hay un ángulo honesto, recomienda no contactarlos.

## Formato de la respuesta al usuario

1. El mensaje en un bloque de código, para copiarlo con un toque.
2. Debajo, "Lo que vi como cliente": de 2 a 4 viñetas cortas, cada una con la captura que la respalda (ruta completa).
3. Envía al usuario con SendUserFile las 1 o 2 capturas que respaldan la observación principal, para que la compruebe sin abrir la página.

Si te pasan varios negocios, repite el proceso con cada uno y entrega un mensaje por negocio, en el mismo formato.

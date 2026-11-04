# Instrucciones del usuario

## Revisar páginas web y negocios: siempre como un cliente

Cuando revises cualquier página web, tienda en línea o negocio (de un prospecto, de un cliente o una que hayamos hecho nosotros):

- **Ábrela en un navegador real y mira capturas**, en computadora y en celular, como la vería un cliente. Usa el script `.claude/skills/sv-equipo/capturar.cjs` (Playwright y Chromium) y revisa cada captura con Read.
- **No saques conclusiones leyendo el código** (HTML, CSS, JS) ni con `curl`/`WebFetch`. Lo que está en el código no siempre es lo que el cliente ve, y eso causaba errores en las revisiones.
- Afirma solo lo que se ve en las capturas. Si la página no abre o algo no se alcanza a ver, dilo; no lo supongas.
- Para revisar nuestras propias páginas mientras las hacemos, aplica lo mismo: levanta la página y revísala con capturas en celular y computadora antes de decir que está bien.

## SV equipo

SV equipo es el sistema donde el equipo saca números de WhatsApp y manda mensajes a prospectos. Vendemos landing pages, páginas web y sistemas para empresas y negocios. Cuando el usuario pase un negocio o una página, usa la skill `sv-equipo`: revisa como cliente y entrega solo el mensaje listo para pegar. No agregues pasos al proceso de SV equipo.

# Herramientas para la tarea de la mañana (SV Equipo)

Las usa la tarea programada "Pendientes del día SV WebStudio + archivo SV Equipo" para armar cada día el archivo de prospectos de alto interés que Franco importa en SV Equipo (Panel → Prospectos → Importar).

Fuente principal, Google Maps:
1. `gmaps.js "<rubro> <distrito>" ...`: lee la lista de resultados de Google Maps (nombre, calificación, reseñas, rubro, dirección, celular, si tiene sitio web).
2. `gm_filtrar.py status.json salida.json gm*.json`: aplica el criterio de alto interés (rubro de citas, celular propio, abierto, con reseñas y calificación de 4 o más, sin cadenas) y saca los que ya están en SV Equipo o en `exportados.txt`.
3. `audit.js salida.json`: abre cada web a 390 px y anota un fallo comprobado; sin web propia → "no tienen una página web propia".
4. `gm_final.py auditado.json archivo.json DD/MM`: ordena por interés, arma el mensaje de WhatsApp con su calificación y reseñas de Google y anota cada fila en `exportados.txt`.

Fuente de respaldo, Páginas Amarillas: `pa_lote.js <status.json> <max> <rubro1> ...` lee las páginas de rubro `/servicios/<rubro>` y abre la ficha de cada negocio para ver si tiene web.

Requiere Playwright con Chromium en `/opt/node22/lib/node_modules/playwright` (no ejecutar `playwright install`).

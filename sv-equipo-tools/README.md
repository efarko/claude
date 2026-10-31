# Herramientas para la tarea de la mañana (SV Equipo)

Las usa la tarea programada "Pendientes del día SV WebStudio + archivo SV Equipo" para armar cada día el archivo de prospectos nuevos que Franco importa en SV Equipo (Panel → Prospectos → Importar).

- `pa_lote.js <status.json> <max> <rubro1> <rubro2> ...`: recorre las páginas de rubro de Páginas Amarillas (`/servicios/<rubro>`) con Playwright, se queda con negocios de Lima con celular (9 dígitos que empiezan con 9) que no estén en SV Equipo (`names` de `status.json`) ni en `exportados.txt`, y abre la ficha de cada uno para ver si tiene web propia.
- `audit.js <lote.json>`: abre cada web a 390 px y anota un fallo comprobado (`problem`, `need`). Sin web → "no tienen una página web propia". Si no encuentra un fallo claro, marca `skip`.

Requiere Playwright con Chromium en `/opt/node22/lib/node_modules/playwright` (no ejecutar `playwright install`).

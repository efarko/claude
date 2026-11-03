# Plantillas por rubro

Con estas plantillas se arma en minutos la muestra gratis y también la página final de un cliente. Así se cumple la entrega en 48 horas.

Rubros: `casa-reposo`, `dental`, `fisioterapia`, `veterinaria`, `taller`, `servicio-tecnico`.
Los ejemplos están en `ejemplos/<rubro>/index.html` (se regeneran con `node generar.mjs --ejemplos`).

## Cómo se usa

1. Se crea un JSON con los datos del cliente (ver abajo).
2. Se generan la página y la carpeta:
   ```bash
   node sv-webstudio/plantillas/generar.mjs cliente.json sv-webstudio/demos/<negocio>
   ```
3. Las fotos van dentro de esa carpeta (por ejemplo `sv-webstudio/demos/<negocio>/img/`).
4. Se revisa a 390 px y 1280 px y se publica.

## Datos del cliente

```json
{
  "rubro": "casa-reposo",
  "nombre": "El Hogar de las Canitas Felices",
  "distrito": "Lince",
  "direccion": "Jr. León Velarde 905",
  "whatsapp": "947116973",
  "telefonos": ["947116973", "(01) 470-1234"],
  "horario": "Atención las 24 horas",
  "muestra": true,
  "fotos": { "hero": "img/portada.jpg", "galeria": ["img/1.jpg", "img/2.jpg", "img/3.jpg"] },
  "redes": { "facebook": "https://facebook.com/...", "instagram": "https://instagram.com/..." },
  "servicios": [ { "icono": "pulse", "t": "Enfermería", "d": "Texto corto.", "b": ["Punto 1", "Punto 2"] } ],
  "textos": { "hero": { "titulo": "Otro título con <em>palabra resaltada</em>" } },
  "colores": { "marca": "#2f7a6d" }
}
```

- Solo `rubro` y `nombre` son obligatorios.
- `muestra: true` pone la banda "Muestra gratuita preparada por SV WebStudio". En la página final va `false`, y el pie dice "Web hecha por SV WebStudio".
- Sin `whatsapp`, los botones llevan a Contacto y aparece "Aquí irá su número de WhatsApp". Con número, todos los botones abren su chat.
- Con `direccion` aparece el mapa de Google y el link "Cómo llegar".
- Con `fotos.hero`, la portada muestra la foto y las situaciones del cliente pasan a su propia sección.
- `servicios` reemplaza la lista del rubro; `textos` cambia cualquier texto del rubro (misma forma que en `rubros.mjs`); `colores` cambia la paleta.
- Íconos disponibles: heart, clock, pulse, users, food, walk, home, bolt, sparkle, tooth, smile, shield, spine, paw, gear, check, wrench, flame, drop, snow, map, phone.

## Reglas

- Nunca inventar cifras, años de experiencia, premios ni testimonios. Solo datos reales del cliente.
- Los textos de cada rubro están en `rubros.mjs`. Si se agrega un rubro nuevo, se copia uno parecido y se adapta.

# Anuncio SV WebStudio: TikTok / Instagram Reels

## Entregables

| Archivo | Qué es |
|---|---|
| `out/sv-webstudio_reel_A_principal.mp4` | **Versión principal.** Gancho A: "¿Solo tienes Instagram?" |
| `out/sv-webstudio_reel_B_precio.mp4` | Variante de gancho B: "Tu web S/300 · lista en 3 a 5 días hábiles" |
| `out/sv-webstudio_reel_C_instagram-vende.mp4` | Variante de gancho C: "Tu Instagram muestra tu negocio. Tu web lo vende." |
| `BRIEF.md` | Investigación de marca, con la fuente de cada dato |
| `GUION.md` | Los 3 ganchos, la elección y la línea de tiempo con cada corte |
| `blender/sv_logo_3d.blend` | Escena 3D del logo (animada) |
| `blender/build_logo.py` | Script que construye la escena y renderiza |
| `renders/logo_still.png` | (a) Imagen del logo 3D, PNG con transparencia, 1000×1000 |
| `renders/logo_anim/frame_0001–0105.png` | (b) Revelado giratorio del logo, 3,5 s a 30 fps, PNG con transparencia |
| `renders/logo_anim_preview.mp4` | Vista rápida de la animación sobre el fondo de la marca (solo para revisar) |
| `brand/` | Favicon SVG original, imagen OG, fuentes de la web y copia de `config.js` |
| `video/` | Proyecto de Remotion (montaje) |

Las tres versiones son idénticas desde el segundo 2: solo cambia el gancho, así que la comparación de retención es limpia.
Especificaciones: H.264 + AAC 48 kHz, 1080×1920, 30 fps, 18 s, audio a −14,3 LUFS integrados, pico real ≤ −1,8 dBTP, `faststart`.

## Cómo regenerar

```bash
# Logo 3D (Blender 4.2 como módulo de Python)
uv venv -p 3.11 .bpy && uv pip install -p .bpy/bin/python "bpy==4.2.*"
.bpy/bin/python blender/build_logo.py          # .blend + imagen fija + secuencia

# Video
cd video && npm ci
npx remotion studio                             # vista previa
node render.mjs                                 # las 3 versiones en ../out/
```

El audio ya está en `video/public/audio/` (normalizado). Las tomas originales están en el canvas de ElevenLabs: https://elevenlabs.io/app/flows/ciUf1ETmljBPh8s9jBKL

## Notas de producción

- **Blender**: esta sesión no tenía un MCP de Blender conectado, así que el logo se construyó con Blender 4.2 LTS ejecutado como módulo de Python (`bpy`). Es el mismo motor (Cycles) y el `.blend` se abre en Blender normal.
- **Logo**: la web no publica un archivo de logo; es un cuadro redondeado con degradado y "SV" en texto. Se reconstruyó con geometría (cuadro extruido de 0,36, bisel de 0,07, esquinas con el radio de la web) y texto 3D con la fuente real (Bricolage Grotesque Bold). El degradado del material reproduce `--brand-gradient-logo` (118°, `#0e142a` 8 % → `#1c5cc6` 52 % → `#2d87ff` 92 %), con barniz brillante (*clearcoat*) e iluminación de estudio de tres luces más una barra de destello.
- **Precios**: S/300 y S/500 son precios de lanzamiento que la web muestra hasta el 31/12/2026. Después de esa fecha el anuncio queda desactualizado (los regulares son S/390 y S/690). La nota en pantalla lo indica.

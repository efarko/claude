# Guion: anuncio vertical SV WebStudio (TikTok / Instagram Reels)

- Formato: 9:16, 1080×1920, 30 fps, **18 s** (540 fotogramas).
- No hay locución: el texto en pantalla funciona como subtítulo grande y aparece palabra por palabra al ritmo de los cortes.
- Cada dato sale de [BRIEF.md](BRIEF.md). No se usa nada marcado como "no confirmado".
- Zona segura (en [`video/src/theme.ts`](video/src/theme.ts)): quedan libres 260 px arriba (pestañas y cabecera), 470 px abajo (descripción, audio y barra) y 150 px a la derecha (columna de botones). Todo el texto va dentro de esa caja.

## 1. Gancho: 3 opciones

| | Texto en pantalla | Acción visual | Respaldo en el BRIEF |
|---|---|---|---|
| **A** ✅ | "¿Solo tienes **Instagram?**" + etiqueta "Estás perdiendo clientes" | Las dos líneas entran de golpe (zoom 2,6× → 1×), con sacudida de cámara, destello blanco y un impacto | FAQ: "Solo tengo Instagram, ¿igual me sirve? Sí, de hecho es el caso más común". Sección "Por qué importa": "Sin una, pierdes clientes que ya estaban interesados." |
| B | "Tu web **S/300**" (S/390 tachado, "precio de lanzamiento") + "Lista en 3 a 5 días hábiles" | El precio entra de golpe, con sacudida y destello | Plan Landing: S/300 de lanzamiento (regular S/390) hasta el 31/12/2026, entrega en 3 a 5 días hábiles |
| C | "Tu Instagram muestra tu negocio." → golpe: "**Tu web lo vende.**" | La primera frase aparece palabra por palabra; la segunda entra de golpe con destello azul e impacto | Frase literal de la web (sección "Por qué importa") |

**Elegida: A.** Le habla directamente al cliente que el propio sitio llama "el caso más común" (el negocio que solo tiene Instagram), y en menos de un segundo plantea una pérdida concreta que la web afirma textualmente. Además lleva sola al bloque de PROBLEMA, mientras que B adelanta el precio que luego se repite en SOLUCIÓN. B y C se exportan como variantes para la prueba A/B.

## 2. Línea de tiempo

| Tiempo | Fotog. | Bloque | En pantalla (subtítulo) | Visual | Sonido |
|---|---|---|---|---|---|
| 0,0–2,0 s | 0–60 | **GANCHO** | (según variante, ver arriba) | Golpe de texto, sacudida, destello | Impacto + whoosh |
| 2,0–3,3 s | 60–100 | PROBLEMA | "Respondes lo mismo **todos los días**" | Burbujas de chat que se acumulan: "¿Precios?", "¿Horarios?", "¿Qué hacen?", "¿Precios?" | Whoosh |
| 3,3–4,7 s | 100–140 | PROBLEMA | "Se pierden **buscando** precios y horarios" | Cuadrícula de perfil que pasa borrosa, con un "?" que tiembla | Whoosh |
| 4,7–6,0 s | 140–180 | PROBLEMA | "Sin web, **pierdes clientes** que ya estaban interesados" | Seis siluetas: tres se ponen rojas y caen. Fondo con halo rojo | Whoosh + impacto suave |
| 6,0–8,0 s | 180–240 | **SOLUCIÓN** | "SV WebStudio" · etiqueta "Landing pages · Lima" | **Revelado del logo 3D** (secuencia PNG de Blender): el cuadro entra girando y las letras salen hacia adelante. Halo y destello azul | Whoosh + impacto al asentarse |
| 8,0–9,5 s | 240–285 | SOLUCIÓN | Tarjeta **Landing: S/300** (~~S/390~~) · Diseño a tu medida, no plantilla · WhatsApp integrado · Hasta 5 secciones · Entrega: 3 a 5 días hábiles | La tarjeta sube; el precio salta | Whoosh + pop |
| 9,5–11,0 s | 285–330 | SOLUCIÓN | Tarjeta **Landing Premium: S/500** (~~S/690~~) · RECOMENDADO · Textos escritos para vender · Secciones según tu rubro · 3 rondas de ajustes · Entrega: 7 a 10 días hábiles | Landing se encoge hacia arriba y entra Premium. Nota fija: "Pago único · Precio de lanzamiento válido hasta el 31/12/2026" | Whoosh + pop |
| 11,0–12,3 s | 330–370 | **PRUEBA** | "Precio cerrado **antes de empezar**" · "No cobramos por cotizar" | Insignia ✓ con el degradado del logo | Whoosh + pop |
| 12,3–13,7 s | 370–410 | PRUEBA | "Hablas directo con **quien hace tu web**" · "Dos dueños, sin vendedores ni intermediarios" | Avatares con iniciales JS / FV (Jesús Salas, Franco Vallardes) | Whoosh |
| 13,7–15,0 s | 410–450 | PRUEBA | "Webs **ya publicadas**" | Tres tarjetas: Avelino Restaurante (reservas online), Gladiadores Lima (inscripción por WhatsApp), Kiarapersonalized (catálogo + WhatsApp), con indicador "EN LÍNEA" | Whoosh + pop |
| 15,0–18,0 s | 450–540 | **CTA** | "**Escríbenos**" · botón verde de WhatsApp "+51 916 068 187" · "IG · TikTok @sv.webstudio" · "Te respondemos normalmente el mismo día" | Logo 3D fijo, golpe de texto, el botón late. Fondo con halo verde | Impacto + pop; la música se apaga |

En el bloque de PRUEBA no se usan testimonios, cifras de clientes ni garantías de devolución porque no están confirmados en la web. La prueba son los proyectos publicados y los compromisos que el sitio dice por escrito.

## 3. Audio (ElevenLabs)

- **Música**: Eleven Music v2.5, instrumental de 18 s ("electronic pop enérgico, 124 BPM, entrada con golpe, sin intro lenta").
- **Efectos**: Sound Effects v2: whoosh (×2 tomas), impacto grave (×2 tomas) y pop digital.
- **Normalización**: cada efecto se iguala antes de montarlo (whoosh −16 LUFS, impacto −14, pop −18, música −16). La mezcla final pasa por un `loudnorm` de dos pasadas a **−14 LUFS integrados y −1,5 dBTP**, la referencia de TikTok e Instagram.
- Canvas de ElevenLabs con todas las tomas generadas: https://elevenlabs.io/app/flows/ciUf1ETmljBPh8s9jBKL

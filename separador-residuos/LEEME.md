# Separador de residuos v3: MDF 6 mm para corte láser

Modelo 3D: `Separador_Residuos_3_compartimentos.step` (se abre en Fusion con Archivo → Abrir). Las medidas están en mm.
Tamaño general: hexágono de 800 mm entre esquinas y 590 mm de alto, con 3 compartimentos de unos 38 L.

## Archivos de corte (`corte_laser/`)

| Archivo | Contenido |
|---|---|
| `Plancha_1…4_MDF6mm_1300x900.dxf` | Las 47 piezas ya acomodadas en 4 planchas de 1300 × 900 mm |
| `piezas/*.dxf` | Cada pieza por separado, por si quieres acomodarlas tú |

Capas de las planchas: **CORTE** (rojo, cortar) · **ETIQUETAS_GRABAR** (azul, grabado opcional) · **PLANCHA_1300x900_NO_CORTAR** (solo referencia).

**Antes de cortar todo:** mide el espesor real del MDF, porque el de "6 mm" suele medir entre 5,5 y 5,8 mm.
Las ranuras están dibujadas a 6,0 mm exactos. Corta primero una pestaña con su ranura de prueba. Si queda floja, pega con cola blanca; si queda muy justa, ajusta la compensación de kerf de la láser.

## Piezas de MDF (todas de 6 mm)

| Código | Pieza | Cant. | Cómo se une |
|---|---|---|---|
| A | Base hexagonal | 1 | Ranuras para paredes y divisores, y muescas para las puertas |
| B | Plataforma con hueco de tolva | 1 | Ranuras para todas las piezas verticales, 3 pasacables de Ø25 y agujeros M3 |
| C | Divisor | 3 | Pestañas a la base y a la plataforma; se juntan en el centro (no lleva poste) |
| P | Pared fija (una por compartimento) | 3 | Pestañas a la base y a la plataforma |
| D | Puerta removible (una por compartimento) | 3 | Se apoya en la base con 2 pestañas, se sostiene arriba con imanes y tiene jalador calado |
| Q | Tope de puerta | 3 | Pestañas a la plataforma; lleva una arandela de acero frente al imán |
| E | Faldón de la tapa | 6 | Pestañas a la plataforma y al tablero F; 3 llevan la ventana del LCD y 3 agujeros de LED |
| H | Panel del ducto | 3 | Pestañas a la plataforma y al tablero F |
| F | Tablero superior | 1 | Boca triangular de 220 y hueco para el registro |
| K | Tapa de registro + 2 apoyos | 3 | Da acceso a la caja de control |
| G | Compuerta de tolva + oreja de varilla | 3 + 3 | La oreja encaja en una ranura de la compuerta |
| S | Soporte de servo | 3 | Pestañas a la plataforma; tiene el calado del MG996R y 4 agujeros M4 |
| T | Soporte del HC‑SR04 | 3 | Cuelga de la plataforma con 4 separadores M3×20 |
| M | Caja de control (fondo, 4 paredes con unión dentada, tapa y 2 guías) | 8 | Ventanas para cables, agujero de alimentación y ranuras de ventilación |

Comparado con la v2 desaparecen los listones triangulares (poste central y tacos J1/J2), las puertas en V y todos los cortes en ángulo. Ahora todo son piezas planas de 6 mm unidas con pestañas y ranuras.

## Electrónica (medidas reales usadas en el modelo)

| Componente | Cant. | Medida | Ubicación |
|---|---|---|---|
| Arduino UNO R4 WiFi | 1 | 68,6 × 53,3 mm, agujeros de montaje estándar UNO | Caja de control, sobre separadores M3×10 |
| Placa de control (2×74HC595, 2×PC817, 9×220 Ω, 2×100 nF, conectores, 3 borneras 2P) | 1 | 100 × 60 mm | Caja de control |
| Reductor XL4005E1 (servos / lógica) | 2 | 54 × 23 × 18 mm | Caja de control, parte delantera |
| HC‑SR04 | 3 | 45 × 20 mm, transductores Ø16 | Bajo la plataforma, mirando hacia abajo (nivel de llenado) |
| Servo MG996R | 3 | 40,7 × 19,7 × 42,9 mm, orejas de 54 mm | Soporte S, bajo la plataforma |
| Sensor inductivo LJ12A3‑4‑Z/BX | 1 | M12 × 50 mm | Compuerta de Metales, cara al ras |
| Sensor capacitivo LJC18A3‑H‑Z/BX | 1 | M18 × 62 mm | Compuerta de Plásticos, cara al ras |
| LCD 16×2 con I²C | 3 | Placa 80 × 36 mm, marco 71,2 × 24,2 mm | Un faldón por compartimento, ventana de 71,8 × 24,8 mm |
| LED de 5 mm (verde, ámbar, rojo) | 9 | Ø5 | Una columna de 3 junto a cada LCD |
| Bornera de entrada de 12 V | 1 | 2P, paso 5,08 mm | En la placa de control; el cable entra por un prensaestopa PG7 en el faldón trasero |

En la placa de control, los PC817 quedaron junto a los conectores del sensor inductivo y del capacitivo. Estos sensores trabajan entre 6 y 36 V, así que lo lógico es que los optoacopladores aíslen su señal antes de llegar al Arduino.

## Ferretería que no se corta con láser

- 6 bisagras chicas de 25 mm para las compuertas, con tornillos M3
- 6 imanes de neodimio de Ø10 × 3 mm y 6 arandelas de acero (puertas)
- 12 separadores M3×10 (electrónica) y 12 separadores M3×20 (HC‑SR04)
- 12 tornillos M3 y 12 espaciadores de 2 mm (LCD)
- 3 pasacables de goma de Ø25 y 1 prensaestopa PG7
- Unos 1,2 m de canaleta de PVC de 40 × 16 mm
- 3 varillas de alambre de acero de 2 mm (servo a compuerta)

## Orden de armado sugerido

1. Divisores (C) y paredes fijas (P) en la base (A).
2. Soportes de servo (S), topes de puerta (Q) y bisagras de las compuertas en la plataforma (B).
3. Plataforma encima de divisores y paredes.
4. Compuertas (G) con sus sensores, servos con su varilla y HC‑SR04 con su soporte (T).
5. Pasacables, canaleta y caja de control (M) sobre la plataforma.
6. Ducto (H) y faldones (E) con sus LCD y LED.
7. Tablero superior (F), registro (K) y puertas (D).

## Puntos a revisar

- **Corriente de los servos.** Un MG996R trabado consume hasta unos 2,5 A, y el XL4005 entrega como máximo 5 A. Alcanza si los servos se mueven de a uno.
- **Recorrido del servo.** Para abrir la compuerta de 50° a vertical, el brazo del servo gira unos 63°.
- **Sensores de proximidad.** El inductivo detecta a unos 4 mm, por eso los dos sensores quedan al ras de la compuerta. Fíjalos con dos tuercas por debajo y una gota de epoxi. Están corridos 22 mm a un lado para no chocar con el soporte del servo cuando la compuerta se abre.

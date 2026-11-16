# Explicación del código por sectores

Juego por turnos tipo Counter-Strike en consola (C++). 10 rondas; cada ronda es un juego
completo (tienda → turnos → resultado). Gana la partida quien sume más rondas ganadas.

## Mapa general

| Sector | Archivos | Responsabilidad |
|---|---|---|
| A. Configuración | `config.h` | Constantes del juego (tamaño, dinero, rondas, costos) |
| B. Geometría | `posicion.h`, `tablero.h` | Coordenadas, distancia y dibujo del mapa |
| C. Equipamiento | `equipamento.h` | Armas (herencia/polimorfismo) y chaleco |
| D. Agentes | `agente.h`, `terrorista.h`, `antiterrorista.h` | Jugadores y sus acciones propias |
| E. Bomba | `bomba.h` | Máquina de estados de la bomba |
| F. Tienda | `tienda.h` | Compra individual por agente |
| G. Partida | `partida.h` | Motor: rondas, turnos, combate, puntos |
| H. Persistencia | `registro.h`, `historial.h` | Guardar y leer partidas en archivo |
| I. Menú | `juego.h`, `main.cpp` | Menú principal y arranque |

Dependencias: `main → Juego → Partida → (Tablero, Bomba, Agente, Tienda, Historial)`.

---

## A. Configuración — `config.h`
Todas las reglas numéricas están aquí para cambiarlas sin tocar la lógica:
- `filas`, `columnas` = 10 (tablero), `agentes_por_equipo` = 5.
- `hp_inicial` = 100, `dinero_inicial` = 4000.
- `rondas_max` = 10 (rondas de la partida), `turnos_max` = 16 (turnos por ronda).
- `turnos_detonacion` = 4: la bomba explota 4 turnos después de plantarla.
- `ingreso_ronda` = 500 (por ronda a cada agente), `bono_eliminacion` = 700 (por baja).
- `duracion_desactivar` = 2 turnos sin kit, `duracion_desactivarConKit` = 1.
- Costos del chaleco/kit y `Chaleco_impactos` = 3 (cuántos golpes aguanta).

## B. Geometría

### `Posicion` (`posicion.h`)
Guarda `fila` y `columna`.
- `operator+`: suma posiciones (sirve para mover: posición + desplazamiento).
- `operator==` / `!=`: comparar casillas.
- `distanciaA`: distancia de **Chebyshev** = `max(|Δfila|, |Δcol|)`. Cuenta las diagonales
  como 1 casilla; se usa para el alcance de armas y para estar "junto a la bomba".

### `Tablero` (`tablero.h`)
- Matriz `char casillas[10][10]` con `.` y una `X` en el sitio de plantado (4,4).
- `posicionValida`: valida límites al moverse.
- `sitioPlantar`: ¿esta casilla es el sitio de la bomba?
- `mostrar`: arma una matriz temporal de strings y dibuja encima, en orden: bomba
  (`B` en el suelo, `X*` plantada) y luego agentes (`C1`, `T3`…). Solo dibuja agentes vivos.

## C. Equipamiento — `equipamento.h`
- **`Arma`** (clase base): nombre, costo, daño, alcance. `calcularDanio(distancia)` y
  `descripcion()` son **virtuales** → polimorfismo. Tiene destructor virtual porque el
  agente la libera con `delete` a través de un puntero base.
- **`Pistola`** (gratis, 20 daño, alcance 3), **`Subfusil`** (MP5: $1200, 35, alcance 2;
  hace 70 % del daño si el objetivo está a distancia ≥ alcance), **`Rifle`** ($2700, 60, alcance 4).
- `operator<<` de `Arma` imprime la ficha del arma en la tienda.
- **`Chaleco`**: `impactosRestantes`. `absorcion(daño)` absorbe la mitad del daño y gasta
  un impacto; cuando llega a 0 deja de proteger. `equipar()` lo carga, `quitar()` lo vacía.

## D. Agentes

### `Agente` (`agente.h`) — clase abstracta
Atributos: id, número, nombre, `hp`, `dinero`, `estado` (vivo/muerto), `posicion`,
`chaleco` y `Arma* arma` (siempre empieza con `Pistola`, memoria dinámica).
- Copia deshabilitada (`= delete`) porque posee un puntero; el destructor libera el arma.
- Métodos virtuales puros (cada bando los implementa): `simbolo`, `bando`,
  `puedeRecogerBomba`, `interactuar`.
- `operator-=(daño)`: pasa el daño por el chaleco, resta HP y marca muerto si HP ≤ 0.
- `atacar(rival)`: calcula distancia, pide el daño al arma (polimorfismo), se lo aplica y
  devuelve el daño real hecho.
- `enRango(rival)`: distancia ≤ alcance del arma.
- Economía y ronda: `gastar`, `ganar`, `equiparArma` (borra la anterior), `reiniciar`
  (HP completo, vivo, posición inicial) y `perderEquipo` (vuelve a pistola, sin chaleco ni kit).

### `Terrorista` (`terrorista.h`)
Símbolo `T`, puede recoger la bomba. `interactuar` = **plantar**: exige llevar la bomba y
estar en el sitio `X`; si cumple, llama `bomba.plantar(posicion, turno)`.

### `Antiterrorista` (`antiterrorista.h`)
Símbolo `C`, tiene `kit`. `interactuar` = **desactivar**: exige bomba plantada y estar a
distancia ≤ 1. Duración: `kit ? 1 : 2` turnos. La desactivación avanza con
`bomba.avanzarDesactivacion`; si no completa, informa el progreso.

## E. Bomba — `bomba.h`
Máquina de estados: `Con_portador → En_suelo → Plantada → Desactivada | Explotada`.
- `asignarPortador`, `soltar` (portador muerto), `recoger`, `plantar`, `explotar`.
- `debeExplotar(turno)`: `turno - turnoPlantado >= turnos_detonacion`.
- `avanzarDesactivacion`: el progreso solo continúa si es **el mismo agente** y en el
  **turno consecutivo**; si no, reinicia en 1. Al llegar a la duración, queda `Desactivada`.
- `desactivacionEnCurso`: se usa para mostrar el aviso en pantalla.

## F. Tienda — `tienda.h`
`Tienda::atenderAgente(agente, equipo)` abre un menú por agente (se llama en cada ronda):
1 MP5, 2 Rifle, 3 Chaleco, 4 Kit (solo CT), 0 terminar.
- Valida opción (con `cin` + `clear/ignore` si escriben letras).
- `comprarArma`: no deja comprar un arma igual o peor; usa `gastar` para cobrar y
  libera la memoria del arma si la compra falla.

## G. Motor del juego — `partida.h` (`Partida`)
Está dividido en sectores comentados en el código:

1. **Preparación**: `configurarEquipos` crea 5 CT y 5 T con `new` (índices pares CT,
   impares T; `agentes[1]` es el primer T). `prepararRonda` reinicia la bomba, revive a
   todos, quita equipo a los muertos y da +$500 (desde la ronda 2). `faseCompra` llama la tienda.
2. **Ciclo de ronda**: `jugarRonda` repite turnos (máx. 16, o más si hay bomba plantada).
   En cada turno cada agente vivo juega `turnoAgente` (M/A/I/N). Al final del turno
   revisa si la bomba debe explotar.
3. **Acciones**:
   - `accionMover`: W/A/S/D, valida límites y casilla ocupada; recoge la bomba si pisa su casilla.
   - `accionAtacar`: lista enemigos en rango, el jugador elige, se aplica daño; si muere,
     `procesarEliminacion` suelta la bomba si la llevaba y el atacante gana $700.
   - `accionInteractuar`: delega al agente (polimorfismo: plantar o desactivar).
4. **Reglas**: `juegoTerminado` (bomba explotó/desactivada, CT sin vivos, T sin vivos y
   sin bomba plantada), `contarVivos`, `casillaOcupada`, `buscarAgente`.
5. **Pantalla**: `mostrarEstadoBomba` y `mostrarEstadoAgentes`.
6. **Resultados**: `evaluarRonda` decide ganador y motivo (si se acaba el tiempo sin plantar,
   gana CT); `cerrarRonda` suma el punto; `ganadorFinal` compara puntos; `construirRegistro`.
7. **Interfaz pública**: `jugar()` = configurar equipos → 10 × (prepararRonda, faseCompra,
   jugarRonda, cerrarRonda) → resultado final → guardar en historial. El destructor libera los agentes.

## H. Persistencia
### `Registro` (`registro.h`)
Una partida guardada: fecha, equipos, ganador, rondas, puntosCT, puntosT, motivo.
- `aLinea()`: serializa con `|` como separador. `limpiar` reemplaza `|` y saltos en los nombres.
- `desdeLinea()`: parsea y **valida** (8 campos, ganador C/T/E, números en rango); devuelve false si la línea está dañada.
- `operator<<`: formato legible para el historial.

### `Historial` (`historial.h`)
- `guardar`: agrega una línea al final (`ios::app`), cuidando que el archivo termine en salto de línea.
- `mostrar`: lee línea a línea, ignora vacías/comentarios/dañadas (las cuenta) y muestra
  totales de victorias CT, T y empates.

## I. Menú — `juego.h` y `main.cpp`
`Juego::ejecutar` repite el menú (1 Jugar, 2 Historial, 3 Salir) hasta elegir 3, validando
la entrada. `main` crea `Juego` dentro de `try/catch` para cerrar limpio si se corta la entrada.

---

## Conceptos POO que puedes señalar en la defensa
- **Herencia**: `Pistola/Subfusil/Rifle ← Arma`; `Terrorista/Antiterrorista ← Agente`.
- **Polimorfismo**: `calcularDanio`, `interactuar`, `simbolo`, `descripcion` se resuelven en ejecución.
- **Clase abstracta**: `Agente` (métodos virtuales puros).
- **Sobrecarga de operadores**: `Posicion::+ == !=`, `Agente::-=`, `operator<<` en `Arma` y `Registro`.
- **Memoria dinámica**: armas y agentes con `new`/`delete` (destructor virtual, copia prohibida).
- **Encapsulamiento**: atributos privados/protegidos con getters.
- **Archivos**: lectura/escritura en `historial.txt` con validación de formato.

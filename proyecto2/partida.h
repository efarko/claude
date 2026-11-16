#ifndef UNTITLED_PARTIDA_H
#define UNTITLED_PARTIDA_H

#include <string>
#include <iostream>
#include <iomanip>
#include "config.h"
#include "agente.h"
#include "tablero.h"
#include "bomba.h"
#include "registro.h"
#include "terrorista.h"
#include "antiterrorista.h"
#include "tienda.h"
#include "historial.h"
#include <stdexcept>

using namespace std;

class Partida {
    Agente* agentes[total_agentes];
    Tablero tablero;
    Bomba bomba;
    int ronda;          // ronda actual (cada ronda es un juego completo)
    int turno;          // turno actual dentro de la ronda
    int rondasJugadas;
    int puntosCT;
    int puntosT;
    string equipoCT;
    string equipoT;

    static Posicion posicionInicial(int i) {
        return (i % 2 == 0) ? Posicion(0, i) : Posicion(filas - 1, i);
    }

    void configurarEquipos() {
        cout << "\nNombre del equipo Antiterrorista (CT): ";
        if (!getline(cin >> ws, equipoCT)) throw runtime_error("Se cerro la entrada de datos");
        cout << "Nombre del equipo Terrorista (T): ";
        if (!getline(cin >> ws, equipoT)) throw runtime_error("Se cerro la entrada de datos");
        for (int i = 0; i < agentes_por_equipo; i++) {
            agentes[2*i]= new Antiterrorista(2*i, i+1, equipoCT + "-" + to_string(i+1), posicionInicial(2*i));
            agentes[2*i+1] = new Terrorista(2*i+1, i+1, equipoT + "-" + to_string(i+1), posicionInicial(2*i+1));
        }
    }

    // Deja todo listo para una ronda nueva: ingreso de dinero, equipo de los caidos,
    // vida, posiciones y bomba. El dinero y el equipo de los sobrevivientes se conservan.
    void prepararRonda() {
        bomba = Bomba();
        for (int i = 0; i < total_agentes; i++) {
            if (!agentes[i]->getEstado()) agentes[i]->perderEquipo();
            agentes[i]->reiniciar(posicionInicial(i));
            if (ronda > 1) agentes[i]->ganar(ingreso_ronda);
        }
        bomba.asignarPortador(agentes[1]->getId());
    }

    void faseCompra() {
        cout << "\n=============================\n";
        cout << " FASE DE COMPRA - RONDA " << ronda << " de " << rondas_max << "\n";
        if (ronda > 1)
            cout << " (ingreso de ronda: +$" << ingreso_ronda << " por agente)\n";
        cout << "=============================\n";
        for (int i = 0; i < total_agentes; i += 2) Tienda::atenderAgente(*agentes[i], equipoCT);
        for (int i = 1; i < total_agentes; i += 2) Tienda::atenderAgente(*agentes[i], equipoT);
    }

    // Juega una ronda completa (turnos hasta que se cumpla algun objetivo).
    void jugarRonda() {
        bool terminada = false;
        turno = 1;
        while (!terminada and (turno <= turnos_max or bomba.estaPlantada())) {
            cout << "\n==================================\n";
            cout << " RONDA " << ronda << "/" << rondas_max << " | Marcador CT " << puntosCT << " - " << puntosT << " T\n";
            if (turno <= turnos_max)
                cout << " Turno " << turno << " de " << turnos_max << "\n";
            else
                cout << " Turno " << turno << " (tiempo extra: bomba plantada)\n";
            cout << "==================================\n";
            mostrarEstadoBomba();
            mostrarEstadoAgentes();

            for (int i = 0; i < total_agentes && !terminada; i++) {
                if (!agentes[i]->getEstado())
                    continue;
                turnoAgente(*agentes[i]);
                terminada = juegoTerminado();
            }

            if (!terminada and bomba.debeExplotar(turno)) {
                bomba.explotar();
                cout << "\n>> LA BOMBA HA DETONADO en el turno " << turno << "!\n";
                terminada = true;
            }
            if (!terminada) turno++;
        }
    }

    void turnoAgente(Agente& agente) {
        tablero.mostrar(agentes, total_agentes, bomba);
        cout << "\nTurno de " << agente.getNombre() << " (" << agente.etiqueta() << ") | HP "
         << agente.getHp() << " | " << agente.getArma().getNombre() << "\n";

        char accion;
        cout << "[M] Moverse  [A] Atacar  [I] Interactuar  [N] Pasar: ";
        if (!(cin >> accion)) throw runtime_error("Se cerro la entrada de datos");
        cin.ignore(10000, '\n');
        bool accionValida = false;
        switch (toupper(accion)) {
            case 'M': accionValida = accionMover(agente); break;
            case 'A': accionValida = accionAtacar(agente); break;
            case 'I': accionValida = accionInteractuar(agente); break;
            case 'N': cout << agente.getNombre() << " paso su turno.\n"; accionValida = true; break;
            default: cout << "Opcion invalida.\n";
        }
        if (!accionValida) {
            cout << "-- " << agente.getNombre() << " se equivoco y pierde su turno.\n";
        }
    }

    bool accionMover(Agente& agente) {
        char movimiento;
        cout << "Direccion (W = arriba, S = abajo, A = izquierda, D = derecha): ";
        if (!(cin >> movimiento)) throw runtime_error("Se cerro la entrada de datos");
        cin.ignore(10000, '\n');

        Posicion desplazamiento;
        switch (toupper(movimiento)) {
            case 'W': desplazamiento = Posicion(-1, 0); break;
            case 'S': desplazamiento = Posicion(1, 0); break;
            case 'A': desplazamiento = Posicion(0, -1); break;
            case 'D': desplazamiento = Posicion(0, 1); break;
            default:
                cout << "Direccion incorrecta.\n";
                return false;
        }

        Posicion destino = agente.getPosicion() + desplazamiento;

        if (!tablero.posicionValida(destino)) {
            cout << "Movimiento fuera del tablero.\n";
            return false;
        }
        if (casillaOcupada(destino)) {
            cout << "Casilla ocupada.\n";
            return false;
        }

        agente.setPosicion(destino);

        if (agente.puedeRecogerBomba() and bomba.getEstado() == Bomba::En_suelo and bomba.getPosicion() == destino) {
            bomba.recoger(agente.getId());
            cout << "-- " << mensaje_bomba << " (" << agente.getNombre() << ")\n";
        }
        return true;

    }

    bool accionAtacar(Agente& agente) {
        int candidatos[total_agentes];
        int cantidad = 0;
        for (int i = 0; i < total_agentes; i++) {
            const Agente& otro = *agentes[i];
            if (otro.getEstado() and otro.simbolo() != agente.simbolo() and agente.enRango(otro)) {
                candidatos[cantidad++] = i;
            }
        }

        if (cantidad == 0) {
            cout << "No hay enemigos dentro del alcance del arma ("
                 << agente.getArma().getAlcance() << " casillas).\n";
            return false;
        }

        cout << "Enemigos en rango:\n";
        for (int k = 0; k < cantidad; k++) {
            Agente& o = *agentes[candidatos[k]];
            cout << "  " << (k + 1) << ". " << o.etiqueta() << " " << o.getNombre() << " | HP " << o.getHp()
                 << " | distancia " << agente.getPosicion().distanciaA(o.getPosicion()) << "\n";
        }
        cout << "  0. No disparar (pierdes el turno)\n";

        int eleccion;
        cout << "Objetivo: ";
        while (!(cin >> eleccion)) {
            if (cin.eof()) throw runtime_error("Se cerro la entrada de datos");
            cin.clear();
            cin.ignore(10000, '\n');
            cout << "Entrada invalida, ingrese un numero.\nObjetivo: ";
        }
        cin.ignore(10000, '\n');
        if (eleccion < 0 or eleccion > cantidad) {
            cout << "Opcion incorrecta.\n";
            return false;
        }

        if (eleccion == 0) {
            cout << "Ataque cancelado.\n";
            return false;
        }

        Agente& objetivo = *agentes[candidatos[eleccion - 1]];
        bool teniaChaleco = objetivo.getChaleco().estaActivo();
        int danio = agente.atacar(objetivo);

        cout << agente.getNombre() << " ataco a " << objetivo.getNombre() << " con "
        << agente.getArma().getNombre() << " (-" << danio << " HP). HP restante: "
        << objetivo.getHp() << "\n";

        if (teniaChaleco)
            cout << "  El chaleco de " << objetivo.getNombre() << " absorbio parte del danio.\n";

        if (!objetivo.getEstado()) {
            procesarEliminacion(objetivo);
            agente.ganar(bono_eliminacion);
            cout << "-- " << agente.getNombre() << " recibe +$" << bono_eliminacion << " por la eliminacion.\n";
        }
        return true;
    }

    bool accionInteractuar(Agente& agente) {
        string mensaje;
        bool interaccion = agente.interactuar(bomba, tablero, turno, mensaje);
        cout << mensaje << "\n";
        return interaccion;
    }

    void procesarEliminacion(Agente& eliminado) {
        cout << "-- " << eliminado.getNombre() << " (" << eliminado.etiqueta() << ") ha sido eliminado.\n";

        if (bomba.getEstado() == Bomba::Con_portador and bomba.getIdPortador() == eliminado.getId()) {
            bomba.soltar(eliminado.getPosicion());
            cout << "-- La bomba quedo en el suelo (B) en " << describirPosicion(eliminado.getPosicion()) << ".\n";
        }
    }

    bool juegoTerminado() {
        if (bomba.getEstado() == Bomba::Explotada or bomba.getEstado() == Bomba::Desactivada)
            return true;
        if (contarVivos('C') == 0)
            return true;
        if (contarVivos('T') == 0 && !bomba.estaPlantada())
            return true;

        return false;
    }

    int contarVivos(char simbolo) {
        int vivos = 0;
        for (int i = 0; i < total_agentes; i++) {
            if (agentes[i]->getEstado() and agentes[i]->simbolo() == simbolo)
                vivos++;
        }
        return vivos;
    }

    bool casillaOcupada(const Posicion& posicion) {
        for (int i = 0; i < total_agentes; i++) {
            if (agentes[i]->getEstado() and agentes[i]->getPosicion() == posicion)
                return true;
        }
        return false;
    }

    const Agente* buscarAgente(int id) {
        for (int i = 0; i < total_agentes; i++) {
            if (agentes[i]->getId() == id) return agentes[i];
        }
        return nullptr;
    }

    void mostrarEstadoBomba() {
        switch (bomba.getEstado()) {
            case Bomba::Con_portador: {
                const Agente *portador = buscarAgente(bomba.getIdPortador());
                cout << "Bomba: la lleva " << (portador ? portador->getNombre() : "nadie") << ".\n";
                break;
            }
            case Bomba::En_suelo:
                cout << "Bomba: en el suelo (B) en " << describirPosicion(bomba.getPosicion()) << ".\n";
                break;
            case Bomba::Plantada: {
                cout << "BOMBA PLANTADA en " << describirPosicion(bomba.getPosicion())
                << " - detona al final del turno " << bomba.getTurnoDetonacion() << ".\n";

                const Agente *defusador = buscarAgente(bomba.getIdDesactivador());
                if (bomba.desactivacionEnCurso(turno) && defusador && defusador->getEstado()) {
                    cout << "Desactivacion en curso: " << defusador->getNombre() << " (progreso "
                         << bomba.getProgresoDesactivacion() << "). Debe interactuar en este turno o se pierde.\n";
                }
                break;
            }
            default:
                break;
        }
    }

    void mostrarEstadoAgentes() {
        cout << "\n--- Estado de los agentes ---\n";
        for (int i = 0; i < total_agentes; i++) {
            Agente& a = *agentes[i];
            cout << left << setw(4) << a.etiqueta() << setw(16) << a.getNombre();
            if (!a.getEstado()) {
                cout << "ELIMINADO\n";
                continue;
            }
            cout << "HP " << setw(4) << a.getHp() << setw(22) << a.getArma().getNombre();
            if (a.getChaleco().estaActivo())
                cout << " Chaleco x" << a.getChaleco().getImpactosRestantes();
            if (a.tieneKit())
                cout << " [KIT]";
            if (bomba.getEstado() == Bomba::Con_portador && bomba.getIdPortador() == a.getId())
                cout << " [LLEVA LA BOMBA]";
            cout << "\n";
        }
    }

    // Resultado de UNA ronda. Si se acaba el tiempo sin bomba plantada, gana CT.
    void evaluarRonda(char& ganador, string& motivo) {
        if (bomba.getEstado() == Bomba::Explotada) {
            ganador = 'T';
            motivo = "la bomba exploto";
        } else if (bomba.getEstado() == Bomba::Desactivada) {
            ganador = 'C';
            motivo = "la bomba fue desactivada";
        } else if (contarVivos('C') == 0) {
            ganador = 'T';
            motivo = "eliminaron a todo el equipo CT";
        } else if (contarVivos('T') == 0) {
            ganador = 'C';
            motivo = "eliminaron a todo el equipo T";
        } else {
            ganador = 'C';
            motivo = "se agoto el tiempo sin que plantaran la bomba";
        }
    }

    void cerrarRonda() {
        char ganador;
        string motivo;
        evaluarRonda(ganador, motivo);
        if (ganador == 'T') puntosT++; else puntosCT++;
        cout << "\n*** FIN DE LA RONDA " << ronda << ": punto para "
             << (ganador == 'T' ? equipoT + " (T)" : equipoCT + " (CT)") << " - " << motivo << ".\n";
        cout << "*** Marcador: " << equipoCT << " (CT) " << puntosCT << " - " << puntosT << " (T) " << equipoT << "\n";
    }

    // Resultado final por puntos.
    char ganadorFinal() const {
        if (puntosCT > puntosT) return 'C';
        if (puntosT > puntosCT) return 'T';
        return 'E';
    }

    string textoFinal() const {
        char g = ganadorFinal();
        string marcador = to_string(puntosCT) + " a " + to_string(puntosT);
        if (g == 'C') return "Gano " + equipoCT + " (CT) por " + marcador + ".";
        if (g == 'T') return "Gano " + equipoT + " (T) por " + marcador + ".";
        return "EMPATE " + marcador + ".";
    }

    Registro construirRegistro() {
        return Registro(equipoCT, equipoT, ganadorFinal(),
                        "marcador final tras " + to_string(rondasJugadas) + " rondas",
                        rondasJugadas, puntosCT, puntosT);
    }

    static string describirPosicion(const Posicion& posicion) {
        return "fila " + to_string(posicion.getFila() + 1) + ", columna " + to_string(posicion.getColumna() + 1);
    }

public:
    Partida(): ronda(1), turno(1), rondasJugadas(0), puntosCT(0), puntosT(0) {
        for (int i = 0; i < total_agentes; i++) agentes[i] = nullptr;
    }
    ~Partida() {
        for (int i = 0; i < total_agentes; i++) delete agentes[i];
    }

    Partida(const Partida&) = delete;
    Partida& operator=(const Partida&) = delete;

    void jugar() {
        configurarEquipos();

        // Cada ronda es un juego distinto: tienda al inicio de cada una.
        for (ronda = 1; ronda <= rondas_max; ronda++) {
            prepararRonda();
            faseCompra();
            jugarRonda();
            rondasJugadas = ronda;
            cerrarRonda();
        }

        cout << "\nFIN DEL JUEGO." << endl;
        cout << "Resultado de la partida: " << textoFinal() << endl;

        Historial historial;
        if (historial.guardar(construirRegistro()))
            cout << "Resultado guardado en el historial (" << Archivo_historial << ").\n";
        else
            cout << "AVISO: no se pudo guardar el resultado en '" << Archivo_historial << "'.\n";
    }

};

#endif //UNTITLED_PARTIDA_H

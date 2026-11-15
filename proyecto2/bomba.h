#ifndef UNTITLED_BOMBA_H
#define UNTITLED_BOMBA_H

#include "posicion.h"
#include "config.h"

using namespace std;

class Bomba {
public:
    enum Estado {Con_portador, En_suelo, Plantada, Desactivada, Explotada};
private:
    Estado estado;
    int idPortador;
    Posicion posicion;
    int turnoPlantado;

    int idDesactivador;
    int progresoDesactivacion;
    int turnoUltimoAvance;
public:
    Bomba():estado(Con_portador), posicion() ,idPortador(-1), turnoPlantado(0), idDesactivador(-1),
    progresoDesactivacion(0), turnoUltimoAvance(-1) {}

    Estado getEstado() const {  return estado; };
    int getIdPortador() const { return idPortador; };
    int getIdDesactivador() const { return idDesactivador; };
    int getProgresoDesactivacion() const { return progresoDesactivacion; };
    const Posicion& getPosicion() const { return posicion; };



    void asignarPortador(int idAgente) {
        estado = Con_portador;
        idPortador = idAgente;
    }

    void soltar(const Posicion& posicion) {
        estado = En_suelo;
        idPortador = -1;
        this->posicion = posicion;
    }

    void recoger(int idAgente) {
        estado = Con_portador;
        idPortador = idAgente;
    }

    void plantar(const Posicion& sitio, int turnoActual) {
        estado = Plantada;
        idPortador = -1;
        posicion = sitio;
        turnoPlantado = turnoActual;
        idDesactivador = -1;
        progresoDesactivacion = 0;
        turnoUltimoAvance = -1;
    }

    void desactivar() {
        estado = Desactivada;
    }

    void explotar() {
        estado = Explotada;
    }

    bool avanzarDesactivacion(int idAgente, int turnoActual, int duracion, int& progreso) {
        bool continua (idDesactivador == idAgente and turnoUltimoAvance == turnoActual-1 );
        progresoDesactivacion = continua ? progresoDesactivacion +1 : 1;
        idDesactivador = idAgente;
        turnoUltimoAvance = turnoActual;
        progreso = progresoDesactivacion;
        if (progresoDesactivacion >= duracion) {
            desactivar();
            return true;
        }
        return false;
    }

    bool desactivacionEnCurso(int turnoActual) {
        return (estado == Plantada and progresoDesactivacion > 0 and turnoUltimoAvance == turnoActual-1 );
    }

    bool estaPlantada() { return estado == Plantada; }

    bool debeExplotar(int turnoActual)  {
        return estado == Plantada and (turnoActual - turnoPlantado) >= turnos_detonacion;
    }

    int getTurnoDetonacion()  { return turnoPlantado + turnos_detonacion; }

};



#endif //UNTITLED_BOMBA_H

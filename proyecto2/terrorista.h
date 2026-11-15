#ifndef UNTITLED_TERRORISTA_H
#define UNTITLED_TERRORISTA_H

#include "agente.h"
#include "bomba.h"
#include "tablero.h"

class Terrorista : public Agente {
public:
    Terrorista(int id, int numero, string nombre, const Posicion& posicion ):
    Agente(id, numero, nombre, posicion) {}

    char simbolo() const override { return 'T'; }
    string bando() const override { return "Terrorista"; }
    bool puedeRecogerBomba() const override { return true; }

    bool interactuar(Bomba &bomba, const Tablero &tablero, int turno, string &mensaje) override {
        if (bomba.getEstado() != Bomba::Con_portador or bomba.getIdPortador() != id) {
            mensaje = "No llevas la bomba, no puedes plantar";
            return false;
        }

        if (!tablero.sitioPlantar(posicion)) {
            mensaje = "Solo se puede plantar en el sitio marcado con X";
            return false;
        }

        bomba.plantar(posicion, turno);
        mensaje = "-- " + nombre + " planto la bomba. Detonara al final del turno "
        + to_string(bomba.getTurnoDetonacion());
        return true;
    }
};



#endif //UNTITLED_TERRORISTA_H

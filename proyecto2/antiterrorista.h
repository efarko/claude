#ifndef UNTITLED_ANTITERRORISTA_H
#define UNTITLED_ANTITERRORISTA_H

#include "agente.h"
#include "bomba.h"

class Antiterrorista : public Agente {
    bool kit;
public:
    Antiterrorista(int id, int numero, string nombre, const Posicion& posicion):
    Agente(id, numero, nombre, posicion), kit(false) {}

    char simbolo() const override{ return 'C'; }
    string bando() const override{ return "Antiterrorista"; }

    bool puedeRecogerBomba() const override{ return false; }
    bool admiteKit() const override{ return true; }
    bool tieneKit() const override{ return kit; }
    void equiparKit() override{ kit = true; }
    void quitarKit() override{ kit = false; }

    bool interactuar(Bomba &bomba, const Tablero &tablero, int turno, string &mensaje) override {
        if (!bomba.estaPlantada()) {
            mensaje = "No hay ninguna bomba para desactivar";
            return false;
        }

        if (posicion.distanciaA(bomba.getPosicion()) > 1) {
            mensaje = "Debes estar junto a la bomba (X*) para desactivarla";
            return false;
        }

        int duracion = kit ? duracion_desactivarConKit : duracion_desactivar;
        int progreso = 0;
        bool completada = bomba.avanzarDesactivacion(id, turno, duracion, progreso);

        if (completada) {
            mensaje = "-- " + nombre + " desactivo la bomba" + string(kit ? " con kit" : "");
        } else {
            mensaje = "-- " + nombre + " esta desactivando la bomba (" + to_string(progreso) + "/" + to_string(duracion) + ")."
            + " Debe interactuar de nuevo en el siguiente turno sin interrumpirse.";
        }
        return true;
    }
};



#endif //UNTITLED_ANTITERRORISTA_H

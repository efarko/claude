#ifndef UNTITLED_TABLERO_H
#define UNTITLED_TABLERO_H

#include "config.h"
#include "posicion.h"
#include "agente.h"
#include "bomba.h"
#include <iostream>
#include <iomanip>
using namespace std;

class Tablero {
    char casillas[filas][columnas];
    Posicion sitio;
public:
    Tablero(): sitio(bomba_fila, bomba_comlumna) {
        for (int i=0; i<filas; i++) {
            for (int j=0; j<columnas; j++) {
                casillas[i][j] = '.';
            }
        }
        casillas[bomba_fila][bomba_comlumna] = 'X';
    }

    bool posicionValida(const Posicion& p) const {
        return p.getFila() >= 0 and p.getFila() < filas and
        p.getColumna() >= 0 and p.getColumna() < columnas;
    }

    bool sitioPlantar(const Posicion& p) const {return p == sitio; }

    const Posicion& getSitio() const { return sitio; }

    void mostrar(Agente* const* agentes, int total, const Bomba& bomba) const {
        string mapa[filas][columnas];
        for (int i=0; i<filas; i++) {
            for (int j=0; j<columnas; j++) {
                mapa[i][j] = string(1, casillas[i][j]) + " ";
            }
        }

        if (bomba.getEstado() == Bomba::En_suelo) {
            mapa[bomba.getPosicion().getFila()][bomba.getPosicion().getColumna()] = "B ";
        } else if (bomba.getEstado() == Bomba::Plantada) {
            mapa[bomba.getPosicion().getFila()][bomba.getPosicion().getColumna()] = "X*";
        }

        for (int i=0; i<total; i++) {
            if (agentes[i]->getEstado()) {
                const Posicion& p = agentes[i]->getPosicion();
                mapa[p.getFila()][p.getColumna()] = agentes[i]->etiqueta();
            }
        }

        cout << "\n   ";
        for (int j=0; j < columnas; j++ ) cout << left << setw(3) << (j+1);
        cout << "\n";
        for (int i=0; i < filas; i++) {
            cout << left << setw(3) << (i+1);
            for (int j=0; j < columnas; j++) cout << left << setw(3) << mapa[i][j];
            cout << "\n";
        }

    }
};

#endif //UNTITLED_TABLERO_H
#ifndef UNTITLED_POSICION_H
#define UNTITLED_POSICION_H
#include <cmath>

class Posicion {
    int fila;
    int columna;
public:
    Posicion(int fila=0, int columna=0): fila(fila), columna(columna) {};

    int getFila() const {return fila;}
    int getColumna() const {return columna;}

    Posicion operator+(const Posicion &p) const{
        int newFila = fila + p.fila;
        int newColumna = columna + p.columna;
        return Posicion(newFila, newColumna);
    }

    bool operator==(const Posicion &p) const {
        return (fila == p.fila and columna == p.columna);
    }

    bool operator!=(const Posicion &p) const {
        return !(*this == p);
    }

    int distanciaA(const Posicion &p) const {
        int difFila = abs(fila - p.fila);
        int difColumna = abs(columna - p.columna);
        return (difFila > difColumna) ? difFila : difColumna;
    }

};

#endif //UNTITLED_POSICION_H

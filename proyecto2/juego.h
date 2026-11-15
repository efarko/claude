#ifndef UNTITLED_JUEGO_H
#define UNTITLED_JUEGO_H

#include <iostream>
#include "partida.h"
#include "historial.h"
#include "entrada.h"
using namespace std;

class Juego {
    void mostrarMenu() const {
        cout << "\n=============================\n";
        cout << " BIENVENIDO A COUNTER STRIKE\n";
        cout << "=============================\n";
        cout << "1. Jugar Partida\n";
        cout << "2. Ver Historial\n";
        cout << "3. Salir\n";
    }

public:
    void ejecutar() {
        int opcion;
        do {
            mostrarMenu();
            opcion = entrada::leerEntero("Seleccione una opcion: ");
            switch (opcion) {
                case 1: {
                    cout << "\nComenzando partida...\n";
                    Partida partida;
                    partida.jugar();
                    break;
                }
                case 2: {
                    Historial historial;
                    historial.mostrar();
                    break;
                }
                case 3: cout << "\nSaliendo del juego.\n"; break;

                default: cout << "\nOpcion no valida!\n";
            }
        } while (opcion != 3);
    }
};




#endif //UNTITLED_JUEGO_H

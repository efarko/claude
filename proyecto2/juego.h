#ifndef UNTITLED_JUEGO_H
#define UNTITLED_JUEGO_H

#include <iostream>
#include "partida.h"
#include "historial.h"
#include <stdexcept>
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
            cout << "Seleccione una opcion: ";
            while (!(cin >> opcion)) {
                if (cin.eof()) throw runtime_error("Se cerro la entrada de datos");
                cin.clear();
                cin.ignore(10000, '\n');
                cout << "Entrada invalida, ingrese un numero.\nSeleccione una opcion: ";
            }
            cin.ignore(10000, '\n');
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

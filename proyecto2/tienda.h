#ifndef UNTITLED_TIENDA_H
#define UNTITLED_TIENDA_H

#include <string>
#include "agente.h"
#include <stdexcept>
#include <iostream>
using namespace std;

// Tienda individual: cada agente gasta su propio dinero.
class Tienda {
public:
    static void atenderAgente(Agente& agente, const string& nombreEquipo) {
        Subfusil mp5;
        Rifle rifle;

        bool comprando = true;
        while (comprando) {
            cout << "\n--- TIENDA | " << agente.getNombre() << " (" << agente.etiqueta() << ", "
                 << nombreEquipo << " / " << agente.bando() << ") ---\n";
            cout << "Dinero: $" << agente.getDinero() << " | Equipado: " << agente.getArma().getNombre()
                 << " | Chaleco: "
                 << (agente.getChaleco().estaActivo()
                         ? "SI (" + to_string(agente.getChaleco().getImpactosRestantes()) + " impactos)"
                         : string("NO"));
            if (agente.admiteKit()) {
                cout << " | Kit: " << (agente.tieneKit() ? "SI" : "NO");
            }
            cout << "\n";
            cout << "1. " << mp5 << "\n";
            cout << "2. " << rifle << "\n";
            cout << "3. Chaleco Antibalas - $" << Chaleco_costo
                 << " | Absorbe 50% del danio en los primeros " << Chaleco_impactos << " impactos\n";

            int maxOpcion = 3;
            if (agente.admiteKit()) {
                maxOpcion = 4;
                cout << "4. Kit de Desactivacion - $" << Kit_costo
                     << " | Desactivar la bomba toma " << duracion_desactivarConKit
                     << " turno en vez de " << duracion_desactivar << " (solo CT)\n";
            }
            cout << "0. Terminar compra\n";

            int opcion;
            cout << "Opcion: ";
            while (!(cin >> opcion)) {
                if (cin.eof()) throw runtime_error("Se cerro la entrada de datos");
                cin.clear();
                cin.ignore(10000, '\n');
                cout << "Entrada invalida, ingrese un numero.\nOpcion: ";
            }
            cin.ignore(10000, '\n');
            if (opcion < 0 || opcion > maxOpcion) {
                cout << "Opcion invalida, ingrese un numero del 0 al " << maxOpcion << "\n";
                continue;
            }

            switch (opcion) {
                case 1: comprarArma(agente, new Subfusil()); break;
                case 2: comprarArma(agente, new Rifle()); break;
                case 3:
                    if (agente.getChaleco().estaActivo()) {
                        cout << "Ya tienes un chaleco en buen estado\n";
                    } else if (!agente.gastar(Chaleco_costo)) {
                        cout << "Dinero insuficiente\n";
                    } else {
                        agente.equiparChaleco();
                        cout << agente.getNombre() << " compro Chaleco Antibalas\n";
                    }
                    break;
                case 4:
                    if (agente.tieneKit()) {
                        cout << "Ya tienes el kit\n";
                    } else if (!agente.gastar(Kit_costo)) {
                        cout << "Dinero insuficiente\n";
                    } else {
                        agente.equiparKit();
                        cout << agente.getNombre() << " compro el Kit de Desactivacion\n";
                    }
                    break;
                default:
                    comprando = false;
            }
        }
    }

private:
    // Recibe el arma ya creada; si no se compra, la libera.
    static void comprarArma(Agente& agente, Arma* nueva) {
        if (agente.getArma().getCosto() >= nueva->getCosto()) {
            cout << "Ya tienes esta arma o una mejor\n";
            delete nueva;
        } else if (!agente.gastar(nueva->getCosto())) {
            cout << "Dinero insuficiente\n";
            delete nueva;
        } else {
            cout << agente.getNombre() << " compro " << nueva->getNombre() << "\n";
            agente.equiparArma(nueva);
        }
    }
};

#endif //UNTITLED_TIENDA_H

#ifndef UNTITLED_HISTORIAL_H
#define UNTITLED_HISTORIAL_H

#include <string>
#include <iostream>
#include <fstream>
#include "config.h"
#include "registro.h"
using namespace std;

class Historial {
    string ruta;
public:
    explicit Historial(const string& ruta = Archivo_historial): ruta(ruta) {}

    bool guardar(const Registro& registro) {
        bool necesitaSalto = false;
        {
            ifstream lectura(ruta, ios::binary);
            if (lectura.is_open()) {
                lectura.seekg(0, ios::end);
                streamoff tamano = lectura.tellg();
                if (tamano > 0) {
                    lectura.seekg(-1, ios::end);
                    char ultimo = 0;
                    lectura.get(ultimo);
                    necesitaSalto = (lectura.good() and ultimo != '\n');
                }
            }
        }

        ofstream archivo(ruta, ios::app);
        if (!archivo.is_open()) return false;

        if (necesitaSalto) archivo << '\n';
        archivo << registro.aLinea() << '\n';
        archivo.flush();
        return archivo.good();
    }

    void mostrar() {
        ifstream archivo(ruta);
        if (!archivo.is_open()) {
            cout << "\nAun no hay partidas registradas (no se encontro el archivo '" << ruta << "').\n";
            return;
        }

        cout << "\n===== HISTORIAL DE PARTIDAS =====\n";

        int validos = 0, ignoradas = 0;
        int victoriasCT = 0, victoriasT = 0, empates = 0;
        string linea;

        while (getline(archivo, linea)) {
            if (!linea.empty() and linea.back() == '\r') linea.pop_back();   // archivos de Windows

            size_t primero = linea.find_first_not_of(" \t");
            if (primero == string::npos || linea[primero] == '#') continue;

            Registro registro;
            if (!Registro::desdeLinea(linea, registro)) {
                ignoradas++;
                continue;
            }

            validos++;
            std::cout << validos << ". " << registro << "\n";
            switch (registro.getGanador()) {
                case 'C': victoriasCT++; break;
                case 'T': victoriasT++; break;
                default: empates++;
            }
        }

        if (archivo.bad()) {
            cout << "ERROR: fallo la lectura del archivo '" << ruta << "'.\n";
        }

        if (validos == 0) {
            cout << "No hay partidas validas registradas.\n";
        } else {
            cout << "-----------------------------------\n";
            cout << "Partidas jugadas: " << validos
                      << " | Victorias CT: " << victoriasCT
                      << " | Victorias T: " << victoriasT
                      << " | Empates: " << empates << "\n";
        }

        if (ignoradas > 0) {
            cout << "Aviso: se ignoraron " << ignoradas
                      << " linea(s) danadas o con formato invalido.\n";
        }
    }
};


#endif //UNTITLED_HISTORIAL_H

#ifndef UNTITLED_REGISTRO_H
#define UNTITLED_REGISTRO_H

#include <string>
#include <ostream>
#include <ctime>
#include "config.h"
using namespace std;

class Registro {
    static const int Campos = 8;
    string fecha;
    string equipoCT;
    string equipoT;
    string motivo;
    char ganador;
    int rondas;
    int puntosCT;
    int puntosT;

    static string limpiar(const string& texto) {
        string resultado = texto;
        for (size_t i = 0; i < resultado.size(); i++) {
            if (resultado[i] == '|' or resultado[i] == '\n' or resultado[i] == '\r') resultado[i] = ' ';
        }
        return resultado;
    }

    static string fechaActual() {
        time_t ahora = time(nullptr);
        tm* local = localtime(&ahora);
        char buffer[32];
        if (local == nullptr or strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M", local) == 0)
            return "fecha-desconocida";
        return buffer;
    }

    static bool aEntero(const string& texto, int minimo, int maximo, int& salida) {
        try {
            size_t procesados = 0;
            int valor = stoi(texto, &procesados);
            if (procesados != texto.size() || valor < minimo || valor > maximo) return false;
            salida = valor;
            return true;
        } catch (const exception&) {
            return false;
        }
    }

public:
    Registro(): fecha(""), equipoCT(""), equipoT(""), motivo(""), ganador('E'), rondas(0), puntosCT(0), puntosT(0) {}

    Registro(const string& equipoCT, const string& equipoT, char ganador, const string& motivo, int rondas, int puntosCT, int puntosT)
    :fecha(fechaActual()), equipoCT(limpiar(equipoCT)), equipoT(limpiar(equipoT)), motivo(limpiar(motivo)),
    ganador(ganador), rondas(rondas), puntosCT(puntosCT), puntosT(puntosT) {}

    char getGanador() const { return ganador; }

    string aLinea() const { return fecha + "|" + equipoCT + "|" + equipoT + "|" + string(1, ganador) + "|" +
           to_string(rondas) + "|" + to_string(puntosCT) + "|" + to_string(puntosT) +
           "|" + motivo; }

    static bool desdeLinea(const string& linea, Registro& destino) {
        int separadores = 0;
        for (size_t i = 0; i < linea.size(); i++) {
            if (linea[i] == '|') separadores++;
        }
        if (separadores != Campos - 1) return false;

        string campos[Campos];
        size_t inicio = 0;
        for (int i = 0; i < Campos; i++) {
            size_t fin = linea.find('|', inicio);
            if (fin == string::npos) {
                campos[i] = linea.substr(inicio);
            } else {
                campos[i] = linea.substr(inicio, fin - inicio);
                inicio = fin + 1;
            }
        }

        if (campos[0].empty() || campos[1].empty() || campos[2].empty() || campos[7].empty()) return false;
        if (campos[3].size() != 1 || (campos[3][0] != 'C' && campos[3][0] != 'T' && campos[3][0] != 'E'))
            return false;

        int rondas = 0, puntosCT = 0, puntosT = 0;
        if (!aEntero(campos[4], 0, 100000, rondas)) return false;
        if (!aEntero(campos[5], 0, 100000, puntosCT)) return false;
        if (!aEntero(campos[6], 0, 100000, puntosT)) return false;

        destino.fecha = campos[0];
        destino.equipoCT = campos[1];
        destino.equipoT = campos[2];
        destino.ganador = campos[3][0];
        destino.rondas = rondas;
        destino.puntosCT = puntosCT;
        destino.puntosT = puntosT;
        destino.motivo = campos[7];
        return true;
    }

    friend ostream& operator<<(std::ostream& os, const Registro& r) {
        string quien = (r.ganador == 'C') ? r.equipoCT + " (CT)"
                      : (r.ganador == 'T') ? r.equipoT + " (T)"
                      : string("EMPATE");
        os << "[" << r.fecha << "] " << r.equipoCT << " (CT) vs " << r.equipoT << " (T)"
           << " | Ganador: " << quien
           << " | Rondas: " << r.rondas
           << " | Marcador CT " << r.puntosCT << " - " << r.puntosT << " T"
           << " | " << r.motivo;
        return os;
    }
};


#endif //UNTITLED_REGISTRO_H

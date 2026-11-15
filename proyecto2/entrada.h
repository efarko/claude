#ifndef UNTITLED_ENTRADA_H
#define UNTITLED_ENTRADA_H

#include <iostream>
#include <string>
#include <stdexcept>
using namespace std;

// Lectura segura de consola: siempre se consume la linea completa, asi una entrada
// invalida (letras, lineas vacias, "mw" en vez de "m") nunca deja el flujo en error
// ni deja caracteres sobrantes para la siguiente pregunta.
namespace entrada {

    inline string leerLinea(const string& prompt) {
        cout << prompt;
        string linea;
        if (!getline(cin, linea)) throw runtime_error("Se cerro la entrada de datos");
        return linea;
    }

    inline string recortar(const string& texto) {
        size_t ini = texto.find_first_not_of(" \t\r");
        if (ini == string::npos) return "";
        size_t fin = texto.find_last_not_of(" \t\r");
        return texto.substr(ini, fin - ini + 1);
    }

    // Texto no vacio (admite espacios, ej. "Team Alpha").
    inline string leerTexto(const string& prompt) {
        while (true) {
            string t = recortar(leerLinea(prompt));
            if (!t.empty()) return t;
            cout << "El texto no puede estar vacio.\n";
        }
    }

    // Primer caracter de la linea; repite si la linea esta vacia.
    inline char leerCaracter(const string& prompt) {
        while (true) {
            string t = recortar(leerLinea(prompt));
            if (!t.empty()) return t[0];
        }
    }

    // Entero valido; repite hasta que la linea sea un numero completo.
    inline int leerEntero(const string& prompt) {
        while (true) {
            string t = recortar(leerLinea(prompt));
            try {
                size_t usados = 0;
                int v = stoi(t, &usados);
                if (usados == t.size()) return v;
            } catch (const exception&) {}
            cout << "Entrada invalida, ingrese un numero.\n";
        }
    }
}

#endif //UNTITLED_ENTRADA_H

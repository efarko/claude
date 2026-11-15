#include <iostream>
using namespace std;
#include "juego.h"

int main() {
    try {
        Juego juego;
        juego.ejecutar();
    } catch (const exception& e) {
        cout << "\n" << e.what() << ". Cerrando el programa.\n";
    }
    return 0;
}
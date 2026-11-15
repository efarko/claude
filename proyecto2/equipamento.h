#ifndef UNTITLED_EQUIPAMENTO_H
#define UNTITLED_EQUIPAMENTO_H

#include <ostream>
#include <string>
#include "config.h"
using namespace std;

class Arma {
protected:
    string nombre;
    int costo;
    int danio;
    int alcance;
public:
    Arma(string nombre, int costo, int danio, int alcance):
    nombre(nombre),costo(costo),danio(danio),alcance(alcance) {}

    virtual ~Arma() {}

    string getNombre() {return nombre;}
    int getCosto() {return costo;}
    int getDanio() {return danio;}
    int getAlcance() {return alcance;}

    virtual int calcularDanio(int distancia) const { return danio; }
    virtual string descripcion() const{return "Arma de uso general"; }

    friend ostream& operator<<(ostream& os, const Arma& arma) {
        os << arma.nombre << " - $" << arma.costo
       << " | Danio: " << arma.danio
       << " | Alcance: " << arma.alcance << " casillas"
       << " | " << arma.descripcion();
        return os;
    }
};


class Pistola : public Arma {
public:
    Pistola (const string &nombre="USP/Glock (Pistola)", int costo=0, int danio=20, int alcance=3):
    Arma(nombre, costo, danio, alcance) {}

    string descripcion() const override {return "Arma por defecto";}
};


class Subfusil : public Arma {
public:
    Subfusil (const string &nombre="MP5 (Subfusil)", int costo=1200, int danio=35, int alcance=2):
    Arma(nombre, costo, danio, alcance) {}

    int calcularDanio(int distancia) const override{
        if (distancia >= alcance){ return danio*0.7; }
        return danio;
    }

    string descripcion() const override {return "Ataque rapido, penaliza precision a la larga distancia";}
};


class Rifle : public Arma {
public:
    Rifle (const string &nombre="AK-47/M4A4 (Rifle)", int costo=2700, int danio=60, int alcance=4):
    Arma(nombre, costo, danio, alcance) {}

    string descripcion() const override {return "Alto danio, arma principal de asalto";}
};


class Chaleco {
    int impactosRestantes;
public:
    Chaleco():impactosRestantes(0) {}

    void equipar(){ impactosRestantes = Chaleco_impactos; }

    void quitar(){ impactosRestantes = 0; }

    bool estaActivo() const {return (impactosRestantes > 0); }

    int getImpactosRestantes() const {return impactosRestantes;}

    int absorcion(int danio) {
        if (!estaActivo()){ return danio; }
        int danio_absorbido = danio/2;
        impactosRestantes--;
        return (danio - danio_absorbido);
    }

};

#endif //UNTITLED_EQUIPAMENTO_H

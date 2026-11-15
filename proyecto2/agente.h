#ifndef UNTITLED_AGENTE_H
#define UNTITLED_AGENTE_H

#include "posicion.h"
#include "equipamento.h"
#include "config.h"

class Bomba;
class Tablero;

class Agente {
protected:
    int id;
    int numero;
    string nombre;
    int hp;
    int dinero;
    bool estado; //vivo o muerto
    Posicion posicion;
    Chaleco chaleco;
    Arma* arma; // asociacion // si el jugador muere, su arma se va con el

public:
    Agente(int id, int numero, string nombre, const Posicion& posicion):
    id(id), numero(numero), nombre(nombre), posicion(posicion), hp(hp_inicial), dinero(dinero_inicial), estado(true),
    chaleco(),arma(new Pistola()) {}

    virtual ~Agente() {delete arma;}
    Agente(const Agente&) = delete;
    Agente& operator=(const Agente&) = delete;

    virtual char simbolo() const = 0;
    virtual string bando() const = 0;
    virtual bool puedeRecogerBomba() const = 0;
    virtual bool interactuar(Bomba& bomba, const Tablero& tablero, int turno, string& mensaje) = 0;

    virtual bool admiteKit() const { return false; }
    virtual bool tieneKit() const { return false; }
    virtual void equiparKit() {}
    virtual void quitarKit() {}


    int getId() const {return id;}
    const Posicion& getPosicion() const { return posicion; }
    const string& getNombre() const {return nombre;}
    int getHp() const {return hp;}
    int getDinero() const {return dinero;}
    bool getEstado() const {return estado;}
    const Chaleco& getChaleco() {return chaleco;}
    Arma& getArma() const {return *arma;}
    string etiqueta() const {
        return string(1, simbolo()) + to_string(numero);
    }

    void setPosicion(const Posicion& posicion) {this->posicion = posicion;}

    bool gastar(int monto) {
        if (monto > dinero) {return false;}
        dinero -= monto;
        return true;
    }

    void equiparArma(Arma* arma) {
        delete this->arma;
        this->arma = arma;
    }

    void equiparChaleco() {
        chaleco.equipar();
    }

    void ganar(int monto) { dinero += monto; }

    // Nueva ronda: vida completa, vivo y de vuelta a su posicion inicial.
    void reiniciar(const Posicion& inicio) {
        hp = hp_inicial;
        estado = true;
        posicion = inicio;
    }

    // Quien muere pierde todo su equipamiento (vuelve a la pistola inicial).
    void perderEquipo() {
        equiparArma(new Pistola());
        chaleco.quitar();
        quitarKit();
    }

    bool enRango(const Agente& rival) {
        return posicion.distanciaA(rival.posicion) <= arma->getAlcance();
    }

    Agente& operator-=(int danio) {
        danio =chaleco.absorcion(danio);
        hp -= danio;
        if (hp <= 0) {
            hp = 0;
            estado = false;
        }
        return *this;
    }

    int atacar(Agente& rival) {
        int distancia = posicion.distanciaA(rival.posicion);
        int danioBruto = arma->calcularDanio(distancia);
        int hpAnt = rival.getHp();
        rival -= danioBruto;
        return hpAnt - rival.getHp();
    }
    
};


#endif //UNTITLED_AGENTE_H

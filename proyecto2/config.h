
#ifndef UNTITLED_CONFIG_H
#define UNTITLED_CONFIG_H

#include <string>
using namespace std;

const int filas= 10;
const int columnas= 10;
const int agentes_por_equipo = 5;
const int total_agentes = agentes_por_equipo*2;

const int hp_inicial = 100;
const int dinero_inicial = 4000;

const int rondas_max = 10;          // rondas de la partida (cada ronda es un juego distinto)
const int turnos_max = 16;          // turnos maximos por ronda (si no hay bomba plantada)
const int turnos_detonacion = 4;    // turnos que tarda la bomba en explotar tras plantarla
const int ingreso_ronda = 500;      // dinero que recibe cada agente al inicio de cada ronda
const int bono_eliminacion = 700;   // dinero extra por cada enemigo eliminado
const int bomba_fila = 4;
const int bomba_comlumna = 4;
const string mensaje_bomba = "Bomba recogida";
const int duracion_desactivar = 2;
const int duracion_desactivarConKit = 1;

const string Archivo_historial = "historial.txt";

const int Chaleco_impactos = 3;
const int Chaleco_costo = 650;
const int Kit_costo = 400;
#endif //UNTITLED_CONFIG_H

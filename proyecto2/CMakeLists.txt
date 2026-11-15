cmake_minimum_required(VERSION 4.3)
project(untitled)

set(CMAKE_CXX_STANDARD 20)

add_executable(untitled main.cpp
        config.h
        tablero.h
        posicion.h
        equipamento.h
        agente.h
        bomba.h
        antiterrorista.h
        terrorista.h
        tienda.h
        partida.h
        registro.h
        historial.h
        juego.h)


---
trigger: always_on
---

La idea de este proyecto es hacer un motor interno de pokemon para el servidor de partidas online multijugador y multipokemon. Este engine es el corazón del sistema en el server.

# Board
Representa el estado de la partida. Contienen los pokemon de cada jugador, cuales estan en el campo, y el estado de cada pokemon. 

# Turn
Contiene un turno listo para ser ejecutado. Este turno contiene una Board, y una lista de request que se ejecutan. 

La idea es que el "Turn", ejecuta el array de "PlayerRequest" sobre la board con execute y escribe el history. Se implementará a traves de una api rest externa a este engine, donde debe haber una función request que recibe de input un [PlayerRequest; PLAYER_PER_BOARD] y devuelve como output un (Board, History), por lo que las llamadas deben estar preparadas para abi o js interop, pues el resto del server puede estar escrito en otro lenguaje, como java.

Este crate solo contiene la librería core del engine, no implementa el servidor REST. Solo implementa los endpoints para interoperar con otros lenguajes.
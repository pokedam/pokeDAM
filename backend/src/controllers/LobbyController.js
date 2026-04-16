const lobbyService = require('../services/LobbyService');

module.exports = (io, socket) => {
    // Almacenamos el userId simulado. En una app real vendría del auth/token middleware
    // y se asignaría en socket.user.id
    const playerId = socket.userId; 

    // Equivalente a @SubscribeMapping("/lobbies")
    socket.on('lobbies.getAll', (callback) => {
        const lobbies = lobbyService.getAll();
        if (typeof callback === 'function') {
            callback({ status: 'ok', data: lobbies });
        }
    });

    // Equivalente a @SubscribeMapping("/lobbies/{lobbyId}")
    socket.on('lobbies.get', (lobbyId, callback) => {
        const lobby = lobbyService.get(lobbyId);
        if (typeof callback === 'function') {
            if (lobby) {
                callback({ status: 'ok', data: lobby });
            } else {
                callback({ status: 'error', message: 'Lobby not found' });
            }
        }
    });

    // Equivalente a @MessageMapping("/lobby.create")
    socket.on('lobby.create', async (payload, callback) => {
        const { name, password } = payload;
        const lobbyEntry = await lobbyService.create(playerId, name, password);
        
        // Notificar que hay nueva sala disponible a /topic/lobbies (todos los conectados)
        io.emit('lobbies.event', {
            type: 'ADDED',
            payload: {
                id: lobbyEntry.key,
                name: lobbyEntry.value.name,
                hasPassword: !!password,
                playerCount: 1,
                maxPlayers: lobbyEntry.value.maxPlayers
            }
        });

        if (typeof callback === 'function') {
            callback({ status: 'ok', data: lobbyEntry.key }); // SendToUser equivalent
        }
    });

    // Equivalente a @MessageMapping("/lobby.join")
    socket.on('lobby.join', async (payload, callback) => {
        const { lobbyId, password } = payload;
        const res = await lobbyService.join(lobbyId, playerId, password);

        if (res != null) {
            // El usuario ingresa a la "room" de socket.io
            socket.join(`lobby_${lobbyId}`);

            // Notificamos al resto en esta sala que ha entrado un jugador
            io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                type: 'PLAYER_JOINED',
                payload: { id: playerId, nickname: res.joiner.nickname }
            });

            // Notificar cambio en el tamaño de sala a todos
            io.emit('lobbies.event', {
                type: 'CHANGED',
                payload: {
                    lobbyId: lobbyId,
                    size: res.lobby.joiners.size + 1
                }
            });

            if (typeof callback === 'function') callback({ status: 'ok' });
        } else {
             if (typeof callback === 'function') callback({ status: 'error', message: 'Auth failed / full' });
        }
    });

    // Equivalente a @MessageMapping("/lobby.ready")
    socket.on('lobby.ready', (payload, callback) => {
        const { isReady } = payload;
        const lobbyEntry = lobbyService.setReady(playerId, isReady);

        if (lobbyEntry != null) {
            const lobbyId = lobbyEntry.key;
            // Informar a todos en la lobby
            io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                type: 'PLAYER_READY',
                payload: { id: playerId, isReady: isReady }
            });

            if (typeof callback === 'function') callback({ status: 'ok' });
        }
    });

    // Equivalente a @MessageMapping("/lobby.start")
    socket.on('lobby.start', (payload, callback) => {
        const lobbyEntry = lobbyService.startGame(playerId);

        if (lobbyEntry != null) {
            const lobby = lobbyEntry.value;
            const lobbyId = lobbyEntry.key;
            
            // Notificamos a todos dentro que el juego comienza
            io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                type: 'GAME_STARTED',
                payload: lobbyId
            });

            // Al activarse, ya no está en WAITING, lo simulamos
            io.emit('lobbies.event', {
                type: 'CHANGED',
                payload: { lobbyId: lobbyId, size: lobby.joiners.size + 1 }
            });

            if (typeof callback === 'function') callback({ status: 'ok' });
        }
    });

    // Separamos la logica de salir para poder llamarla desde el disconnect
    const leaveLobby = () => {
        const res = lobbyService.leave(playerId);
        if (res != null) {
            const size = res.lobby ? res.lobby.joiners.size + 1 : 0;
            const { lobbyId } = res;
            
            // Lobby has been removed
            if (res.lobby == null) {
                io.emit('lobbies.event', {
                    type: 'CHANGED',
                    payload: { lobbyId, size: 0 }
                });
            } else {
                io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                    type: 'PLAYER_LEFT',
                    payload: { 
                        id: res.hostReplacement ? res.lobby.hostId : playerId,
                        hostReplacement: res.hostReplacement 
                    }
                });

                io.emit('lobbies.event', {
                     type: 'CHANGED',
                     payload: { lobbyId, size }
                });
            }
            // Sacamos el socket del room
            socket.leave(`lobby_${lobbyId}`);
        }
    };

    // Equivalente a @MessageMapping("/lobby.leave")
    socket.on('lobby.leave', leaveLobby);

    // Equivalente a @EventListener(SessionDisconnectEvent.class)
    socket.on('disconnect', () => {
        leaveLobby();
    });
};

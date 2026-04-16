import { Server, Socket } from 'socket.io';
import { lobbyService } from '../services/LobbyService.js';

export const lobbyController = (io: Server, socket: Socket): void => {
    // Almacenamos el userId. En una app real vendría del auth/token middleware
    const playerId = (socket as any).userId as number; 

    // Equivalente a @SubscribeMapping("/lobbies")
    socket.on('lobbies.getAll', (callback: (response: any) => void) => {
        const lobbies = lobbyService.getAll();
        if (typeof callback === 'function') {
            callback({ status: 'ok', data: lobbies });
        }
    });

    // Equivalente a @SubscribeMapping("/lobbies/{lobbyId}")
    socket.on('lobbies.get', (lobbyId: string, callback: (response: any) => void) => {
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
    socket.on('lobby.create', async (payload: any, callback: (response: any) => void) => {
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
    socket.on('lobby.join', async (payload: any, callback: (response: any) => void) => {
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
    socket.on('lobby.ready', (payload: any, callback: (response: any) => void) => {
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
    socket.on('lobby.start', (payload: any, callback: (response: any) => void) => {
        // En una implementación real probablemente comprobemos si la db/estado está listo
        const lobbyEntry = lobbyService.startGame(playerId);
        if (lobbyEntry && typeof callback === 'function') {
           callback({ status: 'ok' });
        }
    });
};
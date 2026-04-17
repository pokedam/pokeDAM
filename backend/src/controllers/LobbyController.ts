import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../config/Database.js';

export interface Player {
    isReady: boolean;
    nickname: string | null;
}

export interface Lobby {
    name: string;
    password?: string | null;
    hostId: number;
    hostNickname: string | null;
    //state: 'WAITING' | 'IN_GAME';
    joiners: Map<number, Player>;
    maxPlayers: number;
}

const lobbies: Map<string, Lobby> = new Map();
const players: Map<number, string> = new Map();

function lobbyToInfo(lobby: Lobby) {
    return {
        name: lobby.name,
        hasPassword: !!lobby.password,
        playerCount: lobby.joiners.size + 1, // +1 for the host
        maxPlayers: lobby.maxPlayers,
    }
}


export const lobbyController = (io: Server, socket: Socket): void => {

    // Almacenamos el userId. En una app real vendría del auth/token middleware
    const playerId = (socket as any).userId as number;

    // Equivalente a @SubscribeMapping("/lobbies")
    socket.on('lobbies.getAll', (callback: (response: any) => void) => {
        if (typeof callback === 'function') {
            callback({
                status: 'ok',
                data: Array.from(lobbies.entries()).map(([id, lobby]) => ({
                    id,
                    ...lobbyToInfo(lobby)
                }))
            });
        }
    });

    // Equivalente a @SubscribeMapping("/lobbies/{lobbyId}")
    socket.on('lobbies.get', (lobbyId: string, callback: (response: any) => void) => {
        const lobby = lobbies.get(lobbyId);
        if (typeof callback === 'function') {
            if (lobby) {
                callback({
                    status: 'ok',
                    data: {
                        name: lobby.name,
                        password: lobby.password,
                        hostId: lobby.hostId,
                        hostNickname: lobby.hostNickname,
                        joiners: Object.fromEntries(lobby.joiners.entries()),
                        maxPlayers: lobby.maxPlayers,
                    }
                });
            } else {
                callback({ status: 'error', message: 'Lobby not found' });
            }
        }
    });

    socket.on('lobby.create', async (payload: any, callback: (response: any) => void) => {
        if (players.get(playerId)) {
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Player is already in a lobby' });
            }
            return;
        }

        const { name, password } = payload;
        const lobbyId = uuidv4();
        const nickname = (await getUser(playerId)).nickname; // TODO: Store nickname as playerId is stored?
        const lobby: Lobby = {
            name,
            password: password || null,
            hostId: playerId,
            hostNickname: nickname,
            joiners: new Map(),
            maxPlayers: 8
        };

        lobbies.set(lobbyId, lobby);
        players.set(playerId, lobbyId);
        socket.join(`lobby_${lobbyId}`);

        // Notificar que hay nueva sala disponible a /topic/lobbies (todos los conectados)
        io.emit('lobbies.event', {
            type: 'ADDED',
            payload: {
                id: lobbyId,
                name,
                hasPassword: !!password,
                playerCount: 1,
                maxPlayers: 8,
            }
        });

        if (typeof callback === 'function') {
            callback({ status: 'ok', data: lobbyId }); // SendToUser equivalent
        }
    });

    socket.on('lobby.join', async (payload: any, callback: (response: any) => void) => {
        if (players.get(playerId)) {
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Player is already in a lobby' });
            }
            return;
        }

        const { lobbyId, password } = payload;
        const lobby = lobbies.get(lobbyId);
        if (lobby == null) {
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Lobby not found' });
            }
            return;
        }

        if (lobby.password && lobby.password !== password) {
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Invalid password' });
            }
            return;
        }

        const player: Player = {
            isReady: false,
            nickname: (await getUser(playerId)).nickname, // TODO: Store nickname as playerId is stored?
        };
        lobby.joiners.set(playerId, player);
        players.set(playerId, lobbyId);
        socket.join(`lobby_${lobbyId}`);
        console.log(`Player ${playerId} joined lobby ${lobbyId}`);
        io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
            type: 'PLAYER_JOINED',
            payload: { id: playerId, nickname: player.nickname }
        });
        io.emit('lobbies.event', {
            type: 'CHANGED',
            payload: {
                lobbyId: lobbyId,
                size: lobby.joiners.size + 1
            }
        });

        if (typeof callback === 'function') {
            callback({ status: 'ok' });
        }
    });

    function handleLeave() {
        const lobbyId = players.get(playerId);
        if (!lobbyId) {
            return { status: 'error', message: 'Player is not in a lobby' };
        }

        players.delete(playerId);
        const lobby: Lobby | undefined = lobbies.get(lobbyId)!;
        socket.leave(`lobby_${lobbyId}`);

        if (lobby.hostId === playerId) {
            const entry = lobby.joiners.entries().next().value;
            if (!entry) {
                lobbies.delete(lobbyId);
                io.emit('lobbies.event', {
                    type: 'CHANGED',
                    payload: {
                        lobbyId,
                        size: 0,
                    }
                });
            } else {
                const newHostId = entry[0];
                const newHostData = entry[1];

                lobby.hostId = newHostId;
                lobby.hostNickname = newHostData.nickname;
                lobby.joiners.delete(newHostId);
                io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                    type: 'PLAYER_LEFT',
                    payload: { id: newHostId, hostReplacement: true },
                });
                io.emit('lobbies.event', {
                    type: 'CHANGED',
                    payload: {
                        lobbyId,
                        size: lobby.joiners.size + 1,
                    }
                });
            }
        } else {
            lobby.joiners.delete(playerId);
            io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
                type: 'PLAYER_LEFT',
                payload: { id: playerId, hostReplacement: false },
            });
            io.emit('lobbies.event', {
                type: 'CHANGED',
                payload: {
                    lobbyId,
                    size: lobby.joiners.size + 1,
                }
            });
        }
        return { status: 'ok' };
    };

    socket.on('lobby.leave', async (_: any, callback: (response: any) => void) => {
        const out = handleLeave();

        if (typeof callback === 'function') {
            callback(out);
        }
    });

    socket.on('disconnect', () => {
        handleLeave();
    });

    socket.on('lobby.ready', (payload: any, callback: (response: any) => void) => {

        const lobbyId = players.get(playerId);
        if (!lobbyId) {
            if (typeof callback === 'function') {
                callback({ status: 'error', message: 'Player is not in a lobby' });
            }
            return;
        }

        const { isReady } = payload;
        lobbies.get(lobbyId)!.joiners.get(playerId)!.isReady = isReady;

        // Informar a todos en la lobby
        io.to(`lobby_${lobbyId}`).emit(`lobby.${lobbyId}.event`, {
            type: 'PLAYER_READY',
            payload: { id: playerId, isReady }
        });

        if (typeof callback === 'function') callback({ status: 'ok' });
    });

    // Equivalente a @MessageMapping("/lobby.start")
    socket.on('lobby.start', (_: any, callback: (response: any) => void) => {
        // TODO! Initialize game.
        if (typeof callback === 'function') {
            callback({ status: 'ok' });
        }
    });
};
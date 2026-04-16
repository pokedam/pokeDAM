const { v4: uuidv4 } = require('uuid');
const { User } = require('../config/Database');

class LobbyService {
    constructor() {
        this.lobbies = new Map();
        this.playerRooms = new Map();
    }

    async getPlayerNickname(playerId) {
        const user = await User.findByPk(playerId) ?? await User.create({ 
            nickname: `Trainer${String(playerId).padStart(4, '0')}`,
            refreshToken: uuidv4(),
        });
        return user.nickname;
    }

    async create(playerId, name, password) {
        // Si ya está en una sala antes, lo sacamos
        this.leave(playerId);

        const roomId = uuidv4();
        // Al crear ya deberíamos tener el name desde el UserDB para no hacer query síncrona aquí si se puede evitar
        const nickname = await this.getPlayerNickname(playerId);

        const lobby = {
            name,
            password: password || null,
            hostId: playerId,
            hostNickname: nickname,
            state: 'WAITING',
            joiners: new Map(), // playerId -> { isReady, nickname }
            maxPlayers: 8
        };

        this.lobbies.set(roomId, lobby);
        this.playerRooms.set(playerId, roomId);

        return { key: roomId, value: lobby };
    }

    async join(lobbyId, playerId, passwordInput) {
        const lobby = this.lobbies.get(lobbyId);

        if (lobby) {
            if (lobby.password && lobby.password !== passwordInput) {
                return null;
            }

            const nickname = await this.getPlayerNickname(playerId);

            const player = {
                isReady: false,
                nickname: nickname
            };

            lobby.joiners.set(playerId, player);
            this.playerRooms.set(playerId, lobbyId);

            return { lobby, joiner: player };
        }
        return null;
    }

    setReady(playerId, isReady) {
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            const room = this.lobbies.get(roomId);
            if (room) {
                const player = room.joiners.get(playerId);
                if (player) {
                    player.isReady = isReady;
                }
                return { key: roomId, value: room };
            }
        }
        return null;
    }

    startGame(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (roomId) {
            const room = this.lobbies.get(roomId);

            // Revisa que sea el host
            if (room && room.hostId === playerId) {
                const allReadyStates = Array.from(room.joiners.values());
                // Ejemplo: al menos 1 joiner (2 en total) y todos ready
                if (allReadyStates.length > 0 && allReadyStates.every(player => player.isReady)) {
                    room.state = 'IN_GAME';
                    return { key: roomId, value: room };
                }
            }
        }
        return null;
    }

    leave(playerId) {
        const roomId = this.playerRooms.get(playerId);
        if (!roomId) return null;

        this.playerRooms.delete(playerId);
        const room = this.lobbies.get(roomId);

        if (room.hostId === playerId) {
            if (room.joiners.size === 0) {
                this.lobbies.delete(roomId);
                return { lobbyId: roomId, lobby: null };
            } else {
                // Nuevo host al azar del primer elemento
                const firstEntry = room.joiners.entries().next().value;
                const newHostId = firstEntry[0];
                const newHostData = firstEntry[1];

                room.hostId = newHostId;
                room.hostNickname = newHostData.nickname;
                room.joiners.delete(newHostId);

                return { lobbyId: roomId, lobby: room, hostReplacement: true };
            }
        } else {
            const removed = room.joiners.delete(playerId);
            if (!removed) return null;

            return { lobbyId: roomId, lobby: room };
        }
    }

    getAll() {
        const all = [];
        for (const [id, lobby] of this.lobbies.entries()) {
            all.push({
                id,
                name: lobby.name,
                hasPassword: !!lobby.password,
                playerCount: lobby.joiners.size + 1,
                maxPlayers: lobby.maxPlayers
            });
        }
        return all;
    }

    get(roomId) {
        const lobby = this.lobbies.get(roomId);
        if (!lobby) return null;

        // Convertir el Map de joiners a object literal para el JSON
        const joinersObj = {};
        for (const [pid, player] of lobby.joiners.entries()) {
            joinersObj[pid] = player;
        }

        return {
            name: lobby.name,
            state: lobby.state,
            hostId: lobby.hostId,
            hostNickname: lobby.hostNickname,
            maxPlayers: lobby.maxPlayers,
            joiners: joinersObj
        };
    }
}

// Exportamos una única instancia (Singleton pattern, como el @Service de Spring)
module.exports = new LobbyService();

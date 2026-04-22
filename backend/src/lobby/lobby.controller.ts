import { Server, Socket } from 'socket.io';
import { result, type Result } from '../result.js';
import { inLobbyEventFactory, type LobbyCreatedResponse, type LobbyCreationRequest, type LobbyJoinRequest, type LobbyResponse, type LobbySummaryResponse } from './lobby.models.js';
import { lobbyService } from './lobby.service.js';

type Callback<T> = (response: Result<T>) => void;

export function lobbyController(io: Server, userId: number, socket: Socket): void {
    socket.on('lobbies.get', (lobbyId: string, callback: Callback<LobbyResponse>) => {
        callback(lobbyService.get(lobbyId));
    });

    socket.on('lobbies.getAll', (callback: Callback<LobbySummaryResponse[]>) => {
        callback(result.ok(lobbyService.getAll()));
    });

    socket.on('lobby.create', async (req: LobbyCreationRequest, callback: Callback<LobbyCreatedResponse>) => {
        const res = await lobbyService.create(userId, req);
        res.onData((res) => {
            // Subscribimnos al usuario a la socket io room del lobby.
            socket.join(`lobby_${res.id}`);
            // Emitimos un evento para notificar que la sala ha sido creada.
            socket.emit('lobby.created', {
                id: res.id,
                playerCount: 1,
            });
        });
        callback(res);
    });

    socket.on('lobby.join', async (req: LobbyJoinRequest, callback: Callback<void>) => {
        const res = await lobbyService.join(userId, req);
        res.onData((res) => {
            const lobbyRoom = `lobby_${req.id}`;
            io.to(lobbyRoom).emit(`lobby.${req.id}.event`, inLobbyEventFactory.joined(userId, res.nickname));
            io.emit('lobbies.event', {
                id: req.id,
                playerCount: res.playerCount,
            });
            socket.join(lobbyRoom);
        })
    });

    socket.on('lobby.leave', async (callback: Callback<void>) => {
        const res = await lobbyService.leave(userId);
        res.onData((res) => {
            if ('newHostId' in res) {
                
            } else{
                
            }
        });
    });
}
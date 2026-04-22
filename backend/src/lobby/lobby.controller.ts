import { Server, Socket } from 'socket.io';
import { lobbyService } from './index.js';
import { result, type Result } from '../result.js';
import type { GetResponse } from './lobby.get.js';
import type { GetAllResponse } from './lobby.get-all.js';
import type { LobbyCreatedResponse, LobbyCreationRequest } from './lobby.create.js';

type Callback<T> = (response: Result<T>) => void;

export function lobbyController(io: Server, userId: number, socket: Socket): void {
    socket.on('lobbies.get', (lobbyId: string, callback: Callback<GetResponse>) => {
        let res = lobbyService.get(lobbyId);
        callback(res != null ? result.ok(res) : result.notFound("Lobby with ID " + lobbyId + " not found"));
    });

    socket.on('lobbies.getAll', (callback: Callback<GetAllResponse[]>) => {
        callback(result.ok(lobbyService.getAll()));
    });

    socket.on('lobby.create', async (req: LobbyCreationRequest, callback: Callback<LobbyCreatedResponse>) => {
        const res = await lobbyService.create(userId, req);
        let data = res.data();
        if (data) 
    });
}
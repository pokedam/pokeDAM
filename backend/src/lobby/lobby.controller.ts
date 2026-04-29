import { Server, Socket } from 'socket.io';
import { result, type Result, lobbyFactory } from 'shared_types';
import type {
    LobbyCreatedResponse,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    LobbySummaryResponse
} from 'shared_types';
import { lobbyService } from './lobby.service.js';
import type { LeftResponse } from './lobby.models.js';


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
        if (res.success) {
            const lobbyRoom = `lobby_${res.content.id}`;
            // Subscribimnos al usuario a la socket io room del lobby.
            // Emitimos un evento para notificar que la sala ha sido creada.
            io.emit('lobbies.event', lobbyFactory.createdEvent(res.content));
            socket.join(lobbyRoom);
        }
        callback(res);
    });

    socket.on('lobby.join', async (req: LobbyJoinRequest, callback: Callback<void>) => {
        const res = await lobbyService.join(userId, req);
        if (res.success) {
            const lobbyRoom = `lobby_${req.id}`;
            io.to(lobbyRoom).emit(`lobby.${req.id}.event`, lobbyFactory.joinedEvent(userId, res.content.nickname));
            io.emit('lobbies.event', lobbyFactory.changedEvent(req.id, res.content.playerCount));
            socket.join(lobbyRoom);
        }
        callback(res.map((_) => { }));
    });

    socket.on('lobby.ready', async (isReady: boolean, callback: Callback<void>) => {
        let res = lobbyService.isReady(userId, isReady);
        if (res.success) io.to(`lobby_${res.content}`).emit(`lobby.${res.content}.event`, lobbyFactory.readyEvent(userId, isReady));
        callback(res.map((_) => { }));
    });

    socket.on('lobby.kick', async (targetId: number, callback: Callback<void>) => {
        let res = lobbyService.kick(targetId, userId);
        if (res.success) {
            handleLeaveEvents(io, res.content, targetId);
            const lobbyRoom = `lobby_${res.content.lobbyId}`;
            (await io.in(lobbyRoom).fetchSockets()).find((s: any) => (s as any).userId === targetId)?.leave(lobbyRoom);
        }
        callback(res.map((_) => { }));
    });

    socket.on('lobby.leave', (callback: Callback<void>) => {
        callback(handleLeave());
    });

    socket.on('disconnect', handleLeave);

    function handleLeaveEvents(io: Server, res: LeftResponse, leavingUserId: number) {
        const lobbyRoom = `lobby_${res.lobbyId}`;
        switch (res.type) {
            case 'joiner':
                io.to(lobbyRoom).emit(`lobby.${res.lobbyId}.event`, lobbyFactory.leftEvent(leavingUserId));
                break;
            case 'host':
                io.to(lobbyRoom).emit(`lobby.${res.lobbyId}.event`, lobbyFactory.hostLeftEvent(res.newHostId));
                break;
        }
        io.emit('lobbies.event', lobbyFactory.changedEvent(res.lobbyId, res.playerCount));
    }

    function handleLeave(): Result<void> {
        const res = lobbyService.leave(userId);
        if (res.success) {
            handleLeaveEvents(io, res.content, userId);
            socket.leave(`lobby_${res.content.lobbyId}`);
        }

        return res.map((_) => { });
    }
}


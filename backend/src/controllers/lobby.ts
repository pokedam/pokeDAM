import { Server, Socket } from 'socket.io';
import { result, type Result, lobbyFactory } from 'shared_types';
import type {
    GroupId,
    GroupResponse,
    LobbyCreatedResponse,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    PlayerId,
    StartGameEvent
} from 'shared_types';
import { lobbyService, type LeftResponse } from '../services/lobby.js';
import { gameService } from '../services/game.js';

type Callback<T> = (response: Result<T>) => void;

export function lobbyController(io: Server, userId: PlayerId, socket: Socket): void {
    socket.on('lobbies.get', (lobbyId: GroupId, callback: Callback<LobbyResponse>) =>
        callback(lobbyService.get(lobbyId))
    );

    socket.on('lobbies.getAll', (callback: Callback<GroupResponse>) =>
        callback(result.ok(lobbyService.getAll(userId)))
    );

    socket.on('lobby.create', async (req: LobbyCreationRequest, callback: Callback<LobbyCreatedResponse>) => {
        try {
            const res = await lobbyService.create(userId, req);
            const lobbyRoom = `lobby_${res.id}`;
            // Subscribimnos al usuario a la socket io room del lobby.
            // Emitimos un evento para notificar que la sala ha sido creada.
            io.emit('lobbies.event', lobbyFactory.createdEvent(res));
            socket.join(lobbyRoom);
            callback(result.ok(res))
        } catch (err: any) {
            callback(result.err(err));
        }

    });

    socket.on('lobby.join', async (req: LobbyJoinRequest, callback: Callback<void>) => {
        try {
            const res = await lobbyService.join(userId, req);
            const lobbyRoom = `lobby_${req.id}`;
            io.to(lobbyRoom).emit(`lobby.${req.id}.event`, lobbyFactory.joinedEvent(userId, res.nickname));
            io.emit('lobbies.event', lobbyFactory.changedEvent(req.id, res.playerCount));
            socket.join(lobbyRoom);
            callback(result.ok(undefined));
        } catch (err: any) {
            callback(result.err(err));
        }
    });

    socket.on('lobby.ready', async (isReady: boolean, callback: Callback<void>) => {
        let res = lobbyService.isReady(userId, isReady);
        try {
            io.to(`lobby_${res}`).emit(`lobby.${res}.event`, lobbyFactory.readyEvent(userId, isReady));
            callback(result.ok(undefined));
        } catch (err: any) {
            callback(result.err(err));
        }

    });

    socket.on('lobby.kick', async (targetId: number, callback: Callback<void>) => {
        let res = lobbyService.kick(targetId, userId);
        try {
            handleLeaveEvents(io, res, targetId);
            const lobbyRoom = `lobby_${res.lobbyId}`;
            (await io.in(lobbyRoom).fetchSockets()).find((s: any) => (s as any).userId === targetId)?.leave(lobbyRoom);
            callback(result.ok(undefined));
        } catch (err: any) {
            callback(result.err(err));
        }
    });

    socket.on('lobby.leave', (callback: Callback<void>) => {
        try {

            handleLeave();
        } catch (err: any) {
            callback(result.err(err));
        }

    });

    socket.on('lobby.start', async (callback: Callback<void>) => {
        console.log("Game Start requested");
        try {
            const [id, board] = await gameService.create(userId);
            console.log("Game Start Completed");
            const event: StartGameEvent = {
                type: 'start',
                board,
            };
            io.to(`lobby_${id}`).emit(`lobby.${id}.event`, event);
            callback(result.ok(undefined));
        } catch (err: any) {

            console.log("Game Start Failed:", err);
            if (err instanceof Error)
                callback(result.badRequest(err.message));
            else callback(result.internal('Internal server error'));
        }
    });

    socket.on('disconnect', () => {
        try {
            handleLeave();
        } catch (err: any) {
            console.log("Error handling disconnect:", err);
        }
    });

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

    function handleLeave(): void {
        const res = lobbyService.leave(userId);
        handleLeaveEvents(io, res, userId);
        socket.leave(`lobby_${res.lobbyId}`);
    }
}


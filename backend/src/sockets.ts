import { Server, Socket } from 'socket.io';
import { result, type Result, lobbyFactory } from 'shared_types';
import type {
    GameRequest,
    GroupId,
    GroupResponse,
    LobbyCreatedResponse,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    PlayerId,
    StartGameEvent
} from 'shared_types';
import * as lobby from './services/lobby.js';
import * as game from './services/game.js';
import { db } from './db/client.js';
import { welcome } from './services/store.js';
import type { LeftResponse } from './services/lobby.js';

type Callback<T> = (response: Result<T>) => void;

export function socketsController(io: Server, userId: PlayerId, socket: Socket): void {
    socket.on('lobbies.get', (lobbyId: GroupId, callback: Callback<LobbyResponse>) =>
        callback(lobby.get(lobbyId))
    );

    socket.on('lobbies.getAll', (callback: Callback<GroupResponse>) =>
        callback(result.ok(welcome(userId)))
    );

    socket.on('lobby.create', async (req: LobbyCreationRequest, callback: Callback<LobbyCreatedResponse>) => {
        try {
            const nickname = (await db.user.get(userId)).nickname;
            const res = lobby.create(userId, nickname, req);
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

    socket.on('lobby.join', async (req: LobbyJoinRequest, callback: Callback<LobbyResponse>) => {
        try {
            let nickname = (await db.user.get(userId)).nickname;
            const res = await lobby.join(userId, nickname, req);
            const lobbyRoom = `lobby_${req.id}`;
            io.to(lobbyRoom).emit(`lobby.${req.id}.event`, lobbyFactory.joinedEvent(userId, nickname));
            io.emit('lobbies.event', lobbyFactory.changedEvent(req.id, res.joiners.length + 1)); // +1 host
            socket.join(lobbyRoom);
            callback(result.ok(res));
        } catch (err: any) {
            callback(result.err(err));
        }
    });

    socket.on('lobby.ready', async (isReady: boolean, callback: Callback<void>) => {
        let res = lobby.isReady(userId, isReady);
        try {
            io.to(`lobby_${res}`).emit(`lobby.${res}.event`, lobbyFactory.readyEvent(userId, isReady));
            callback(result.ok(undefined));
        } catch (err: any) {
            callback(result.err(err));
        }

    });

    socket.on('lobby.kick', async (targetId: number, callback: Callback<void>) => {
        let res = lobby.kick(targetId, userId);
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
            const [id, board] = await game.create(userId);
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

    socket.on('lobby.play', (request: GameRequest, callback: Callback<void>) => {
        try {
            const history = game.play(userId, request);
            if (history) {
                //TODO: Emit 
            }

        } catch (e) {
            if (e instanceof Error) {
                callback(result.badRequest(e.message));
            } else {
                callback(result.internal('Internal server error'));
            }
        }

        callback(result.ok(undefined));
    });

    socket.on('disconnect', () => {
        try {
            // Tries to leave from any lobby. 
            // Conflict errors generated because player is not in a lobby will be ignored.
            // If the player is in a game, the player will remain until the game ends.
            handleLeave();
        } catch (err: any) {
            if (err.status != 409) throw err;
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
        const res = lobby.leave(userId);
        handleLeaveEvents(io, res, userId);
        socket.leave(`lobby_${res.lobbyId}`);
    }
}


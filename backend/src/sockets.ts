import { Server, Socket } from 'socket.io';
import { result, type Result, lobbyFactory } from 'shared_types';
import type {
    PlayRequest,
    GroupId,
    WelcomeResponse,
    LobbyCreatedResponse,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    PlayerId,
    StartGameEvent,
    TurnCompletedEvent,
} from 'shared_types';
import * as lobbies from './services/lobby.js';
import * as games from './services/game.js';
import { db } from './db/client.js';
import * as store from './services/store.js';
import type { LeftResponse } from './services/lobby.js';
import FastPriorityQueue from 'fastpriorityqueue';

type Callback<T> = (response: Result<T>) => void;

interface Timeout {
    id: GroupId;
    turn: number;
    time: number;
}

const TURN_INTERVAL_MS = 61_000; //one sec as grace period

const heap = new FastPriorityQueue<Timeout>((a, b) => a.time < b.time);
let schedulerTimer: NodeJS.Timeout | null = null;

export function socketsController(io: Server, userId: PlayerId, socket: Socket): void {

    function processTimeouts() {
        if (schedulerTimer) clearTimeout(schedulerTimer);
        const next = heap.peek();
        schedulerTimer = next ? setTimeout(() => {
            schedulerTimer = null;
            let trigger: Timeout | undefined;
            while ((trigger = heap.peek()) && trigger.time <= Date.now()) {
                heap.poll();

                const game = store.games.get(trigger.id);

                if (!game || game.turn !== trigger.turn) {
                    // Skip, this turn trigger was completed before timeout 
                    // and another trigger is already queued
                    continue;
                }

                const res = games.processTurn(game, trigger.id);

                handleTurnResult(io, res);

            }
            processTimeouts();

        }, Math.max(0, next.time - Date.now())) : null;
    }

    socket.on('lobbies.get', (lobbyId: GroupId, callback: Callback<LobbyResponse>) =>
        callback(lobbies.get(lobbyId))
    );

    socket.on('lobbies.getAll', (callback: Callback<WelcomeResponse>) => {
        const welcome = store.welcome(userId);

        // If the player is in an active game, re-join the socket room
        // so they receive turn events after reconnecting.

        if (welcome.game) {
            const groupId = store.groups.id(userId);
            if (groupId) {
                console.log(`[getAll] Re-joining socket ${socket.id} for user ${userId} to room lobby_${groupId}`);
                socket.join(`lobby_${groupId}`);
                console.log(`[getAll] Socket rooms:`, Array.from(socket.rooms));
            } else {
                console.log(`[getAll] User ${userId} has game but no groupId mapping!`);
            }
        } else {
            console.log(`[getAll] User ${userId} has no active game`);
        }

        callback(result.ok(welcome));
    });

    socket.on('lobby.create', async (req: LobbyCreationRequest, callback: Callback<LobbyCreatedResponse>) => {
        try {
            const nickname = (await db.user.get(userId)).nickname;
            const res = lobbies.create({ id: userId, nickname }, req);
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
            const res = await lobbies.join(userId, nickname, req);
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
        let res = lobbies.isReady(userId, isReady);
        try {
            io.to(`lobby_${res}`).emit(`lobby.${res}.event`, lobbyFactory.readyEvent(userId, isReady));
            callback(result.ok(undefined));
        } catch (err: any) {
            callback(result.err(err));
        }

    });

    socket.on('lobby.kick', async (targetId: number, callback: Callback<void>) => {
        let res = lobbies.kick(targetId, userId);
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
            const game = await games.create(userId);
            heap.add({
                id: game.id,
                time: Date.now() + TURN_INTERVAL_MS,
                turn: 0,
            });
            processTimeouts();
            const event: StartGameEvent = {
                type: 'start',
                board: game.board,
            };
            io.emit('lobbies.event', lobbyFactory.changedEvent(game.id, 0));
            io.to(`lobby_${game.id}`).emit(`lobby.${game.id}.event`, event);
            callback(result.ok(undefined));
        } catch (err: any) {

            console.log("Game Start Failed:", err);
            if (err instanceof Error)
                callback(result.badRequest(err.message));
            else callback(result.internal('Internal server error'));
        }
    });

    socket.on('lobby.play', (request: PlayRequest, callback: Callback<void>) => {
        const res = games.play(userId, request);
        if (res) {
            handleTurnResult(io, res);
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
        const res = lobbies.leave(userId);
        handleLeaveEvents(io, res, userId);
        socket.leave(`lobby_${res.lobbyId}`);
    }
}

function handleTurnResult(io: Server, res: games.TurnResult) {
    const roomId = `lobby_${res.groupId}`;
    const event: TurnCompletedEvent = {
        type: 'turn',
        history: res.history,
        gameEnd: res.gameEnd,
    };

    io.to(roomId).emit(`lobby.${res.groupId}.event`, event);

    if (res.gameEnd) {
        store.games.delete(res.groupId);
        io.socketsLeave(roomId);

        for (const p of res.game.board.keys())
            store.players.delete(p);


        db.games.save({
            initialGame: Array.from(res.game.board.entries()).map(([id, player]) => ({ id, ...player.start })),
            history: res.game.history,
            end: res.gameEnd,
        });
    } else heap.add({
        id: res.groupId,
        time: Date.now() + TURN_INTERVAL_MS,
        turn: res.game.turn,
    });
}

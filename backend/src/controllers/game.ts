import { Server, Socket } from 'socket.io';
import { result, type Result, type GameRequest } from 'shared_types';
import { gameRequest } from '../services/game.js';

type Callback<T> = (response: Result<T>) => void;

export function gameController(io: Server, userId: number, socket: Socket): void {
    socket.on('play', (request: GameRequest, callback: Callback<void>) => {
        try {
            gameRequest(userId, request);
        } catch (e) {
            if (e instanceof Error) {
                callback(result.badRequest(e.message));
            } else {
                callback(result.internal('Internal server error'));
            }
        }

        callback(result.ok(undefined));
    });
}


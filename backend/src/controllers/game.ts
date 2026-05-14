import { Server, Socket } from 'socket.io';
import { result, type Result, type GameRequest } from 'shared_types';

type Callback<T> = (response: Result<T>) => void;

export function gameController(io: Server, userId: number, socket: Socket): void {

}
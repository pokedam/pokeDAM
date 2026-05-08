import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Result } from "shared_types/dist/result";
import { io, Socket } from "socket.io-client";
import { ErrorService } from "./error.service";

@Injectable({ providedIn: 'root' })
export class SocketService {
    private socket: Socket | null = null;
    private currentToken: string | null = null;

    // Se inicializa desde fuera, no reacciona él solo.
    public connect(token: string): Observable<void> {
        return new Observable(observer => {
            if (this.socket?.connected && this.currentToken === token) {
                observer.next(undefined);
                observer.complete();
                return;
            }

            if (this.socket) {
                this.socket.disconnect();
            }

            this.currentToken = token;

            this.socket = io('http://localhost:8080', {
                auth: { token },
                reconnectionDelay: 5000,
            });

            this.socket.on('connect', () => {
                observer.next(undefined);
                observer.complete();
            });

            this.socket.on('connect_error', (err) => {
                this.currentToken = null;
                this.socket?.disconnect();
                this.socket = null;
                observer.error(err);
                observer.complete();
            });

            this.socket.on('disconnect', () => {
                this.currentToken = null;
            });
        });
    }

    public disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
        this.currentToken = null;
        //this.connectedSubject.next(false);
    }

    public isConnectedWithToken(token: string): boolean {
        return this.socket?.connected === true && this.currentToken === token;
    }

    // Abstracción para enviar mensajes estilo Promesa/Observable
    public emitMessage<T, R>(event: string, payload?: T): Observable<R> {
        return new Observable(observer => {
            if (!this.socket || !this.socket.connected) {
                observer.error('Socket not connected');
                observer.complete();
                return;
            }

            this.socket.emit(event, payload, (response: Result<R>) => {
                if (response.success) observer.next(response.content);
                else observer.error(response);

                observer.complete();
            });
        });
    }

    // Abstracción para escuchar canales de stream
    public listenEvent<T>(event: string): Observable<T> {
        return new Observable((observer) => {
            const socket = this.socket;
            if (!socket || !socket.connected) {
                observer.error('Socket not connected');
                observer.complete();
                return;
            }

            const listener = (data: T) => {
                observer.next(data);
            };

            socket.on(event, listener);
            return () => socket.off(event, listener); // Se limpia al hacer unsubscribe
        });
    }
} 
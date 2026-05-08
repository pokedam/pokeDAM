import { inject, Injectable, signal } from "@angular/core";
import { SocketService } from "./socket.service";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Subscription } from "rxjs/internal/Subscription";
import { InLobbyEvent, LobbyCreatedResponse, LobbyCreationRequest, lobbyFactory, LobbyJoinRequest, PlayerJoinedEvent, PlayerLeftEvent, PlayerReadyEvent } from "shared_types/dist/lobby";

export interface Lobby {
    id: string,
    name: string;
    hostId: number;
    hostNickname: string;
    joiners: Map<number, Joiner>;
    maxPlayers: number;
}

export interface Joiner {
    nickname: string;
    isReady: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrentLobbyService {
    private _socket = inject(SocketService);
    private _auth = inject(AuthService); // Solo para revisar mi ID
    private _lobby = signal<Lobby | null>(null, { equal: (_, __) => false });
    private _sub?: Subscription;

    lobby = this._lobby.asReadonly();

    // Utilizar envoltorios del socket limpios
    create(name: string, password: string | null): Observable<LobbyCreatedResponse> {
        return this._socket.emitMessage<LobbyCreationRequest, LobbyCreatedResponse>('lobby.create', { name, password })
            .pipe(
                tap((res) => this.setupSubscriptions(res.id))
            );
    }

    join(lobbyId: string, password?: string): Observable<void> {
        return this._socket.emitMessage<LobbyJoinRequest, void>('lobby.join', {
            id: lobbyId,
            password,
        }).pipe(
            tap((_) => this.setupSubscriptions(lobbyId))
        );
    }

    leave(): Observable<void> {
        return this._socket.emitMessage<void, void>('lobby.leave')
            .pipe(
                tap((_) => {
                    // Limpiamos el store local (Signal o BehaviorSubject)
                    this._lobby.set(null);
                    // Cerramos la suscripción activa a los eventos del lobby actual
                    if (this._sub) {
                        this._sub.unsubscribe();
                        this._sub = undefined;
                    }
                })
            );
    }

    setReady(isReady: boolean): Observable<void> {
        return this._socket.emitMessage<boolean, void>('lobby.ready', isReady);
    }

    kick(targetId: number): Observable<void> {
        return this._socket.emitMessage<number, void>('lobby.kick', targetId);
    }


    startGame() {
        //TODO: Initialize game when game system exists.
    }

    private setupSubscriptions(lobbyId: string) {
        if (this._sub) this._sub.unsubscribe();

        // Al manejar en RxJS puedes utilizar operadores (tap, map, filter, etc.)
        this._sub = this._socket.listenEvent<InLobbyEvent>(`lobby.${lobbyId}.event`)
            .subscribe(event => {
                // Dejarás de reasignar y clonar el state completo manualmente
                this.handleLobbyEvent(event);
            });
    }

    private handleLobbyEvent(event: InLobbyEvent) {
        this._lobby.update(lobby => {
            if (!lobby) return null;

            switch (event.type) {
                case 'joined':
                    lobby.joiners.set(event.id, {
                        nickname: event.nickname,
                        isReady: false
                    });
                    break;
                case 'left':
                    lobby.joiners.delete(event.id);
                    if (event.id === this._auth.auth()!.user.id) return null;
                    break;
                case 'host left':
                    if (event.newHostId) {
                        const leftId = lobby.hostId;
                        lobby.hostId = event.newHostId;
                        lobby.hostNickname = lobby.joiners.get(event.newHostId)!.nickname;
                        lobby.joiners.delete(event.newHostId);
                        if (leftId === this._auth.auth()!.user.id) return null;
                    } else {
                        return null;
                    }
                    break;
                case 'ready':
                    lobby.joiners.get(event.id)!.isReady = event.isReady;
                    break;
            }

            return lobby;
        });
    }


}
import { Injectable, inject, signal } from '@angular/core';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { InGamePokemon, InLobbyEvent, LobbyCreatedResponse, LobbyCreationRequest, LobbyJoinRequest, LobbyResponse, PlayerId, PlayerResponse } from 'shared_types';
import { map, Observable, switchMap, tap } from 'rxjs';

export interface Lobby {
    id: string,
    name: string;
    hostId: PlayerId;
    hostNickname: string;
    joiners: Map<PlayerId, Joiner>;
    maxPlayers: number;
}

export interface Player {
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export interface Game {
    id: string,
    board: Map<PlayerId, Player>,
}

export interface Joiner {
    nickname: string;
    isReady: boolean;
}

@Injectable({ providedIn: 'root' })
export class CurrentLobbyService {
    private auth = inject(AuthService);
    private socket = inject(SocketService);

    private _lobby = signal<Lobby | null>(null, { equal: (_, __) => false });

    lobby = this._lobby.asReadonly();

    create(name: string, password: string | null): Observable<LobbyCreatedResponse> {
        return this.socket.emit<LobbyCreationRequest, LobbyCreatedResponse>('lobby.create', { name, password }).pipe(
            switchMap(res => this.setupSubscriptions(res.id).pipe(map(_ => res)))
        );
    }

    join(lobbyId: string, password?: string): Observable<void> {
        return this.socket.emit<LobbyJoinRequest, void>('lobby.join', { id: lobbyId, password, }).pipe(
            switchMap(_ => this.setupSubscriptions(lobbyId))
        );
    }

    private setupSubscriptions(lobbyId: string): Observable<void> {

        const lobby = this._lobby();
        if (lobby?.id) {
            this.socket.off(`lobby.${lobby.id}.event`);
        }

        this.socket.on(`lobby.${lobbyId}.event`, (event: InLobbyEvent) => {

            this._lobby.update(lobby => {
                if (!lobby) return lobby;
                switch (event.type) {

                    case 'joined':
                        lobby.joiners.set(event.id, {
                            nickname: event.nickname,
                            isReady: false
                        });
                        return lobby

                    case 'left':
                        lobby.joiners.delete(event.id);
                        return event.id == this.auth.auth()!.user.id ? null : lobby;

                    case 'host left':
                        if (event.newHostId) {
                            const leftId = lobby.hostId;
                            lobby.hostId = event.newHostId;
                            lobby.hostNickname = lobby.joiners.get(event.newHostId)!.nickname;
                            lobby.joiners.delete(event.newHostId);
                            return leftId == this.auth.auth()!.user.id ? null : lobby;
                        }
                        return null;

                    case 'ready':
                        lobby.joiners.get(event.id)!.isReady = event.isReady;
                        return lobby;
                    case 'start':
                        console.log("Game Started", event.board);
                        return lobby;
                    case 'turn':
                        console.log("Turn Completed");
                        return lobby;
                }

            });

        });

        return this.socket.emit<string, LobbyResponse>('lobbies.get', lobbyId).pipe(
            map(res => {
                const lobby: Lobby = {
                    id: lobbyId,
                    name: res.name,
                    hostId: res.hostId,
                    hostNickname: res.hostNickname,
                    joiners: new Map(
                        (res.joiners).map(item => [
                            item.id,
                            item,
                        ])
                    ),
                    maxPlayers: res.maxPlayers
                };
                this._lobby.set(lobby);
            }),
        );
    }

    leave(): Observable<void> {
        return this.socket.emit<void, void>('lobby.leave').pipe(
            tap(_ => {
                let id = this._lobby()?.id;
                if (id) this.socket.off(id);
            })
        );

    }

    setReady(isReady: boolean): Observable<void> {
        return this.socket.emit('lobby.ready', isReady);
        //this.socket.emit('lobby.ready', isReady, (res: Result<void>) => this.errorService.unwrap<void>(res));
    }

    kick(targetId: number) {
        return this.socket.emit('lobby.kick', targetId);
        //this.socket.emit('lobby.kick', targetId, (res: Result<void>) => this.errorService.unwrap<void>(res));
    }

    startGame() {
        return this.socket.emit<void, void>('lobby.start');
    }
}
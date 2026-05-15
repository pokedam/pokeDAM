import { Injectable, inject, signal } from '@angular/core';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { GameRequest, GameResponse, GroupId, InGamePokemon, InLobbyEvent, LobbyCreatedResponse, LobbyCreationRequest, LobbyJoinRequest, LobbyResponse, PlayerId, PlayerResponse, TurnHistory } from 'shared_types';
import { map, Observable, switchMap, tap } from 'rxjs';

export type Group = Lobby | Game;

export interface Lobby {
    type: 'lobby';
    id: string;
    name: string;
    hostId: PlayerId;
    hostNickname: string;
    joiners: Map<PlayerId, Joiner>;
    maxPlayers: number;
}

export interface Player {
    id: PlayerId;
    nickname: string;
    message: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export interface Game {
    type: 'game';
    id: string;
    board: Map<PlayerId, Player>;
}

export interface Joiner {
    nickname: string;
    isReady: boolean;
}

@Injectable({ providedIn: 'root' })
export class GroupService {
    private auth = inject(AuthService);
    private socket = inject(SocketService);

    private _group = signal<Group | null>(null, { equal: (_, __) => false });
    private _turn = signal<TurnHistory | null>(null);

    group = this._group.asReadonly();
    turn = this._turn.asReadonly();

    restoreGame(res: GameResponse) {
        this._group.set({
            type: 'game',
            id: res.id,
            board: new Map(res.board.map(p => [p.id, p])),
        });
    }

    asLobby(): Lobby {
        const group = this._group();
        if (group?.type === 'lobby') return group;
        throw new Error('Not in a lobby');
    }

    asGame(): Game {
        const group = this._group();
        if (group?.type === 'game') return group;
        throw new Error('Not in a game');
    }

    //Creates a new lobby and returns the lobby id
    create(name: string, password: string | null, message: string): Observable<Lobby> {

        // Since we need to subscribe ourself to the lobby room and we need to have an id to active the subscription
        // 1.- We create the lobby, which returns only the lobby id
        // 2.- We subscribe to the lobby changes using the id
        // 3.- We retrieve the lobby info to populate after being subscribed, avoiding data races
        return this.socket.emit<LobbyCreationRequest, Lobby>('lobby.create', { name, password, message }).pipe(
            switchMap(res => {
                this.subscribeToLobby(res.id);
                return this.getLobby(res.id).pipe(tap(lobby => this._group.set(lobby)));
            })
        );
    }

    join(lobbyId: string, message: string, password?: string,): Observable<Lobby> {
        this.subscribeToLobby(lobbyId);
        return this.socket.emit<LobbyJoinRequest, LobbyResponse>('lobby.join', { id: lobbyId, password, message}).pipe(
            map(data => {
                const lobby: Lobby = {
                    type: 'lobby',
                    id: lobbyId,
                    ...data,
                    joiners: new Map(data.joiners.map(item => [item.id, item])),
                };
                this._group.set(lobby);
                return lobby;
            })
        );
    }

    private getLobby(lobbyId: GroupId): Observable<Lobby> {
        return this.socket.emit<string, LobbyResponse>('lobbies.get', lobbyId).pipe(
            map(res => ({
                type: 'lobby',
                ...res,
                id: lobbyId,
                joiners: new Map(
                    (res.joiners).map(item => [
                        item.id,
                        item,
                    ])
                ),
            })),
        );
    }

    private subscribeToLobby(lobbyId: GroupId): void {
        const lobby = this._group();
        if (lobby?.id)
            this.socket.off(`lobby.${lobby.id}.event`);


        this.socket.on(`lobby.${lobbyId}.event`, (event: InLobbyEvent) => {
            switch (event.type) {
                case 'joined':
                    this._group.update(lobby => {
                        if (!lobby || lobby.type === 'game') return lobby;

                        lobby.joiners.set(event.id, {
                            nickname: event.nickname,
                            isReady: false
                        });
                        return lobby
                    });
                    break;

                case 'left':
                    this._group.update(lobby => {
                        if (!lobby || lobby.type === 'game') return lobby;

                        lobby.joiners.delete(event.id);
                        return event.id == this.auth.auth()!.user.id ? null : lobby;
                    });
                    break;
                case 'host left':
                    this._group.update(lobby => {
                        if (!lobby || lobby.type !== 'lobby') return lobby;
                        if (!event.newHostId) return null;

                        const leftId = lobby.hostId;
                        lobby.hostId = event.newHostId;
                        lobby.hostNickname = lobby.joiners.get(event.newHostId)!.nickname;
                        lobby.joiners.delete(event.newHostId);
                        return leftId == this.auth.auth()!.user.id ? null : lobby;
                    });
                    break;
                case 'ready':
                    this._group.update(lobby => {
                        if (!lobby || lobby.type === 'game') return lobby;

                        lobby.joiners.get(event.id)!.isReady = event.isReady;
                        return lobby;
                    });
                    break;
                case 'start':
                    for(const player of event.board.values()){
                        console.log("Player with message", player.message);
                    }
                    this._group.set({
                        type: 'game',
                        id: lobbyId,
                        board: new Map(event.board.map(p => [p.id, p])),
                    })
                    break;
                case 'turn':
                    this._turn.set(event.turn);
                    break;
            }
        });
    }

    leave(): Observable<void> {
        return this.socket.emit<void, void>('lobby.leave').pipe(
            tap(_ => {
                let id = this._group()?.id;
                if (id) this.socket.off(id);
            })
        );

    }

    setReady(isReady: boolean): Observable<void> {
        return this.socket.emit('lobby.ready', isReady);
        //this.socket.emit('lobby.ready', isReady, (res: Result<void>) => this.errorService.unwrap<void>(res));
    }


    play(request: GameRequest): Observable<void> {
        return this.socket.emit('lobby.play', request);
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
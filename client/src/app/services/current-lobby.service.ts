import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { InLobbyEvent, LobbyCreatedResponse, lobbyFactory, LobbyResponse, Result } from 'shared_types';
import { Socket } from 'socket.io-client';

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

    private auth = inject(AuthService);
    private socketService = inject(SocketService);
    private zone = inject(NgZone);
    private errorService = inject(ErrorService);

    private lobbySubject = new BehaviorSubject<Lobby | null>(null);
    lobby$ = this.lobbySubject.asObservable();

    get lobby(): Lobby | null {
        return this.lobbySubject.getValue();
    }

    get socket(): Socket {
        return this.socketService.socket()!;
    }

    private roomSubName: string | null = null;

    create(name: string, password: string | null) {
        
        this.socket.emit('lobby.create', lobbyFactory.create(name, password), (response: Result<LobbyCreatedResponse>) => {
            if (this.errorService.unwrap(response)) {
                this.zone.run(() => {
                    this.setupSubscriptions(response.content.id);
                });
            }
        });
    }

    join(lobbyId: string, password?: string) {
        this.socket.emit('lobby.join', lobbyFactory.join(lobbyId, password), (response: Result<void>) => {
            if (this.errorService.unwrap(response)) {
                this.zone.run(() => {
                    this.setupSubscriptions(lobbyId);
                });
            }
        });
    }

    private setupSubscriptions(lobbyId: string) {
        if (this.roomSubName) {
            this.socket.off(this.roomSubName);
        }

        this.roomSubName = `lobby.${lobbyId}.event`;

        this.socket.on(this.roomSubName, (event: InLobbyEvent) => {
            this.zone.run(() => {
                let lobby = this.lobby;
                switch (event.type) {

                    case 'joined':
                        if (lobby) {
                            lobby.joiners.set(event.id, {
                                nickname: event.nickname,
                                isReady: false
                            });
                            this.lobbySubject.next(lobby);
                        }

                        break;

                    case 'left':
                        if (lobby) {
                            lobby.joiners.delete(event.id);
                            this.lobbySubject.next(event.id == this.auth.auth()!.user.id ? null : lobby);
                        }
                        break;

                    case 'host left':
                        if (lobby) {
                            if (event.newHostId) {
                                const leftId = lobby.hostId;
                                lobby.hostId = event.newHostId;
                                lobby.hostNickname = lobby.joiners.get(event.newHostId)!.nickname;
                                lobby.joiners.delete(event.newHostId);
                                this.lobbySubject.next(leftId == this.auth.auth()!.user.id ? null : lobby);
                            }
                            else this.lobbySubject.next(null);
                        }
                        break;

                    case 'ready':
                        if (lobby) {
                            lobby.joiners.get(event.id)!.isReady = event.isReady;
                            this.lobbySubject.next(lobby);
                        }
                        break;


                }
            });
        });

        this.socket.emit('lobbies.get', lobbyId, (res: Result<LobbyResponse>) => {
            if (this.errorService.unwrap(res)) {
                const lobby: Lobby = {
                    id: lobbyId,
                    name: res.content.name,
                    hostId: res.content.hostId,
                    hostNickname: res.content.hostNickname,
                    joiners: new Map(
                        (res.content.joiners).map(item => [
                            item.id,
                            item,
                        ])
                    ),
                    maxPlayers: res.content.maxPlayers
                };
                lobby.id = lobbyId;
                this.zone.run(() => {
                    this.lobbySubject.next(lobby);
                });
            }

        });
    }

    leave() {
        this.socket.emit('lobby.leave', (res: Result<void>) => this.errorService.unwrap(res));

        if (this.roomSubName) {
            this.socket.off(this.roomSubName);
            this.roomSubName = null;
        }
        this.lobbySubject.next(null);
    }

    setReady(isReady: boolean) {
        this.socket.emit('lobby.ready', isReady, (res: Result<void>) => this.errorService.unwrap<void>(res));
    }

    kick(targetId: number) {
        this.socket.emit('lobby.kick', targetId, (res: Result<void>) => this.errorService.unwrap<void>(res));
    }

    startGame() {
        //TODO: Initialize game when game system exists.
    }
}
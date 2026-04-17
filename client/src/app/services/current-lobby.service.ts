import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbySocketClient } from './lobby-socket-client.service';
import { AuthService } from './auth.service';

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

export interface ServerEvent {
    type: string;
    payload: any;
}

@Injectable({ providedIn: 'root' })
export class CurrentLobbyService {

    private auth = inject(AuthService);
    private socketService = inject(LobbySocketClient);
    private zone = inject(NgZone);

    private lobbySubject = new BehaviorSubject<Lobby | null>(null);
    lobby$ = this.lobbySubject.asObservable();

    get lobby(): Lobby | null {
        return this.lobbySubject.getValue();
    }

    private roomSubName: string | null = null;

    create(name: string, password: string | null) {
        this.socketService.socket.emit('lobby.create', { name, password }, (response: any) => {
            if (response.status === 'ok') {
                const newLobbyId = response.data;
                this.zone.run(() => {
                    this.setupSubscriptions(newLobbyId);
                });
            }
        });
    }

    join(lobbyId: string, password?: string) {
        this.socketService.socket.emit('lobby.join', { lobbyId, password }, (response: any) => {
            if (response.status === 'ok') {
                this.zone.run(() => {
                    this.setupSubscriptions(lobbyId);
                });
            } else {
                alert('No se pudo unir a la sala: ' + response.message);
            }
        });
    }

    private setupSubscriptions(lobbyId: string) {
        if (this.roomSubName) {
            this.socketService.socket.off(this.roomSubName);
        }

        this.roomSubName = `lobby.${lobbyId}.event`;

        this.socketService.socket.on(this.roomSubName, (event: ServerEvent) => {
            this.zone.run(() => {
                let lobby = this.lobby;
                console.log("Received lobby event:", event);
                switch (event.type) {

                    case 'PLAYER_JOINED':
                        if (lobby) {
                            lobby.joiners.set(event.payload.id, {
                                nickname: event.payload.nickname,
                                isReady: false
                            });
                            this.lobbySubject.next(lobby);
                        }

                        break;

                    case 'PLAYER_LEFT':
                        if (lobby) {
                            let leftId: number;
                            if (event.payload.hostReplacement) {
                                let newHost = lobby.joiners.get(event.payload.id)!;
                                leftId = lobby.hostId;
                                lobby.hostId = event.payload.id;
                                lobby.hostNickname = newHost.nickname;
                            } else leftId = event.payload.id;

                            lobby.joiners.delete(event.payload.id);
                            this.lobbySubject.next(leftId == this.auth.auth!.user.id ? null : lobby);

                        }
                        break;

                    case 'PLAYER_READY':
                        console.log("Received PLAYER_READY event:", event.payload);
                        if (lobby) {
                            lobby.joiners.get(event.payload.id)!.isReady = event.payload.isReady;
                            this.lobbySubject.next(lobby);
                        }
                        break;

                    case 'GAME_STARTED':
                        alert('¡La partida ha comenzado!');
                        break;
                }
            });
        });

        // Equivalent logic to fetching the initial lobby data instead of a direct subscribe mapping
        this.socketService.socket.emit('lobbies.get', lobbyId, (response: any) => {
            if (response.status === 'error' || !response.data) {
                this.leave();
                return;
            }

            const lobby: Lobby = {
                id: lobbyId,
                name: response.data.name,
                hostId: response.data.hostId,
                hostNickname: response.data.hostNickname,
                joiners: new Map(
                    (response.data.joiners as any[]).map(item => [
                        item.id,
                        item,
                    ])
                ),
                maxPlayers: response.data.maxPlayers
            };
            lobby.id = lobbyId;
            console.log("Received lobby update:", response.data);
            this.zone.run(() => {
                this.lobbySubject.next(lobby);
            });
        });
    }

    leave() {
        this.socketService.socket.emit('lobby.leave', {});

        if (this.roomSubName) {
            this.socketService.socket.off(this.roomSubName);
            this.roomSubName = null;
        }
        this.lobbySubject.next(null);
    }

    setReady(isReady: boolean) {
        this.socketService.socket.emit('lobby.ready', { isReady });
    }

    kick(targetId: number) {
        this.socketService.socket.emit('lobby.kick', { targetId });
    }

    startGame() {
        this.socketService.socket.emit('lobby.start', {});
    }
}
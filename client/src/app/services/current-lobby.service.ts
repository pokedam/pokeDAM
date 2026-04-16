import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbySocketClient } from './lobby-socket-client.service';

export interface Lobby {
    id: string,
    name: string;
    hostId: number;
    hostNickname: string;
    joiners: Record<number, Joiner>;
    maxPlayers: number;
}

export interface Joiner {
    nickname: string;
    isReady: boolean;
}

export interface ServerEvent {
    event: string;
    payload: any;
}

@Injectable({ providedIn: 'root' })
export class CurrentLobbyService {

    private socket = inject(LobbySocketClient);
    private zone = inject(NgZone);

    private lobbySubject = new BehaviorSubject<Lobby | null>(null);
    lobby$ = this.lobbySubject.asObservable();

    get lobby(): Lobby | null {
        return this.lobbySubject.getValue();

    }


    private roomSub: any = null;

    constructor() {
        this.socket.connected$.subscribe(() => {
            const savedLobbyId = sessionStorage.getItem('currentLobbyId');
            if (savedLobbyId) {
                this.setupSubscriptions(savedLobbyId);
            }
        });
    }

    create(name: string, password?: string) {
        const sub = this.socket.client.subscribe('/user/queue/lobby-created', msg => {
            const newLobbyId = msg.body.replace(/"/g, '');
            sub.unsubscribe();
            this.zone.run(() => {
                this.setupSubscriptions(newLobbyId);
            });
        });

        this.socket.client.publish({
            destination: '/app/lobby.create',
            body: JSON.stringify({ name, password })
        });
    }

    join(lobbyId: string, password?: string) {
        this.socket.client.publish({
            destination: '/app/lobby.join',
            body: JSON.stringify({ lobbyId, password })
        });

        this.setupSubscriptions(lobbyId);
    }

    private setupSubscriptions(lobbyId: string) {
        sessionStorage.setItem('currentLobbyId', lobbyId);

        if (this.roomSub) {
            this.roomSub.unsubscribe();
        }

        //let currentLobby: Lobby | null = null;

        this.roomSub = this.socket.client.subscribe(`/topic/lobby/${lobbyId}`, msg => {

            const event: ServerEvent = JSON.parse(msg.body);

            this.zone.run(() => {
                let lobby = this.lobby;
                switch (event.event) {

                    case 'PLAYER_JOINED':
                        if (lobby) {
                            lobby.joiners[event.payload.id] = {
                                nickname: event.payload.nickname,
                                isReady: false
                            };
                            this.lobbySubject.next(lobby);
                        }
                        break;

                    case 'PLAYER_LEFT':
                        if (lobby) {
                            if (event.payload.hostReplacement) {
                                let newHost = lobby.joiners[event.payload.id];
                                lobby.hostId = event.payload.id;
                                lobby.hostNickname = newHost.nickname;
                            }
                            delete lobby.joiners[event.payload.id];
                            this.lobbySubject.next({ ...lobby });
                        }
                        break;

                    case 'PLAYER_READY':
                        console.log("Received PLAYER_READY event:", event.payload);
                        if (lobby) {
                            lobby.joiners[event.payload.id].isReady =
                                event.payload.isReady;
                            this.lobbySubject.next({ ...lobby });
                        }
                        break;

                    case 'GAME_STARTED':
                        alert('¡La partida ha comenzado!');
                        break;
                }
            });
        });

        this.socket.client.subscribe(`/app/lobbies/${lobbyId}`, msg => {

            if (!msg.body || msg.body === 'null') {
                this.leave();
                return;
            }

            const lobby: Lobby = JSON.parse(msg.body);
            console.log("Received lobby update:", msg.body);
            this.zone.run(() => {
                this.lobbySubject.next(lobby);
            });
        });
    }

    leave() {
        sessionStorage.removeItem('currentLobbyId');

        this.socket.client.publish({
            destination: '/app/lobby.leave',
            body: JSON.stringify({})
        });

        this.roomSub?.unsubscribe();
        this.roomSub = null;
        this.lobbySubject.next(null);
    }

    setReady(isReady: boolean) {
        this.socket.client.publish({
            destination: '/app/lobby.ready',
            body: JSON.stringify({ isReady })
        });
    }

    startGame() {
        this.socket.client.publish({
            destination: '/app/lobby.start',
            body: JSON.stringify({})
        });
    }
}
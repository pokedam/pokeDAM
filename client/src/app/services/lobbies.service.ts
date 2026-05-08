import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { LobbyBrowserEvent, LobbySummaryResponse } from 'shared_types';

export interface LobbyInfo {
    name: string;
    hasPassword: boolean;
    playerCount: number;
    maxPlayers: number;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {

    private _socket = inject(SocketService);
    private _lobbies = signal<Map<string, LobbyInfo>>(new Map(), { equal: (_, __) => false });
    private _sub?: Subscription;

    lobbies = this._lobbies.asReadonly();

    init() {
        this.dispose(); // Asegurarnos de no duplicar suscripciones

        this._socket.emitMessage<void, LobbySummaryResponse[]>('lobbies.getAll')
            .subscribe(response => {
                const map = new Map<string, LobbyInfo>();
                for (const lobby of response) {
                    map.set(lobby.id, lobby);
                }
                this._lobbies.set(map);
            });

        this._sub = this._socket.listenEvent<LobbyBrowserEvent>('lobbies.event')
            .subscribe(event => {
                this._lobbies.update(lobbies => {
                    switch (event.type) {
                        case 'created':
                            lobbies.set(event.res.id, event.res);
                            break;
                        case 'changed':
                            if (event.count === 0) {
                                lobbies.delete(event.id);
                            } else {
                                const lobby = lobbies.get(event.id);
                                if (lobby) {
                                    lobby.playerCount = event.count;
                                }
                            }
                            break;
                    }
                    return lobbies;
                });
            });
    }

    dispose() {
        this._sub?.unsubscribe();
        this._sub = undefined;
        this._lobbies.set(new Map());
    }
}

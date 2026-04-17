import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbySocketClient } from './lobby-socket-client.service';

export interface LobbyInfo {
  name: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
}

export interface ServerEvent {
  type: string;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {

  private socketService = inject(LobbySocketClient);
  private zone = inject(NgZone);

  private lobbiesSubject = new BehaviorSubject<Map<string, LobbyInfo>>(new Map());
  lobbies$ = this.lobbiesSubject.asObservable();
  get lobbies() {
    return this.lobbiesSubject.getValue();
  }


  constructor() {
    this.init();
  }

  private init() {
    this.socketService.connected$.subscribe(() => {

      this.socketService.socket.emit('lobbies.getAll', (response: any) => {
        if (response.status === 'ok') {
          const map = new Map<string, LobbyInfo>();
          for (const lobby of response.data) {
            map.set(lobby.id, lobby as LobbyInfo);
          }
          this.zone.run(() => {
            this.lobbiesSubject.next(map);
          });
        }
      });

      this.socketService.socket.on('lobbies.event', (event: ServerEvent) => {

        this.zone.run(() => {

          switch (event.type) {

            case 'ADDED':
              this.lobbies.set(event.payload.id, event.payload);
              break;

            case 'CHANGED': {
              if (event.payload.size == 0) {
                this.lobbies.delete(event.payload.lobbyId);
              } else {
                const l = this.lobbies.get(event.payload.lobbyId);
                if (l) l.playerCount = event.payload.size;
              }
              break;
            }
          }
          this.lobbiesSubject.next(this.lobbies);
        });
      });
    });
  }
}
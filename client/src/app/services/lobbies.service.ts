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
  event: string;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {

  private socket = inject(LobbySocketClient);
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
    this.socket.connected$.subscribe(() => {
      this.socket.client.subscribe('/app/lobbies', msg => {

        const data: any[] = JSON.parse(msg.body);
        const map = new Map<string, LobbyInfo>();

        for (const lobby of data) {
          map.set(lobby.id, lobby as LobbyInfo);
        }

        this.zone.run(() => {
          this.lobbiesSubject.next(map);
        });
      });

      this.socket.client.subscribe('/topic/lobbies', msg => {

        const event: ServerEvent = JSON.parse(msg.body);

        this.zone.run(() => {

          switch (event.event) {

            case 'ADDED':
              this.lobbies.set(event.payload.id, event.payload);
              break;

            case 'CHANGED': {
              if (event.payload.playerCount == 0) {
                this.lobbies.delete(event.payload.id);
              } else {
                this.lobbies.get(event.payload.id)!.playerCount = event.payload.playerCount;
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
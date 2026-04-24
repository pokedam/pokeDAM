import { Injectable, inject, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbySocketClient } from './lobby-socket-client.service';
import { ErrorService } from './error.service';
import { LobbyBrowserEvent, LobbySummaryResponse, Result } from 'shared_types';
import { LobbiesBrowser } from '../components/battle-arena/lobbies-browser/lobbies-browser';

export interface LobbyInfo {
  name: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {

  private socketService = inject(LobbySocketClient);
  private zone = inject(NgZone);
  private errorService = inject(ErrorService);

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
      this.socketService.socket.emit('lobbies.getAll', (response: Result<LobbySummaryResponse[]>) => {
        if (this.errorService.unwrap(response)) {
          const map = new Map<string, LobbyInfo>();
          for (const lobby of response.content)
            map.set(lobby.id, lobby);

          this.zone.run(() => {
            this.lobbiesSubject.next(map);
          });
        }
      });

      this.socketService.socket.on('lobbies.event', (event: LobbyBrowserEvent) => {

        this.zone.run(() => {
          switch (event.type) {
            case 'created':
              this.lobbies.set(event.res.id, event.res);
              break;
            case 'changed':
              if (event.count == 0) this.lobbies.delete(event.id)
              else this.lobbies.get(event.id)!.playerCount = event.count;
              break;
          }
          this.lobbiesSubject.next(this.lobbies);
        });
      });
    });
  }
}
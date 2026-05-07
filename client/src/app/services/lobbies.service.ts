import { EffectRef, Injectable, Injector, inject, NgZone, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';
import { ErrorService } from './error.service';
import { LobbyBrowserEvent, LobbySummaryResponse, Result } from 'shared_types';


export interface LobbyInfo {
  name: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {
  private socketService = inject(SocketService);
  private zone = inject(NgZone);
  private errorService = inject(ErrorService);
  private injector = inject(Injector);

  private effectRef: EffectRef | null = null;

  private onLobbyEvent = (event: LobbyBrowserEvent) => {
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
  };

  private lobbiesSubject = new BehaviorSubject<Map<string, LobbyInfo>>(new Map());
  lobbies$ = this.lobbiesSubject.asObservable();
  get lobbies() {
    return this.lobbiesSubject.getValue();
  }

  init(): void {
    if (this.effectRef) return;

    this.effectRef = effect(() => {
      const socket = this.socketService.socket();
      if (!socket) return;

      socket.emit('lobbies.getAll', (response: Result<LobbySummaryResponse[]>) => {
        if (this.errorService.unwrap(response)) {
          const map = new Map<string, LobbyInfo>();
          for (const lobby of response.content)
            map.set(lobby.id, lobby);

          this.zone.run(() => {
            this.lobbiesSubject.next(map);
          });
        }
      });

      socket.off('lobbies.event', this.onLobbyEvent);
      socket.on('lobbies.event', this.onLobbyEvent);

    }, { injector: this.injector });
  }

  dispose(): void {
    this.effectRef?.destroy();
    this.effectRef = null;
    this.socketService.socket()?.off('lobbies.event', this.onLobbyEvent);
  }
}
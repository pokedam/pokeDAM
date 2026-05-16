import { EffectRef, Injectable, NgZone, effect, inject, signal } from '@angular/core';
import { Socket } from 'socket.io-client';
import { Result } from 'shared_types/dist/result';
import { WelcomeResponse, LobbiesEvent } from 'shared_types';
import { ErrorService } from './error.service';
import { GroupService } from './group.service';
import { SocketService } from './socket.service';

export interface LobbiesEntry {
  name: string;
  hasPassword: boolean;
  playerCount: number;
  maxPlayers: number;
}

@Injectable({ providedIn: 'root' })
export class LobbiesService {
  private socketService = inject(SocketService);
  private error = inject(ErrorService);
  private group = inject(GroupService);
  private zone = inject(NgZone);
  private effectRef: EffectRef | null = null;

  private _lobbies = signal<Map<string, LobbiesEntry> | null>(null, { equal: () => false });
  readonly lobbies = this._lobbies.asReadonly();

  init() {
    if (this.effectRef) return;

    this.effectRef = effect((onCleanup) => {
      const socket = this.socketService.socket();
      if (!socket) {
        this._lobbies.set(null);
        return;
      }

      const onConnect = () => this.fetchAll(socket);
      const onDisconnect = () => {
        this.zone.run(() => this._lobbies.set(null));
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('lobbies.event', this.onLobbiesEvent);

      if (socket.connected) {
        onConnect();
      }

      onCleanup(() => {
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('lobbies.event', this.onLobbiesEvent);
      });
    });
  }

  dispose() {
    this.effectRef?.destroy();
    this.effectRef = null;
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private fetchAll(socket: Socket) {
    socket.emit('lobbies.getAll', (res: Result<WelcomeResponse>) => {
      if (res.success) {
        this.zone.run(() => {
          const content = res.content;
          if (content.game) {
            console.log("restoring game...");
            this.group.restoreGame(content.game);
          }

          const map = new Map<string, LobbiesEntry>();
          for (const lobby of content.lobbies) {
            map.set(lobby.id, lobby);
          }
          console.log("setting lobbies...");
          this._lobbies.set(map);
        });
      } else {
        this.error.show(res.message);
      }
    });
  }

  private onLobbiesEvent = (event: LobbiesEvent) => {
    this.zone.run(() => {
      this._lobbies.update((lobbies) => {
        if (!lobbies) return null;
        console.log('Received lobbies event:', event);
        switch (event.type) {
          case 'created':
            lobbies.set(event.res.id, event.res);
            break;
          case 'changed':
            if (event.count === 0) {
              lobbies.delete(event.id);
            } else {
              const lobby = lobbies.get(event.id);
              if (lobby) lobby.playerCount = event.count;
            }
            break;
        }
        return lobbies;
      });
    });
  };
}

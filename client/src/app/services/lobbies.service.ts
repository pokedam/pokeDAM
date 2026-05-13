// import { EffectRef, Injectable, Injector, inject, NgZone, effect, OnInit, OnDestroy } from '@angular/core';
// import { BehaviorSubject, catchError, EMPTY, map } from 'rxjs';
// import { SocketService } from './socket.service';
// import { ErrorService } from './error.service';
// import { GroupResponse, LobbyBrowserEvent } from 'shared_types';

// export interface LobbyInfo {
//   name: string;
//   hasPassword: boolean;
//   playerCount: number;
//   maxPlayers: number;
// }

// @Injectable({ providedIn: 'root' })
// export class LobbiesService implements OnDestroy{  
//   private socketService = inject(SocketService);
//   private zone = inject(NgZone);
//   private errorService = inject(ErrorService);
//   private injector = inject(Injector);

//   private effect: EffectRef | null = null;

//   private onLobbyEvent = (event: LobbyBrowserEvent) => {
//     this.zone.run(() => {
//       switch (event.type) {
//         case 'created':
//           this.lobbies.set(event.res.id, event.res);
//           break;
//         case 'changed':
//           if (event.count == 0) this.lobbies.delete(event.id)
//           else this.lobbies.get(event.id)!.playerCount = event.count;
//           break;
//       }
//       this.lobbiesSubject.next(this.lobbies);
//     });
//   };

//   private lobbiesSubject = new BehaviorSubject<Map<string, LobbyInfo>>(new Map());
//   lobbies$ = this.lobbiesSubject.asObservable();
//   get lobbies() {
//     return this.lobbiesSubject.getValue();
//   }

//   init(): void {
//     if (this.effect) return;

//     this.effect = effect(() => {
//       this.socketService.emit<void, GroupResponse>('lobbies.getAll').pipe(
//         map(res => {
//           switch (res.type) {
//             case 'game':
//               this.errorService.show('Player is in game, screen not ready');
//               break;
//             case 'lobbies':
//               const map = new Map<string, LobbyInfo>();
//               for (const lobby of res.lobbies)
//                 map.set(lobby.id, lobby);
//               this.lobbiesSubject.next(map);
//               break;
//           }
//         }),
//         catchError(err => {
//           this.errorService.show(err.message);
//           return EMPTY;
//         }),
//       ).subscribe();

//       this.socketService.off('lobbies.event', this.onLobbyEvent);
//       this.socketService.on('lobbies.event', this.onLobbyEvent);

//     }, { injector: this.injector });
//   }

//   dispose(): void {
//     this.effect?.destroy();
//     this.effect = null;
//     this.socketService.off('lobbies.event', this.onLobbyEvent);
//   }

//   ngOnDestroy(): void {
//     this.dispose();
//   }
// }
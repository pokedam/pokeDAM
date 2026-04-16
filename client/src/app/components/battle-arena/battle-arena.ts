import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { LobbiesBrowser } from './lobbies-browser/lobbies-browser';
import { InLobby } from './in-lobby/in-lobby';
import { CreateLobby } from './create-lobby/create-lobby';
import { AuthService } from '../../services/auth.service';
import { LobbiesService, LobbyInfo } from '../../services/lobbies.service';
import { CurrentLobbyService } from '../../services/current-lobby.service';

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [LobbiesBrowser, InLobby, CreateLobby, AsyncPipe],
  templateUrl: './battle-arena.html',
  styleUrl: './battle-arena.css',
})
export class BattleArena {
  //  currentLobby: Lobby | null = null;
  //currentLobbyId: string | null = null;

  inCreateLobbyMenu: boolean = false;
  //lobbies: Map<string, LobbyInfo> = new Map();

  // private lobbiesSub?: Subscription;
  // private roomSub?: Subscription;

  lobbies = inject(LobbiesService);
  currLobby = inject(CurrentLobbyService);
  auth = inject(AuthService);
  //private cdr = inject(ChangeDetectorRef);

  // ngOnInit() {
  //   // Suscribirse a la lista global de partidas activas
  //   this.lobbiesSub = this.lobbies.lobbies$.subscribe(lobbies => {
  //     //this.lobbies = lobbies;
  //     this.cdr.detectChanges();
  //   });

  //   // Suscribirse al estado de la partida actual
  //   this.roomSub = this.lobbies.currentLobby.subscribe(lobby => {
  //     if (lobby) {
  //       this.currentLobbyId = lobby[0];
  //       this.currentLobby = lobby[1];
  //     } else {
  //       this.currentLobby = null;
  //       this.currentLobbyId = null;
  //     }
  //     this.cdr.detectChanges();
  //   });
  // }

  // ngOnDestroy() {
  //   this.lobbiesSub?.unsubscribe();
  //   this.roomSub?.unsubscribe();
  // }

  openCreateModal() {
    this.inCreateLobbyMenu = true;
  }

  closeCreateModal() {
    this.inCreateLobbyMenu = false;
  }

  createLobby(config: { name: string, password?: string }) {
    this.currLobby.create(
      config.name,
      config.password
    );
    this.inCreateLobbyMenu = false;
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    let pwd = undefined;
    if (lobby.hasPassword) {
      const input = prompt('Sala con contraseña. Introdúcela:');
      if (input === null) return;
      pwd = input;
    }
    console.log(`Intentando unirse a la sala ${lobbyId} con contraseña: ${pwd ? 'Sí' : 'No'}`);
    // Al unirse, suscribimos a los eventos específicos de la sala
    //this.lobbySocket.subscribeToRoom(matchId);
    this.currLobby.join(lobbyId, pwd);
  }

  leaveLobby() {
    this.currLobby.leave();

  }

  toggleReady() {
    let userId = this.auth.auth!.user.id;
    let isReady = this.currLobby.lobby!.joiners[userId].isReady;
    this.currLobby.setReady(!isReady);
  }

  startGame() {
    this.currLobby.startGame();
  }
}

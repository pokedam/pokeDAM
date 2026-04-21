import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LobbiesBrowser } from './lobbies-browser/lobbies-browser';
import { InLobby } from './in-lobby/in-lobby';
import { CreateLobby } from './create-lobby/create-lobby';
import { JoinLobbyPassword } from './join-lobby-password/join-lobby-password';
import { AuthService } from '../../services/auth.service';
import { LobbiesService, LobbyInfo } from '../../services/lobbies.service';
import { CurrentLobbyService } from '../../services/current-lobby.service';

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [LobbiesBrowser, InLobby, CreateLobby, JoinLobbyPassword, AsyncPipe],
  templateUrl: './battle-arena.html',
  styleUrl: './battle-arena.css',
})
export class BattleArena {
  //  currentLobby: Lobby | null = null;
  //currentLobbyId: string | null = null;

  inCreateLobbyMenu: boolean = false;
  savedLobbyName: string = '';
  savedRequiresPassword: boolean = false;
  joiningLobbyId: string | null = null;
  joiningLobbyName: string | null = null;

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

  openCreateMenu() {
    this.inCreateLobbyMenu = true;
  }

  closeCreateMenu(state: { name: string, requiresPassword: boolean }) {
    this.savedLobbyName = state.name;
    this.savedRequiresPassword = state.requiresPassword;
    this.inCreateLobbyMenu = false;
  }

  createLobby(config: { name: string, password: string | null }) {
    this.savedLobbyName = config.name;
    this.savedRequiresPassword = config.password != null;
    this.currLobby.create(
      config.name,
      config.password
    );
    this.inCreateLobbyMenu = false;
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    if (lobby.hasPassword) {
      this.joiningLobbyId = lobbyId;
      this.joiningLobbyName = lobby.name;
    } else {
      console.log(`Intentando unirse a la sala ${lobbyId}`);
      this.currLobby.join(lobbyId);
    }
  }

  confirmJoin(password: string) {
    if (this.joiningLobbyId) {
      console.log(`Intentando unirse a la sala ${this.joiningLobbyId} con contraseña`);
      this.currLobby.join(this.joiningLobbyId, password);
      this.joiningLobbyId = null;
      this.joiningLobbyName = null;
    }
  }

  cancelJoin() {
    this.joiningLobbyId = null;
    this.joiningLobbyName = null;
  }

  leaveLobby() {
    this.currLobby.leave();

  }

  toggleReady() {
    let userId = this.auth.auth!.user.id;
    let isReady = this.currLobby.lobby!.joiners.get(userId)!.isReady;
    this.currLobby.setReady(!isReady);
  }

  startGame() {
    this.currLobby.startGame();
  }
}

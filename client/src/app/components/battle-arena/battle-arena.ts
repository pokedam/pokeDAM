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
  inCreateLobbyMenu: boolean = false;
  savedLobbyName: string = '';
  savedRequiresPassword: boolean = false;
  joiningLobbyId: string | null = null;
  joiningLobbyName: string | null = null;
  lobbies = inject(LobbiesService);
  currLobby = inject(CurrentLobbyService);
  auth = inject(AuthService);

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
      this.currLobby.join(lobbyId);
    }
  }

  confirmJoin(password: string) {
    if (this.joiningLobbyId) {
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

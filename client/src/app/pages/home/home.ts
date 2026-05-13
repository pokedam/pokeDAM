import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LobbiesService, LobbyInfo } from '../../services/lobbies.service';
import { CurrentLobbyService } from '../../services/group.service';
import { LobbiesBrowser } from '../../components/battle-arena/lobbies-browser/lobbies-browser';
import { InLobby } from '../../components/battle-arena/in-lobby/in-lobby';
import { CreateLobby } from '../../components/battle-arena/create-lobby/create-lobby';
import { JoinLobbyPassword } from '../../components/battle-arena/join-lobby-password/join-lobby-password';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [LobbiesBrowser, InLobby, CreateLobby, JoinLobbyPassword, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  inCreateLobbyMenu: boolean = false;
  savedLobbyName: string = '';
  savedRequiresPassword: boolean = false;
  joiningLobbyId: string | null = null;
  joiningLobbyName: string | null = null;

  lobbies = inject(LobbiesService);
  currLobby = inject(CurrentLobbyService);
  auth = inject(AuthService);
  error = inject(ErrorService);

  get lobby() {
    return this.currLobby.lobby();
  }

  ngOnInit(): void {
    this.lobbies.init();
  }

  ngOnDestroy(): void {
    this.lobbies.dispose();
  }

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
    ).subscribe({
      error: (err) => this.error.show(err.message),
    });
    this.inCreateLobbyMenu = false;
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    if (lobby.hasPassword) {
      this.joiningLobbyId = lobbyId;
      this.joiningLobbyName = lobby.name;
    } else {
      this.currLobby.join(lobbyId).subscribe({
        error: (err) => this.error.show(err.message),
      });
    }
  }

  confirmJoin(password: string) {
    if (this.joiningLobbyId) {
      this.currLobby.join(this.joiningLobbyId, password).subscribe({
        error: (err) => this.error.show(err.message),
      });
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
    let userId = this.auth.auth()!.user.id;
    let isReady = this.currLobby.lobby()!.joiners.get(userId)!.isReady;
    this.currLobby.setReady(!isReady).subscribe({
      error: (err) => this.error.show(err.message),
    });
  }

}

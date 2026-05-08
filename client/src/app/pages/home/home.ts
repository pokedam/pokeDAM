import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { LobbiesService, LobbyInfo } from '../../services/lobbies.service';
import { CurrentLobbyService } from '../../services/current-lobby.service';
import { LobbiesBrowser } from '../../components/battle-arena/lobbies-browser/lobbies-browser';
import { InLobby } from '../../components/battle-arena/in-lobby/in-lobby';
import { CreateLobby } from '../../components/battle-arena/create-lobby/create-lobby';
import { JoinLobbyPassword } from '../../components/battle-arena/join-lobby-password/join-lobby-password';

@Component({
  selector: 'home',
  standalone: true,
  imports: [LobbiesBrowser, InLobby, CreateLobby, JoinLobbyPassword],
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
  errors = inject(ErrorService);

  ngOnInit() {
    this.lobbies.init();
  }

  ngOnDestroy() {
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
      error: (err) => this.showError(err),
    });
    this.inCreateLobbyMenu = false;
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    if (lobby.hasPassword) {
      this.joiningLobbyId = lobbyId;
      this.joiningLobbyName = lobby.name;
    } else {
      this.currLobby.join(lobbyId).subscribe({
        error: (err) => this.showError(err),
      });
    }
  }

  confirmJoin(password: string) {
    if (this.joiningLobbyId) {
      this.currLobby.join(this.joiningLobbyId, password).subscribe({
        error: (err) => this.showError(err),
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
    this.currLobby.leave().subscribe({
      error: (err) => this.showError(err),
    });
  }

  toggleReady() {
    const lobby = this.currLobby.lobby();
    if (!lobby) return;

    const userId = this.auth.auth()!.user.id;
    const joiner = lobby.joiners.get(userId);
    if (!joiner) return;

    this.currLobby.setReady(!joiner.isReady).subscribe({
      error: (err) => this.showError(err),
    });
  }

  startGame() {
    this.currLobby.startGame();
  }

  private showError(error: unknown) {
    if (typeof error === 'string') {
      this.errors.show(error);
      return;
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.length > 0) {
        this.errors.show(message);
        return;
      }
    }

    this.errors.show('Unexpected error');
  }
}

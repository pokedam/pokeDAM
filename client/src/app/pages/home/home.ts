import { Component, effect, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LobbyService } from '../../services/lobby.service';
import { LobbiesBrowser } from '../../components/battle-arena/lobbies-browser/lobbies-browser';
import { InLobby } from '../../components/battle-arena/in-lobby/in-lobby';
import { CreateLobby } from '../../components/battle-arena/create-lobby/create-lobby';
import { JoinLobbyPassword } from '../../components/battle-arena/join-lobby-password/join-lobby-password';
import { ErrorService } from '../../services/error.service';
import { LobbyInfo, SocketService } from '../../services/socket.service';
import { GroupId } from 'shared_types';

type GameState = PasswordState | LobbyCreationState | LobbyBrowserState | InLobbyState | InGameState;

interface PasswordState {
  type: 'pass';
  id: GroupId;
  name: string;
}

interface LobbyCreationState {
  type: 'creation';
}

interface LobbyBrowserState {
  type: 'browser';
}

interface InLobbyState {
  type: 'inLobby';
}

interface InGameState {
  type: 'inGame';
}

@Component({
  selector: 'home',
  standalone: true,
  imports: [LobbiesBrowser, InLobby, CreateLobby, JoinLobbyPassword, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  savedLobbyName: string = '';
  savedHasPassword: boolean = false;
  state: GameState = { type: 'browser' };

  socketService = inject(SocketService);
  currLobby = inject(LobbyService);
  auth = inject(AuthService);
  error = inject(ErrorService);

  constructor() {
    this.socketService.init();

    // Keep state in sync with the current lobby signal.
    effect(() => {
      const lobby = this.currLobby.lobby();
      console.log('Current lobby:', lobby?.id ?? 'none');
      this.state = lobby ? { type: 'inLobby' } : { type: 'browser' }; 
    });
  }

  get lobby() {
    return this.currLobby.lobby();
  }

  openCreateMenu() {
    this.state = { type: 'creation' };
  }

  closeCreateMenu(state: { name: string, requiresPassword: boolean }) {
    this.savedLobbyName = state.name;
    this.savedHasPassword = state.requiresPassword;
    this.state = { type: 'browser' };
  }

  createLobby(config: { name: string, password: string | null }) {
    this.savedLobbyName = config.name;
    this.savedHasPassword = config.password != null;
    this.currLobby.create(
      config.name,
      config.password
    ).subscribe({
      error: (err) => this.error.show(err.message),
    });
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    if (lobby.hasPassword) {
      this.state = { type: 'pass', id: lobbyId, name: lobby.name };
      //this.joiningLobbyId = lobbyId;
      //this.joiningLobbyName = lobby.name;
    } else {
      this.currLobby.join(lobbyId).subscribe({
        error: (err) => this.error.show(err.message),
      });
    }
  }

  confirmJoin(password: string) {
    if (this.state.type === 'pass') {
      this.currLobby.join(this.state.id, password).subscribe({
        error: (err) => this.error.show(err.message),
      });
      this.state = { type: 'browser' };
    }
  }

  cancelJoin() { 
    this.state = { type: 'browser' };
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

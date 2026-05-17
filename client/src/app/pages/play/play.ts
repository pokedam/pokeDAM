import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { GroupService } from '../../services/group.service';
import { LobbiesBrowser } from '../../components/group-screens/lobbies-browser/lobbies-browser';
import { InLobby } from '../../components/group-screens/in-lobby/in-lobby';
import { CreateLobby } from '../../components/group-screens/create-lobby/create-lobby';
import { JoinLobbyPassword } from '../../components/group-screens/join-lobby-password/join-lobby-password';
import { ErrorService } from '../../services/error.service';
import { LobbiesEntry, LobbiesService } from '../../services/lobbies.service';
import { SocketService } from '../../services/socket.service';
import { GroupId } from 'shared_types';
import { InGame } from '../../components/group-screens/in-game/in-game';
import { Loading } from '../../components/group-screens/loading/loading';

type GameState =
  | PasswordState
  | LobbyCreationState
  | LobbyBrowserState
  | InLobbyState
  | InGameState
  | LoadingState;

interface PasswordState {
  type: 'pass';
  id: GroupId;
  name: string;
}

interface LoadingState {
  type: 'loading';
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
  selector: 'play',
  standalone: true,
  imports: [Loading, LobbiesBrowser, InLobby, CreateLobby, JoinLobbyPassword, InGame],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class Play {
  savedLobbyName: string = '';
  savedHasPassword: boolean = false;
  private uiState = signal<GameState>({ type: 'browser' });
  readonly state = computed<GameState>(() => {
    const group = this.group.group();
    if (group) return { type: group.type == 'game' ? 'inGame' : 'inLobby' };

    const lobbies = this.lobbiesService.lobbies();
    if (lobbies) return this.uiState();


    return { type: 'loading' };
  });

  socketService = inject(SocketService);
  lobbiesService = inject(LobbiesService);
  group = inject(GroupService);
  auth = inject(AuthService);
  error = inject(ErrorService);

  constructor() {
    this.socketService.init();
    this.lobbiesService.init();
  }


  openCreateMenu() {
    this.uiState.set({ type: 'creation' });
  }

  closeCreateMenu(state: { name: string, requiresPassword: boolean }) {
    this.savedLobbyName = state.name;
    this.savedHasPassword = state.requiresPassword;
    this.uiState.set({ type: 'browser' });
  }

  createLobby(config: { name: string, password: string | null }) {
    this.savedLobbyName = config.name;
    this.savedHasPassword = config.password != null;
    this.group.create(
      config.name,
      config.password
    ).subscribe({
      next: () => this.uiState.set({ type: 'browser' }),
      error: (err) => this.error.show(err.message),
    });
  }

  joinLobby(lobbyId: string, lobby: LobbiesEntry) {
    if (lobby.hasPassword) {
      this.uiState.set({ type: 'pass', id: lobbyId, name: lobby.name });
      //this.joiningLobbyId = lobbyId;
      //this.joiningLobbyName = lobby.name;
    } else {
      this.group.join(lobbyId).subscribe({
        next: () => this.uiState.set({ type: 'browser' }),
        error: (err) => this.error.show(err.message),
      });
    }
  }

  confirmJoin(password: string) {
    const local = this.uiState();
    if (local.type === 'pass') {
      this.group.join(local.id, password).subscribe({
        error: (err) => this.error.show(err.message),
      });
      this.uiState.set({ type: 'browser' });
    }
  }

  cancelJoin() {
    this.uiState.set({ type: 'browser' });
  }

  leaveLobby() {
    this.group.leave();
  }

  toggleReady() {
    let userId = this.auth.auth()!.user.id;
    let isReady = this.group.asLobby().joiners.get(userId)!.isReady;
    this.group.setReady(!isReady).subscribe({
      error: (err) => this.error.show(err.message),
    });
  }
}

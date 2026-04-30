import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Lobby, Joiner as Joiner, CurrentLobbyService } from '../../../services/current-lobby.service';
import { AuthService } from '../../../services/auth.service';
import { ContentHeader } from '../../content-header/content-header';


@Component({
  selector: 'app-in-lobby',
  standalone: true,
  imports: [ContentHeader],
  templateUrl: './in-lobby.html',
  styleUrl: '../battle-arena.css',
})

export class InLobby {
  lobbyService = inject(CurrentLobbyService);
  authService = inject(AuthService);

  get currentLobby(): Lobby {
    return this.lobbyService.lobby!;
  }

  get userIndex(): number {
    return this.authService.auth()!.user.id;
  }

  get player(): Joiner | null {
    return this.currentLobby.joiners.get(this.userIndex) || null;
  }

  protected Object = Object;

  kick(targetId: number) {
    this.lobbyService.kick(targetId);
  }

  get displayName(): string {
    const name = this.currentLobby.name;
    return name.length > 30 ? name.substring(0, 27) + '...' : name;
  }

  canStartMatch(): boolean {
    const joiners = this.currentLobby.joiners;
    if (joiners.size === 0) {
      return false;
    }
    for (let joiner of joiners.values()) {
      if (!joiner.isReady) {
        return false;
      }
    }
    return true;
  }

  leaveLobby() {
    this.lobbyService.leave();

  }

  toggleReady() {
    let userId = this.authService.auth()!.user.id;
    let isReady = this.lobbyService.lobby!.joiners.get(userId)!.isReady;
    this.lobbyService.setReady(!isReady);
  }

  startGame() {
    this.lobbyService.startGame();
  }
}

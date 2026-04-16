import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Lobby, Joiner as Joiner } from '../../../services/current-lobby.service';


@Component({
  selector: 'app-in-lobby',
  standalone: true,
  templateUrl: './in-lobby.html',
  styleUrl: '../battle-arena.css',
})

export class InLobby {
  @Input() currentLobby!: Lobby;
  @Input() userIndex!: number;

  @Output() onLeaveMatch = new EventEmitter<void>();
  @Output() onToggleReady = new EventEmitter<void>();
  @Output() onStartMatch = new EventEmitter<void>();

  get player(): Joiner | null {
    return this.userIndex in this.currentLobby.joiners
      ? this.currentLobby.joiners[this.userIndex]
      : null;
  }

  protected Object = Object;

  leaveMatch() {
    this.onLeaveMatch.emit();
  }

  toggleReady() {
    this.onToggleReady.emit();
  }

  startMatch() {
    this.onStartMatch.emit();
  }

  get displayName(): string {
    const name = this.currentLobby.name;
    return name.length > 30 ? name.substring(0, 27) + '...' : name;
  }
}

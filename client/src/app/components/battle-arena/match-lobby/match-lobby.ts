import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Lobby } from '../../../services/lobby-socket.service';

@Component({
  selector: 'app-match-lobby',
  standalone: true,
  templateUrl: './match-lobby.html',
  styleUrl: '../battle-arena.css',
})
export class MatchLobby {
  @Input() currentMatch!: Lobby;
  @Input() currentUser!: string;
  @Output() onLeaveMatch = new EventEmitter<void>();
  @Output() onToggleReady = new EventEmitter<void>();
  @Output() onStartMatch = new EventEmitter<void>();

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
}

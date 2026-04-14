import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Lobby } from '../../../services/lobby-socket.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-browser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-browser.html',
  styleUrl: '../battle-arena.css'
})
export class GameBrowser {
  @Input() matches: Map<string, Lobby> = new Map();
  @Input() currentUser!: string;
  @Output() onCreateMatch = new EventEmitter<void>();
  @Output() onJoinMatch = new EventEmitter<{ matchId: string, match: Lobby }>();

  protected Object = Object;

  createMatch() {
    this.onCreateMatch.emit();
  }

  joinMatch(matchId: string, match: Lobby) {
    this.onJoinMatch.emit({ matchId, match });
  }
}

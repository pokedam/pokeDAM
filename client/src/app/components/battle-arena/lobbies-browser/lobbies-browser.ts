import { Component, EventEmitter, Input, Output } from '@angular/core';
//import { Lobby, LobbyInfo } from '../../../services/lobby-socket.service';

import { CommonModule } from '@angular/common';
import { LobbyInfo } from '../../../services/lobbies.service';
import { ContentHeader } from '../../content-header/content-header';

@Component({
  selector: 'app-lobbies-browser',
  standalone: true,
  imports: [CommonModule, ContentHeader],
  templateUrl: './lobbies-browser.html',
  styleUrl: '../battle-arena.css'
})
export class LobbiesBrowser {
  @Input() lobbies: Map<string, LobbyInfo> = new Map();
  @Input() currentUser!: string;
  @Output() onCreateLobby = new EventEmitter<void>();
  @Output() onJoinLobby = new EventEmitter<{ lobbyId: string, lobby: LobbyInfo }>();

  protected Object = Object;

  createLobby() {
    this.onCreateLobby.emit();
  }

  joinLobby(lobbyId: string, lobby: LobbyInfo) {
    this.onJoinLobby.emit({ lobbyId: lobbyId, lobby: lobby });
  }
}

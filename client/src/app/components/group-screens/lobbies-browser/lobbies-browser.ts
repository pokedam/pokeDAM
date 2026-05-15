import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentHeader } from '../../content-header/content-header';
import { LobbiesEntry, LobbiesService } from '../../../services/lobbies.service';
import { AuthService } from '../../../services/auth.service';
import { GroupId } from 'shared_types/dist/game';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lobbies-browser',
  standalone: true,
  imports: [CommonModule, ContentHeader, FormsModule],
  templateUrl: './lobbies-browser.html',
  styleUrl: '../battle-arena.css'
})
export class LobbiesBrowser {

  message: string = "";

  @Output() onCreateLobby = new EventEmitter<string>();
  @Output() onJoinLobby = new EventEmitter<{ lobbyId: string, lobby: LobbiesEntry, message: string }>();

  private auth = inject(AuthService);
  private lobbyService = inject(LobbiesService);

  get lobbies(): Map<GroupId, LobbiesEntry> | null {
    return this.lobbyService.lobbies();
  }

  createLobby() {
    this.onCreateLobby.emit(this.message);
  }

  joinLobby(lobbyId: string, lobby: LobbiesEntry, message: string) {
    this.onJoinLobby.emit({ lobbyId, lobby, message });
  }
}

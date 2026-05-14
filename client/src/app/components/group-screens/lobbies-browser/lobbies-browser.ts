import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentHeader } from '../../content-header/content-header';
import { LobbiesEntry, LobbiesService } from '../../../services/lobbies.service';
import { AuthService } from '../../../services/auth.service';
import { GroupId } from 'shared_types/dist/game';

@Component({
  selector: 'app-lobbies-browser',
  standalone: true,
  imports: [CommonModule, ContentHeader],
  templateUrl: './lobbies-browser.html',
  styleUrl: '../battle-arena.css'
})
export class LobbiesBrowser {

  @Output() onCreateLobby = new EventEmitter<void>();
  @Output() onJoinLobby = new EventEmitter<{ lobbyId: string, lobby: LobbiesEntry }>();

  private auth = inject(AuthService);
  private lobbyService = inject(LobbiesService);

  get lobbies(): Map<GroupId, LobbiesEntry> | null {
    return this.lobbyService.lobbies();
  }

  createLobby() {
    this.onCreateLobby.emit();
  }

  joinLobby(lobbyId: string, lobby: LobbiesEntry) {
    this.onJoinLobby.emit({ lobbyId: lobbyId, lobby: lobby });
  }
}

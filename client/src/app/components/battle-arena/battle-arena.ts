import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { LobbySocketService, Lobby } from '../../services/lobby-socket.service';
import { Subscription } from 'rxjs';
import { GameBrowser } from './game-browser/game-browser';
import { MatchLobby } from './match-lobby/match-lobby';
import { CreateMatch } from './create-match/create-match';

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [GameBrowser, MatchLobby, CreateMatch],
  templateUrl: './battle-arena.html',
  styleUrl: './battle-arena.css',
})
export class BattleArena implements OnInit, OnDestroy {
  currentUser: string = 'Player_' + Math.floor(Math.random() * 1000); // Simulando un ID de usuario único
  currentView: 'browser' | 'lobby' | 'create' = 'browser';
  currentLobby: Lobby | null = null;
  currentLobbyId: string | null = null;

  showCreateModal: boolean = false;
  matches: Map<string, Lobby> = new Map();

  private lobbiesSub?: Subscription;
  private roomSub?: Subscription;

  constructor(private lobbySocket: LobbySocketService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Suscribirse a la lista global de partidas activas
    this.lobbiesSub = this.lobbySocket.lobbies$.subscribe(rooms => {
      this.matches = rooms;
      this.cdr.detectChanges();
    });

    // Suscribirse al estado de la partida actual
    this.roomSub = this.lobbySocket.currentLobby.subscribe(lobby => {
      if (lobby) {
        this.currentLobbyId = lobby[0];
        this.currentLobby = lobby[1];
        this.currentView = 'lobby';
        this.lobbySocket.subscribeToRoom(this.currentLobbyId);
      } else {
        this.currentLobby = null;
        this.currentLobbyId = null;
        this.currentView = 'browser';
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.lobbiesSub?.unsubscribe();
    this.roomSub?.unsubscribe();
  }

  openCreateModal() {
    this.currentView = 'create';
  }

  closeCreateModal() {
    this.currentView = 'browser';
  }

  createMatch(config: { name: string, password?: string }) {
    this.lobbySocket.createRoom(
      this.currentUser,
      config.name || `${this.currentUser}'s Game`,
      config.password
    );
    this.currentView = 'lobby';
  }

  joinMatch(matchId: string, match: Lobby) {
    let pwd = undefined;
    if (match.hasPassword) {
      const input = prompt('Sala con contraseña. Introdúcela:');
      if (input === null) return;
      pwd = input;
    }

    // Al unirse, suscribimos a los eventos específicos de la sala
    this.lobbySocket.subscribeToRoom(matchId);
    this.lobbySocket.joinRoom(matchId, this.currentUser, pwd);
  }

  leaveMatch() {
    if (this.currentLobby) {
      this.lobbySocket.leaveRoom(this.currentUser);
    }
  }

  toggleReady() {
    if (this.currentLobby) {
      const isCurrentlyReady = this.currentLobby.readys[this.currentUser] || false;
      this.lobbySocket.setReady(this.currentUser, !isCurrentlyReady);
    }
  }

  startMatch() {
    if (this.currentLobby && this.currentLobby.hostId === this.currentUser) {
      this.lobbySocket.startGame(this.currentUser);
    }
  }
}

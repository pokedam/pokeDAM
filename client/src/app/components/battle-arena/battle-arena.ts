import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface MatchRoom {
  id: string;
  name: string;
  host: string;
  players: number;
  maxPlayers: number;
  status: 'Waiting' | 'In Progress';
  password?: string;
}

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './battle-arena.html',
  styleUrl: './battle-arena.css',
})
export class BattleArena {
  currentUser: string = 'Dariomg'; // Mock user
  currentView: 'browser' | 'lobby' = 'browser';
  currentMatch: MatchRoom | null = null;
  joinedAsPlayer2: boolean = false;

  showCreateModal: boolean = false;
  newMatchName: string = "Dariomg's Custom Game";
  requiresPassword: boolean = false;
  newMatchPassword: string = '';

  matches: MatchRoom[] = [
    { id: '1', name: "Dario's Training", host: 'Dariomg', players: 1, maxPlayers: 2, status: 'Waiting' },
    { id: '2', name: "Noobs only", host: 'AshKetchum', players: 2, maxPlayers: 2, status: 'In Progress' },
    { id: '3', name: "Competitive 1v1", host: 'Red', players: 1, maxPlayers: 2, status: 'Waiting', password: '123' },
    { id: '4', name: "Testing my new engine", host: 'Dev', players: 1, maxPlayers: 2, status: 'Waiting' },
  ];

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.newMatchPassword = '';
  }

  createMatch() {
    const id = Math.random().toString(36).substring(2, 9);
    const newMatch: MatchRoom = {
      id,
      name: this.newMatchName || `${this.currentUser}'s Custom Game`,
      host: this.currentUser,
      players: 1,
      maxPlayers: 2,
      status: 'Waiting',
      password: this.requiresPassword ? this.newMatchPassword : undefined
    };
    this.matches.push(newMatch);
    this.currentMatch = newMatch;
    this.joinedAsPlayer2 = false;
    this.showCreateModal = false;
    this.currentView = 'lobby';

    // Reset password so it doesn't stay if matching is created uniquely
    this.newMatchPassword = '';
  }

  joinMatch(match: MatchRoom) {
    if (match.password && match.host !== this.currentUser) {
      const pswd = prompt('This room is password protected. Enter password:');
      if (pswd !== match.password) {
        alert('Incorrect password!');
        return;
      }
    }

    if (match.players < match.maxPlayers || match.host === this.currentUser) {
      if (match.host !== this.currentUser) {
        match.players++;
        this.joinedAsPlayer2 = true;
      } else {
        this.joinedAsPlayer2 = false;
      }
      this.currentMatch = match;
      this.currentView = 'lobby';
    }
  }

  leaveMatch() {
    if (this.currentMatch) {
      if (this.currentMatch.host === this.currentUser) {
        this.matches = this.matches.filter(m => m.id !== this.currentMatch!.id);
      } else if (this.joinedAsPlayer2) {
        this.currentMatch.players--;
      }
    }
    this.currentMatch = null;
    this.joinedAsPlayer2 = false;
    this.currentView = 'browser';
  }

  startMatch() {
    if (this.currentMatch && this.currentMatch.host === this.currentUser) {
      this.currentMatch.status = 'In Progress';
      alert('Match starts! Integrating with engine...');
    }
  }
}

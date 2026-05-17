import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentHeader } from '../../components/content-header/content-header';
import { AuthService } from '../../services/auth.service';
import { HistoryService } from '../../services/history.service';
import { ErrorService } from '../../services/error.service';
import { GameSummary, pokemon as getPokemon } from 'shared_types';

interface GameRecord {
  id: number;
  message: string;
  result: 'win' | 'loss' | 'draw';
  date: Date;
  pokemonUsed: string[];
}

@Component({
  selector: 'app-game-history',
  standalone: true,
  imports: [CommonModule, ContentHeader],
  templateUrl: './game-history.html',
  styleUrl: './game-history.css',
})
export class GameHistory implements OnInit {
  authService = inject(AuthService);
  historyService = inject(HistoryService);
  error = inject(ErrorService);
  private router = inject(Router);

  private _games = signal<GameSummary[] | null>(null);

  getGames(): GameRecord[] | null {
    const games = this._games();
    if (!games) return null;
    const userId = this.authService.auth()?.user.id;
    if (userId === undefined) return null;

    return games.map((summary, idx) => {
      let result: 'win' | 'loss' | 'draw';
      let message: string;
      if (summary.end.winner === null) {
        result = 'draw';
        message = '';
      } else if (summary.end.winner === userId) {
        result = 'win';
        message = 'Winner!';
      } else {
        result = 'loss';
        message = `vs ${summary.initialGame.find(p => p.id === summary.end.winner)?.nickname ?? 'Unknown'}`;
      }

      const pokemonUsed = summary.initialGame.find(player => player.id === userId)?.pokemons.slice(0, 3).map(p => p.name || getPokemon(p.pokedexIdx).name) || [];

      return {
        id: idx,
        message,
        result,
        date: summary.date ? new Date(summary.date) : new Date(),
        pokemonUsed
      };
    });
  }

  openGame(game: GameRecord): void {
    this.router.navigate(['/history', game.id]);
  }

  ngOnInit(): void {
    this.historyService.getGames().subscribe({
      next: (summaries) => {
        const userId = this.authService.auth()?.user.id;
        if (userId === undefined) return;
        this._games.set(summaries);
      },
      error: (err) => this.error.show(err.message),
    });
  }
}
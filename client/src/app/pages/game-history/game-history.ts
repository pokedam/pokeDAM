import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentHeader } from '../../components/content-header/content-header';
import { AuthService } from '../../services/auth.service';
import { HistoryService } from '../../services/history.service';
import { ErrorService } from '../../services/error.service';
import { pokemon as getPokemon } from 'shared_types';

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

  games = signal<GameRecord[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.historyService.getGames().subscribe({
      next: (summaries) => {
        const userId = this.authService.auth()?.user.id;
        if (userId === undefined) return;
        console.log("found history!");
        this.games.set(summaries.map((s, index) => {
          const me = s.initialGame.find(p => p.id === userId);
          const opponent = s.initialGame.find(p => p.id !== userId);


          let result: 'win' | 'loss' | 'draw';
          let message: string;
          if (s.end.winner === null) {
            result = 'draw';
            message = '';
          } else if (s.end.winner === userId) {
            result = 'win';
            message = 'Winner!';
          } else {
            result = 'loss';
            message = `vs ${s.initialGame.find(p => p.id === s.end.winner)?.nickname ?? 'Unknown'}`;
          }

          const pokemonUsed = me?.pokemons.slice(0, 3).map(p => p.name || getPokemon(p.pokedexIdx).name) || [];

          return {
            id: index,
            message,
            result,
            date: s.date ? new Date(s.date) : new Date(),
            pokemonUsed
          };
        }));
        console.log("UPDATE COMPLETED", this.games());
        this.loading.set(false);
      },
      error: (err) => this.error.show(err.message),
    });
  }
}
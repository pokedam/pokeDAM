import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentHeader } from '../../components/content-header/content-header';
import { AuthService } from '../../services/auth.service';

interface GameRecord {
  id: number;
  opponent: string;
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

  games: GameRecord[] = [
    // Mock data
    {
      id: 1,
      opponent: 'Ash',
      result: 'win',
      date: new Date('2023-10-01'),
      pokemonUsed: ['Pikachu', 'Charizard']
    },
    {
      id: 2,
      opponent: 'Misty',
      result: 'loss',
      date: new Date('2023-10-02'),
      pokemonUsed: ['Squirtle', 'Blastoise']
    },
    // Add more mock data as needed
  ];

  ngOnInit(): void {
    // TODO: Fetch real game history from backend
  }
}
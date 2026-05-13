import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface MatchItem {
  id: number;
  opponent: string;
  status: 'Ganada' | 'Perdida' | 'Empate';
  playedAt: string;
  duration: string;
  score: string;
  pokemons: string[];
  summary: string;
}

@Component({
  selector: 'app-team-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-menu.html',
  styleUrl: './team-menu.css'
})
export class TeamMenu {
  router = inject(Router);
  matches: MatchItem[] = [];
  selectedMatch: MatchItem | null = null;

  constructor() {
    this.loadMatches();
  }

  loadMatches() {
    this.matches = [
      {
        id: 1,
        opponent: 'Ash',
        status: 'Ganada',
        playedAt: '13/05/2026 18:20',
        duration: '12:38',
        score: '3 - 1',
        pokemons: ['Pikachu', 'Charizard', 'Bulbasaur'],
        summary: 'Victoria rápida con ventaja de tipos y un Gigavoltio Impacto decisivo.'
      },
      {
        id: 2,
        opponent: 'Misty',
        status: 'Perdida',
        playedAt: '12/05/2026 21:05',
        duration: '19:14',
        score: '2 - 4',
        pokemons: ['Gyarados', 'Starmie', 'Psyduck'],
        summary: 'Buena defensa, pero el equipo rival logró encadenar varios ataques super efectivos.'
      },
      {
        id: 3,
        opponent: 'Brock',
        status: 'Empate',
        playedAt: '11/05/2026 16:40',
        duration: '23:07',
        score: '3 - 3',
        pokemons: ['Onix', 'Geodude', 'Vulpix'],
        summary: 'Partida cerrada con muchas estrategias defensivas y un empate por tiempo.'
      }
    ];
    this.selectedMatch = this.matches[0] ?? null;
  }

  selectMatch(match: MatchItem) {
    this.selectedMatch = match;
  }

  closeModal() {
    this.router.navigate(['/play']);
  }
}
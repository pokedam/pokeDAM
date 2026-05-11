import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerPokemon } from 'shared_types';

@Component({
  selector: 'app-team-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-menu.html',
  styleUrl: './team-menu.css'
})
export class TeamMenu {
  router = inject(Router);
  team: PlayerPokemon[] = [];

  constructor() {
    this.loadTeam();
  }

  loadTeam() {
    const saved = localStorage.getItem('pokemonTeam');
    if (saved) {
      this.team = JSON.parse(saved);
    }
  }

  getPokemonImageUrl(pokemonId: number): string {
    let mappedId = pokemonId;
    if (pokemonId > 10) mappedId = Math.floor(Math.random() * 150) + 1;
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mappedId}.png`;
  }

  closeModal() {
    this.router.navigate(['/play']);
  }
}
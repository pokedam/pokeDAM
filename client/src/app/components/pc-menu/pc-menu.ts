import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PcPlayerPokemon, PlayerPokemon, Stats } from 'shared_types';

@Component({
  selector: 'app-pc-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pc-menu.html',
  styleUrl: './pc-menu.css'
})
export class PcMenu {
  router = inject(Router);
  pcPokemons: PcPlayerPokemon[] = [];

  constructor() {
    this.generateMockData();
  }

  generateMockData() {
    // Generate 30 fake pokemons
    const names = ['Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle', 'Gengar', 'Snorlax', 'Dragonite', 'Mewtwo', 'Eevee', 'Lucario'];

    for (let i = 0; i < 30; i++) {
      const pName = names[i % names.length];
      const pId = (i % names.length) + 1; // Basic IDs for sprites

      const stats: Stats = {
        hp: 50 + Math.floor(Math.random() * 50),
        attack: 50 + Math.floor(Math.random() * 50),
        defense: 50 + Math.floor(Math.random() * 50),
        speed: 50 + Math.floor(Math.random() * 50),
        specialAttack: 50 + Math.floor(Math.random() * 50),
        specialDefense: 50 + Math.floor(Math.random() * 50)
      };

      const playerPokemon: PlayerPokemon = {
        id: i,
        alias: Math.random() > 0.5 ? `${pName}ito` : null,
        pokemon: pId,
        lvl: 5 + Math.floor(Math.random() * 95),
        exp: Math.floor(Math.random() * 10000),
        iv: stats,
        movs: [],
        gender: Math.random() > 0.5 ? 'male' : 'female',
        shiny: Math.random() > 0.9
      };

      this.pcPokemons.push({
        isSelected: false,
        pokemon: playerPokemon
      });
    }
  }

  get selectedCount(): number {
    return this.pcPokemons.filter(p => p.isSelected).length;
  }

  toggleSelection(index: number) {
    const pkmn = this.pcPokemons[index];
    if (pkmn.isSelected) {
      pkmn.isSelected = false;
    } else {
      if (this.selectedCount < 6) {
        pkmn.isSelected = true;
      } else {
        alert('Solo puedes llevar 6 Pokémon en tu equipo.');
      }
    }
  }

  getPokemonImageUrl(pokemonId: number): string {
    // We use a simple PokeAPI sprite URL. You can map IDs properly in the future.
    let mappedId = pokemonId;
    if (pokemonId > 10) mappedId = Math.floor(Math.random() * 150) + 1; // fallback
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mappedId}.png`;
  }

  saveTeam() {
    const selectedIndices = this.pcPokemons
      .map((p, index) => p.isSelected ? index : -1)
      .filter(index => index !== -1);

    alert('¡Equipo guardado con éxito! Índices: ' + selectedIndices.join(', '));
    // Here we can navigate back or stay in PC
  }

  closeModal() {
    this.router.navigate(['/play']);
  }
}

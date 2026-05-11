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
  boxes: PcPlayerPokemon[][] = [];
  currentBox = 0;
  pcPokemons: PcPlayerPokemon[] = [];
  currentTeam: PlayerPokemon[] = [];

  constructor() {
    this.generateMockData();
    this.loadTeam();
  }

  generateMockData() {
    // Generate 30 fake pokemons
    const names = ['Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle', 'Gengar', 'Snorlax', 'Dragonite', 'Mewtwo', 'Eevee', 'Lucario'];

    for (let box = 0; box < 3; box++) {
      this.boxes[box] = [];
      const numPokemons = box === 0 ? 30 : 0;
      for (let i = 0; i < numPokemons; i++) {
        const pName = names[i % names.length];
        const pId = (i % names.length) + 1;

        const stats: Stats = {
          hp: 50 + Math.floor(Math.random() * 50),
          attack: 50 + Math.floor(Math.random() * 50),
          defense: 50 + Math.floor(Math.random() * 50),
          speed: 50 + Math.floor(Math.random() * 50),
          specialAttack: 50 + Math.floor(Math.random() * 50),
          specialDefense: 50 + Math.floor(Math.random() * 50)
        };

        const playerPokemon: PlayerPokemon = {
          id: i + box * 30,
          alias: Math.random() > 0.5 ? `${pName}ito` : null,
          pokemon: pId,
          lvl: 5 + Math.floor(Math.random() * 95),
          exp: Math.floor(Math.random() * 10000),
          iv: stats,
          movs: [],
          gender: Math.random() > 0.5 ? 'male' : 'female',
          shiny: Math.random() > 0.9
        };

        this.boxes[box].push({
          isSelected: false,
          pokemon: playerPokemon
        });
      }
    }
    this.pcPokemons = this.boxes[this.currentBox];
  }

  loadTeam() {
    const saved = localStorage.getItem('pokemonTeam');
    if (saved) {
      this.currentTeam = JSON.parse(saved);
    }
  }

  get selectedCount(): number {
    return this.pcPokemons.filter(p => p.isSelected).length;
  }

  toggleSelection(index: number) {
    const pkmn = this.pcPokemons[index];
    if (pkmn.isSelected) {
      pkmn.isSelected = false;
      return;
    }

    const selected = this.selectedCount;
    if (selected < 6) {
      pkmn.isSelected = true;
    } else {
      alert('Solo puedes llevar 6 Pokémon en tu equipo.');
    }
  }

  getPokemonImageUrl(pokemonId: number): string {
    // We use a simple PokeAPI sprite URL. You can map IDs properly in the future.
    let mappedId = pokemonId;
    if (pokemonId > 10) mappedId = Math.floor(Math.random() * 150) + 1; // fallback
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${mappedId}.png`;
  }

  saveTeam() {
    const selected = this.pcPokemons.filter(p => p.isSelected).map(p => p.pokemon);
    const existingIds = new Set(this.currentTeam.map(p => p.id));
    const newPokemons = selected.filter(p => !existingIds.has(p.id));
    if (this.currentTeam.length + newPokemons.length > 6) {
      alert('No puedes guardar más de 6 Pokémon en tu equipo. Elimina alguno antes de guardar.');
      return;
    }
    this.currentTeam = [...this.currentTeam, ...newPokemons];
    localStorage.setItem('pokemonTeam', JSON.stringify(this.currentTeam));
    alert('¡Equipo guardado con éxito!');
  }

  removeFromTeam(index: number) {
    this.currentTeam.splice(index, 1);
    localStorage.setItem('pokemonTeam', JSON.stringify(this.currentTeam));
  }

  prevBox() {
    if (this.currentBox > 0) {
      this.currentBox--;
      this.pcPokemons = this.boxes[this.currentBox];
    }
  }

  nextBox() {
    if (this.currentBox < 2) {
      this.currentBox++;
      this.pcPokemons = this.boxes[this.currentBox];
    }
  }

  moveSelectedToBox(boxIndex: number) {
    if (boxIndex === this.currentBox) return;
    const selected = this.pcPokemons.filter(p => p.isSelected);
    selected.forEach(p => {
      p.isSelected = false;
      this.boxes[boxIndex].push(p);
    });
    this.pcPokemons = this.pcPokemons.filter(p => !selected.includes(p));
  }

  closeModal() {
    this.router.navigate(['/play']);
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon, pokemonSpriteUrl } from 'shared_types';

@Component({
  selector: 'app-pokemon-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-grid.html',
  styleUrl: './pokemon-grid.css'
})
export class PokemonGrid {
  @Input() available: Pokemon[] = [];
  @Input() selectedIndexes: number[] = [];
  @Input() maxSelection: number | null = null;
  @Output() onSelect = new EventEmitter<number[]>();

  sprite(pokemon: Pokemon): string {
    return pokemonSpriteUrl(pokemon.id);
  }

  selectPokemon(id: number) {
    let newSelection = [...this.selectedIndexes];
    if (newSelection.includes(id)) {
      newSelection = newSelection.filter(x => x !== id);
    } else {
      if (this.maxSelection === null || newSelection.length < this.maxSelection) {
        newSelection.push(id);
      } else if (this.maxSelection === 1) {
        newSelection = [id]; // Replace if max is 1
      } else {
        return; // Max reached
      }
    }
    this.onSelect.emit(newSelection);
  }
}

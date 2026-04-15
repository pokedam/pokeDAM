import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Player, Pokemon, PokeState } from '../../models/game.models';
import { CommonModule, NgClass } from '@angular/common';
import { PokemonChip } from '../pokemon-chip/pokemon-chip';

@Component({
  selector: 'app-player-tile',
  standalone: true,
  imports: [CommonModule, PokemonChip, NgClass],
  templateUrl: './player-tile.html',
  styleUrl: './player-tile.css'
})
export class PlayerTile {
  @Input({ required: true }) player!: Player;
  @Input() selectedPokemons: Pokemon[] = [];
  @Output() pokemonSelect = new EventEmitter<{player: Player, pokemon: Pokemon}>();

  readonly TOTAL_POKEBALLS = 8;

  onPokemonClick(pokemon: Pokemon) {
    this.pokemonSelect.emit({ player: this.player, pokemon });
  }

  isPokemonSelected(pokemon: Pokemon): boolean {
    return this.selectedPokemons.some(p => p === pokemon);
  }

  getFullPokeStates(states: PokeState[]): PokeState[] {
    const result: PokeState[] = [...states];
    while (result.length < this.TOTAL_POKEBALLS) {
      result.push('unavailable');
    }
    return result;
  }
}

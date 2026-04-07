import { Component, Input } from '@angular/core';
import { Player, PokeState } from '../../models/game.models';
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

  readonly TOTAL_POKEBALLS = 8;

  getFullPokeStates(states: PokeState[]): PokeState[] {
    const result: PokeState[] = [...states];
    while (result.length < this.TOTAL_POKEBALLS) {
      result.push('unavailable');
    }
    return result;
  }
}

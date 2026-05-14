import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonChip } from '../pokemon-chip/pokemon-chip';
import { InGamePokemon, PlayerId, pokemonSpriteUrl } from 'shared_types';
import { Player } from '../../services/group.service';

@Component({
  selector: 'app-player-tile',
  standalone: true,
  imports: [CommonModule, PokemonChip],
  templateUrl: './player-tile.html',
  styleUrl: './player-tile.css'
})
export class PlayerTile {
  @Input() isUser = false;
  @Input({ required: true }) player!: Player;
  //@Input() selectedPokemons: InGamePokemon[] = [];
  @Output() pokemonSelect = new EventEmitter<{ player: Player, pokemon: InGamePokemon | null }>();


  get selectedPokemons(): InGamePokemon[] {
    return this.player.actives.filter(p => p !== null);
  }
  readonly TOTAL_POKEBALLS = 8;
}

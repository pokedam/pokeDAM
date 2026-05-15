import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonChip } from '../pokemon-chip/pokemon-chip';
import { InGamePokemon, PlayerId, PokemonRef, pokemonSpriteUrl } from 'shared_types';
import { Player } from '../../services/group.service';
import { SelectionMode, Selector } from '../group-screens/in-game/in-game';

@Component({
  selector: 'app-player-tile',
  standalone: true,
  imports: [CommonModule, PokemonChip],
  templateUrl: './player-tile.html',
  styleUrl: './player-tile.css'
})
export class PlayerTile implements OnInit {
  @Input() isUser = false;
  @Input({ required: true }) player!: Player;
  @Input() selectableFn: (ref: PokemonRef) => SelectionMode = () => 'none';

  @Output() pokemonSelect = new EventEmitter<PokemonRef>();


  ngOnInit(): void {
    console.log('player tile init', this.player);
  }
  get selectedPokemons(): InGamePokemon[] {
    return this.player.actives.filter(p => p !== null);
  }
  readonly TOTAL_POKEBALLS = 8;
}

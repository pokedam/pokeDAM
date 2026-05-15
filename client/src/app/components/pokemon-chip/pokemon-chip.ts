import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeBar } from '../life-bar/life-bar';
import { InGamePokemon, pokemonSpriteUrl, pokemon as getPokemon } from 'shared_types';
import { SelectionMode } from '../group-screens/in-game/in-game';

@Component({
  selector: 'app-pokemon-chip',
  standalone: true,
  imports: [CommonModule, LifeBar],
  templateUrl: './pokemon-chip.html',
  styleUrl: './pokemon-chip.css'
})
export class PokemonChip {
  @Input({ required: true }) pokemon: InGamePokemon | null = null;
  @Input() selectionMode: SelectionMode = 'none';



  get name(): string {
    const id = this.pokemon!.pokedexIdx;
    return getPokemon(id).name;
  }

  get sprite(): string {
    return pokemonSpriteUrl(this.pokemon!.pokedexIdx);
  }
}

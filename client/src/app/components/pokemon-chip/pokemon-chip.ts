import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LifeBar } from '../life-bar/life-bar';
import { InGamePokemon, POKEMONS, pokemonSpriteUrl } from 'shared_types';
import { pokemon as getPokemon } from 'shared_types';
@Component({
  selector: 'app-pokemon-chip',
  standalone: true,
  imports: [CommonModule, LifeBar],
  templateUrl: './pokemon-chip.html',
  styleUrl: './pokemon-chip.css'
})
export class PokemonChip {
  @Input({ required: true }) pokemon!: InGamePokemon;

  get name(): string {
    const id = this.pokemon.pokedexIdx;
    return getPokemon(id).name;
  }

  get sprite(): string {
    return pokemonSpriteUrl(this.pokemon.pokedexIdx);
  }
}

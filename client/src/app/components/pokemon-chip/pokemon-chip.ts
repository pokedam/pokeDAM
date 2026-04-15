import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Pokemon } from '../../models/game.models';
import { CommonModule } from '@angular/common';
import { LifeBar } from '../life-bar/life-bar';

@Component({
  selector: 'app-pokemon-chip',
  standalone: true,
  imports: [CommonModule, LifeBar],
  templateUrl: './pokemon-chip.html',
  styleUrl: './pokemon-chip.css'
})
export class PokemonChip {
  @Input({ required: true }) pokemon!: Pokemon;
  @Input() isSelected: boolean = false;
  @Output() pokemonClick = new EventEmitter<Pokemon>();

  onClick() {
    this.pokemonClick.emit(this.pokemon);
  }
}

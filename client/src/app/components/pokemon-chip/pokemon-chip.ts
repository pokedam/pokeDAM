import { Component, Input } from '@angular/core';
import { Pokemon } from '../../models/game';
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
}

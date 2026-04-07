import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-life-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './life-bar.html',
  styleUrl: './life-bar.css'
})
export class LifeBar {
  @Input({ required: true }) hp!: number;
  @Input({ required: true }) maxHp!: number;

  getHpPercentage(): number {
    return Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
  }

  getHpColorClass(): string {
    const percentage = this.getHpPercentage();
    if (percentage > 50) return 'hp-green';
    if (percentage > 20) return 'hp-yellow';
    return 'hp-red';
  }
}

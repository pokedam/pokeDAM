import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Pokemon, Attack } from '../../models/game.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attack-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attack-overlay.html',
  styleUrl: './attack-overlay.css'
})
export class AttackOverlay implements OnInit, OnDestroy {
  @Input({ required: true }) attacker!: Pokemon;
  @Input({ required: true }) targets!: Pokemon[];
  @Input({ required: true }) attack!: Attack;
  
  @Output() animationComplete = new EventEmitter<void>();

  private timeoutId: any;

  ngOnInit() {
    // Finish animation after 3 seconds
    this.timeoutId = setTimeout(() => {
      this.animationComplete.emit();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

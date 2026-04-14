import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-match',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-match.html',
  styleUrl: '../battle-arena.css',
})
export class CreateMatch {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onCreateMatch = new EventEmitter<{ name: string, password?: string }>();

  newMatchName: string = "Custom Game";
  requiresPassword: boolean = false;
  newMatchPassword: string = '';

  cancel() {
    this.onCancel.emit();
  }

  createMatch() {
    this.onCreateMatch.emit({
      name: this.newMatchName,
      password: this.requiresPassword ? this.newMatchPassword : undefined
    });
  }
}

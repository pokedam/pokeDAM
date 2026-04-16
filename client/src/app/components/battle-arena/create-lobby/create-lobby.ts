import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-lobby',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-lobby.html',
  styleUrl: '../battle-arena.css',
})
export class CreateLobby {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onCreateLobby = new EventEmitter<{ name: string, password?: string }>();

  newMatchName: string = "Custom Game";
  requiresPassword: boolean = false;
  newMatchPassword: string = '';

  cancel() {
    this.onCancel.emit();
  }

  createLobby() {
    this.onCreateLobby.emit({
      name: this.newMatchName,
      password: this.requiresPassword ? this.newMatchPassword : undefined
    });
  }
}

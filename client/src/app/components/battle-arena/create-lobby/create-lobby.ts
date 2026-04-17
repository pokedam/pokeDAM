import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-lobby',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-lobby.html',
  styleUrl: '../battle-arena.css',
})
export class CreateLobby implements OnInit {
  @Input({ required: true }) userName!: string;
  @Input() initialName: string = '';

  @Output() onCancel = new EventEmitter<{ name: string, requiresPassword: boolean }>();
  @Output() onCreateLobby = new EventEmitter<{ name: string, password: string | null }>();

  name: string = '';
  password: string | null = null;
  hasPassword: boolean = false;

  ngOnInit() {
    this.name = this.initialName || `${this.userName}'s Game`;
  }

  cancel() {
    this.onCancel.emit({ name: this.name, requiresPassword: this.password != null });
  }

  hasValidPassword(): boolean {
    return this.hasPassword && (this.password == null || this.password.trim() === '');
  }

  createLobby() {
    this.onCreateLobby.emit({
      name: this.name,
      password: this.password,
    });
  }
}

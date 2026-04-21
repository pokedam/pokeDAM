import { Component, EventEmitter, Output, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-join-lobby-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './join-lobby-password.html',
  styleUrl: '../battle-arena.css',
})
export class JoinLobbyPassword implements AfterViewInit {
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  @Input({ required: true }) lobbyName!: string;

  @Output() onCancel = new EventEmitter<void>();
  @Output() onJoin = new EventEmitter<string>();

  password: string = '';

  cancel() {
    this.onCancel.emit();
  }

  join() {
    if (this.password.trim() !== '') {
      this.onJoin.emit(this.password);
    }
  }

  isInvalid(): boolean {
    return this.password.trim() === '';
  }

  ngAfterViewInit() {
    this.passwordInput.nativeElement.focus();
  }
}

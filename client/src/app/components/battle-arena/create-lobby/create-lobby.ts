import { Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-lobby',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-lobby.html',
  styleUrl: '../battle-arena.css',
})
export class CreateLobby implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

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

  ngAfterViewInit() {
    this.nameInput.nativeElement.focus();
    // Select the text to make it easy to overwrite the default name
    this.nameInput.nativeElement.select();
  }

  onPasswordToggle(value: boolean) {
    if (value) {
      setTimeout(() => {
        this.passwordInput.nativeElement.focus();
      }, 0);
    }
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

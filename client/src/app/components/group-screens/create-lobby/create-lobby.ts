import { Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentHeader } from '../../content-header/content-header';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-lobby',
  standalone: true,
  imports: [FormsModule, ContentHeader],
  templateUrl: './create-lobby.html',
  styleUrl: '../battle-arena.css',
})
export class CreateLobby implements OnInit, AfterViewInit {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  //@Input({ required: true }) userName!: string;
  @Input() initialName: string | null = null;
  @Input() initialHasPassword: boolean = false;

  @Output() onCancel = new EventEmitter<{ name: string, requiresPassword: boolean }>();
  @Output() onCreateLobby = new EventEmitter<{ name: string, password: string | null }>();

  auth = inject(AuthService);

  name: string = '';
  password: string | null = null;
  hasPassword: boolean = false;

  ngOnInit() {
    if(this.initialName != null && this.initialName.trim().length != 0) this.name = this.initialName;
    else{
      const nickname = this.auth.auth()?.user.nickname;
      this.name = nickname ? `${nickname}'s Game` : 'New Game';
    }
    
    this.hasPassword = this.initialHasPassword;
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
    this.onCancel.emit({ name: this.name, requiresPassword: this.hasPassword });
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

import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-dialog',
  imports: [FormsModule],
  templateUrl: './login-dialog.html',
  styleUrl: './login-dialog.css',
})
export class LoginDialog {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  username = '';
  password = '';
  isLoading = false;

  onLogin() {
    if (!this.username || !this.password) return;
    this.isLoading = true;

    setTimeout(() => {
      // TODO: Implement Login
      this.isLoading = false;

      this.loginSuccess.emit();
    }, 800);
  }

  onLoginWithGoogle() {
    this.isLoading = true;
    // Placeholder for Google OAuth flow
    setTimeout(() => {
      this.isLoading = false;
      this.loginSuccess.emit();
    }, 800);
  }

  onClose() {
    this.close.emit();
  }
}

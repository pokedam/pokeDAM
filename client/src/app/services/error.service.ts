import { Injectable, signal } from '@angular/core';
import { Ok, Result } from 'shared_types';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessage = signal<string | null>(null);

  unwrap<T>(result: Result<T>): result is Ok<T> {
    if (result.success) return true;

    this.showError(result.message)
    return false;
  }

  showError(message: string) {
    this.errorMessage.set(message);
  }

  clearError() {
    this.errorMessage.set(null);
  }
}

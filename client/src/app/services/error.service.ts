import { Injectable, signal } from '@angular/core';
import { Ok, Result } from 'shared_types';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  errorMessage = signal<string | null>(null);
  errorCallback: (() => void) | null = null;

  unwrap<T>(result: Result<T>, then?: (() => void)): result is Ok<T> {
    if (result.success) return true;

    this.showError(result.message, then)

    return false;
  }

  showError(message: string, then?: (() => void)) {
    this.errorMessage.set(message);
    this.errorCallback = then || null;
  }

  clearError() {
    this.errorMessage.set(null);
    if (this.errorCallback)
      this.errorCallback();
    this.errorCallback = null;
  }
}

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

    this.show(result.message, then)

    return false;
  }

  show(message: string, then?: (() => void)) {
    this.errorMessage.set(message);
    this.errorCallback = then || null;
  }

  clear() {
    this.errorMessage.set(null);
    if (this.errorCallback)
      this.errorCallback();
    this.errorCallback = null;
  }
}

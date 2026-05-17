import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  public get isTauri(): boolean {
    return !!(window as any).__TAURI__ || !!(window as any).__TAURI_INTERNALS__;
  }

  public get isDev(): boolean {
    return !this.isTauri && window.location.hostname === 'localhost';
  }

  public get backendUrl(): string {
    return this.isTauri
      ? 'http://51.103.210.63'
      : window.location.hostname === 'localhost'
        ? 'http://localhost:8080'
        : window.location.origin;
  }
}

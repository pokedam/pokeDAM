import { effect, EffectRef, inject, Injectable, Injector, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Result, INVALID_JWT_MESSAGE } from 'shared_types';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private auth = inject(AuthService);
  private error = inject(ErrorService);
  private injector = inject(Injector);
  private effect: EffectRef | null = null;
  private _socket = signal<Socket | null>(null);

  readonly socket = this._socket.asReadonly();

  init() {
    if (this.effect) return;

    this.effect = effect(() => {
      const auth = this.auth.auth();
      if (auth) {
        this.connect(auth.idToken)
          .subscribe({
            error: (err) => {
              if (err.message === INVALID_JWT_MESSAGE) {
                this.auth.refreshTokens().subscribe({
                  error: (err) => this.error.show(err)
                })
              } else this.error.show(err);
            }
          })
      }
    }, { injector: this.injector });
  }

  dispose() {
    this.effect?.destroy();
    this.effect = null;
    this.socket()?.disconnect();
  }

  ngOnDestroy(): void {
    this.dispose();
  }

  private connect(token: string): Observable<void> {
    return new Observable((observer) => {
      this._socket.update((oldSocket) => {
        if (oldSocket) return oldSocket;

        const backendUrl = 'http://localhost:8080';
        const socket = io(backendUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          this._socket.set(socket);
          observer.next(undefined);
        });

        socket.on('connect_error', async (err) => {
          this._socket.set(null);
          observer.error(err);
          observer.complete();
        });

        socket.on('disconnect', () => observer.complete());

        return oldSocket;
      });
    });
  }

  emit<In, Out>(route: string, data?: In): Observable<Out> {
    return new Observable((observer) => {
      const socket = this._socket()
      if (!socket) return;

      const callback = (response: Result<Out>) => {
        if (response.success) observer.next(response.content);
        else observer.error(response);
        observer.complete();
      };

      if (typeof data === 'undefined') socket.emit(route, callback);
      else socket.emit(route, data, callback);
    });
  }

  on<Out>(route: string, listener: (data: Out) => void) {
    this._socket()?.on(route, listener);
  }

  off<Out>(route: string, listener?: (data: Out) => void) {
    this._socket()?.off(route, listener);
  }

}
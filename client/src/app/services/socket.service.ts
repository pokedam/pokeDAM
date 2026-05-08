import { Injectable, signal } from '@angular/core';
import { DisconnectDescription, io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Result } from 'shared_types/dist/result';


@Injectable({ providedIn: 'root' })
export class SocketService {
  private _socket = signal<Socket | null>(null);

  readonly socket = this._socket.asReadonly();

  connect(token: string): Observable<unknown> {

    return new Observable((observer) => {
      this._socket.update((oldSocket) => {
        if (oldSocket) {
          if ((oldSocket.auth as any).token === token) return oldSocket; //already connected
          oldSocket.disconnect();
        }

        const socket =
          io('http://localhost:8080', {
            auth: { token },
          });
        //this._socket = socket;

        socket.on('connect', () => {
          this._socket.set(socket);
          observer.next(undefined);
        });
        socket.on('connect_error', (err) => {
          this._socket.set(null);
          observer.error(err);
          observer.complete();
        });
        socket.on('disconnect', () => observer.complete());
        return oldSocket;
      });
    });
  }

  disconnect(): void {
    this._socket.update((socket) => {
      socket?.disconnect();
      return null;
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

interface SocketReservedEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (reason: Socket.DisconnectReason, description?: DisconnectDescription) => void;
}
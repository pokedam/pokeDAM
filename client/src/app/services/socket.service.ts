import { Injectable, signal } from '@angular/core';
import { DisconnectDescription, io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SocketService {
  private _connected = signal<Socket | null>(null);

  readonly socket = this._connected.asReadonly();

  connect(token: string): Observable<unknown> {

    return new Observable((observer) => {
      this._connected.update((oldSocket) => {
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
          this._connected.set(socket);
          observer.next(undefined);
        });
        socket.on('connect_error', (err) => {
          this._connected.set(null);
          observer.error(err);
          observer.complete();
        });
        socket.on('disconnect', () => observer.complete());
        return oldSocket;
      });
    });
  }

  disconnect(): void {
    this._connected.update((socket) => {
      socket?.disconnect();
      return null;
    });
  }

  // emit<Ev extends EventNames<DefaultEventsMap>>(ev: Ev, ...args: EventParams<DefaultEventsMap, Ev>) {
  //   this._socket?.emit(ev, ...args);
  // }

  // on<Ev extends ReservedOrUserEventNames<SocketReservedEvents, DefaultEventsMap>>(
  //   event: string,
  //   listener: ReservedOrUserListener<SocketReservedEvents, DefaultEventsMap, Ev>,
  // ) {
  //   this._socket?.on(event, listener);
  // }

  // off<Ev extends ReservedOrUserEventNames<SocketReservedEvents, DefaultEventsMap>>(
  //   event: string,
  //   listener?: ReservedOrUserListener<SocketReservedEvents, DefaultEventsMap, Ev>,
  // ) {
  //   this._socket?.off(event, listener as any);
  // }


}

interface SocketReservedEvents {
  connect: () => void;
  connect_error: (err: Error) => void;
  disconnect: (reason: Socket.DisconnectReason, description?: DisconnectDescription) => void;
}
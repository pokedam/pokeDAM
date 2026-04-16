import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, filter } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LobbySocketClient {

  socket!: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);
  connected$ = this.connectedSubject.asObservable().pipe(filter(c => c));

  private auth = inject(AuthService);
  private currentToken: string | null = null;

  constructor() {

    this.auth.auth$.subscribe(auth => {

      if (!auth?.idToken) return;

      // Si el token es el mismo, no hacemos nada
      if (this.currentToken === auth.idToken) return;
      this.currentToken = auth.idToken;

      // Si el token ha fallado/cambiado y ya había un socket, lo desconectamos para recrearlo con la nueva URL
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io('http://localhost:8080', {
        auth: { token: auth.idToken },
        reconnectionDelay: 5000,
      });

      this.socket.on('connect', () => {
        this.connectedSubject.next(true);
      });

      this.socket.on('disconnect', () => {
        this.connectedSubject.next(false);
      });
    });
  }
}
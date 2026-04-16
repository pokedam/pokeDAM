import { Injectable, inject } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, filter } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LobbySocketClient {

  client!: Client;
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

      // Si el token ha fallado/cambiado y ya había un cliente, lo desactivamos para recrearlo con la nueva URL
      if (this.client) {
        this.client.deactivate();
      }

      this.client = new Client({
        webSocketFactory: () =>
          new SockJS(`http://localhost:8080/ws?token=${auth.idToken}`),
        reconnectDelay: 5000,
        onConnect: () => {
          this.connectedSubject.next(true);
        },
        onDisconnect: () => {
          this.connectedSubject.next(false);
        }
      });

      this.client.activate();
    });
  }
}
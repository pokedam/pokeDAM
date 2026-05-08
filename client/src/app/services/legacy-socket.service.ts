// import { Injectable, effect, inject } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { BehaviorSubject, filter } from 'rxjs';
// import { AuthService } from './auth.service';
// import { ErrorService } from './error.service';

// @Injectable({ providedIn: 'root' })
// export class SocketService {

//   socket!: Socket;
//   private connectedSubject = new BehaviorSubject<boolean>(false);
//   connected$ = this.connectedSubject.asObservable().pipe(filter(c => c));

//   private auth = inject(AuthService);
//   private error = inject(ErrorService);
//   private currentToken: string | null = null;

//   constructor() {
//     effect(() => {
//       console.log("New auth state, updating sockets!");
//       let auth = this.auth.auth();

//       if (!auth?.idToken) return;

//       // Si el token es el mismo, no hacemos nada
//       if (this.currentToken === auth.idToken) return;
//       this.currentToken = auth.idToken;

//       // Si el token ha fallado/cambiado y ya había un socket, lo desconectamos para recrearlo con la nueva URL
//       if (this.socket) {
//         this.socket.disconnect();
//       }
//       console.log('Connecting socket with token:', auth.idToken);
//       this.socket = io('http://localhost:8080', {
//         auth: { token: auth.idToken },
//         reconnectionDelay: 5000,
//       });
//       console.log('Socket created, waiting for connection...');

//       this.socket.on('connect', () => {
//         console.log('Socket connected');
//         this.connectedSubject.next(true);
//       });

//       this.socket.on('disconnect', () => {
//         this.connectedSubject.next(false);
//       });

//       this.socket.on('connect_error', async (err: Error) => {
//         if (err.message && err.message.toLowerCase().includes('expired')) {
//           console.warn('Socket connection error: Token expired. Attempting to refresh tokens...');
//           this.auth.refreshTokens().subscribe();
//           return;
//         }
//         this.error.show('Error connecting to server: ' + err.message);
//       });
//     });
//   }
// }
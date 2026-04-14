import { Injectable, inject, NgZone } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Lobby {
  name: string;
  password?: string;
  hostId: string;
  state: 'WAITING' | 'PLAYING';
  readys: Record<string, boolean>;
  hasPassword?: boolean;
}

export interface ServerEvent {
  event: string;
  payload: any;
}

@Injectable({
  providedIn: 'root'
})
export class LobbySocketService {
  private client!: Client;

  // RXJS Subjects para que Angular se actualice de forma reactiva
  private lobbiesSubject = new BehaviorSubject<Map<string, Lobby>>(new Map());
  public lobbies$: Observable<Map<string, Lobby>> = this.lobbiesSubject.asObservable();

  private currentLobbySubject = new BehaviorSubject<[string, Lobby] | null>(null);
  public currentLobby: Observable<[string, Lobby] | null> = this.currentLobbySubject.asObservable();

  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  constructor() {
    // Al instanciar, nos suscribimos al idToken$ de AuthService. 
    // Solo cuando devuelva un token valido, iniciamos el handshake de Websockets/STOMP.
    this.authService.idToken$.subscribe(token => {
      if (token && (!this.client || !this.client.active)) {
        this.initializeConnection(token);
      }
    });
  }

  private initializeConnection(token: string) {
    this.client = new Client({
      // Le pasamos el token en la configuracion de SockJS con parametro de la URL.
      // IMPORTANTE: Un WebSocket de navegador estándar no admite enviar cabeceras Authorization HTTP, solo query params para el primer handshake.
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
      debug: (str) => console.log('STOMP: ' + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('Conectado a STOMP');

      // 1. Nos suscribimos al topic para escuchar actualizaciones en tiempo real
      this.client.subscribe('/topic/lobbies', (updateMessage: Message) => {
        const event: ServerEvent = JSON.parse(updateMessage.body);
        const currentLobbies = new Map(this.lobbiesSubject.getValue());

        // Extraemos el id (en este caso el hostId)
        const roomId = event.payload?.hostId || event.payload?.id;
        if (event.payload) delete event.payload.id;
        const roomPayload = event.payload as Lobby;

        this.ngZone.run(() => {
          switch (event.event) {
            case 'ADDED':
            case 'COUNT_CHANGE':
              if (roomId) currentLobbies.set(roomId, roomPayload);
              this.lobbiesSubject.next(currentLobbies);
              break;

            case 'REMOVED':
              if (roomId) currentLobbies.delete(roomId);
              this.lobbiesSubject.next(currentLobbies);
              break;

            case 'LOBBIES_UPDATED':
              // Por si recibimos toda la lista del tirón
              const mapFromList = new Map<string, Lobby>();
              if (Array.isArray(event.payload)) {
                for (const r of event.payload) {
                  const id = r.hostId;
                  mapFromList.set(id, r as Lobby);
                }
              }
              this.lobbiesSubject.next(mapFromList);
              break;
          }
        });
      });

      // 2. Pedimos el estado inicial de la lista de salas en paralelo al controlador
      this.client.subscribe('/app/lobbies', (message: Message) => {
        const roomsArr: any[] = JSON.parse(message.body);
        const initialMap = new Map<string, Lobby>();

        for (const r of roomsArr) {
          const id = r.hostId;
          initialMap.set(id, r as Lobby);
        }

        this.ngZone.run(() => {
          this.lobbiesSubject.next(initialMap);
        });
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  // --- ACCIONES DEL USUARIO ---

  createRoom(playerId: string, name: string, password?: string) {
    this.client.publish({
      destination: '/app/lobby.create',
      body: JSON.stringify({ playerId, name, password })
    });
  }

  joinRoom(roomId: string, playerId: string, password?: string) {
    this.client.publish({
      destination: '/app/lobby.join',
      body: JSON.stringify({ roomId, playerId, password })
    });
  }

  setReady(playerId: string, isReady: boolean) {
    this.client.publish({
      destination: '/app/lobby.ready',
      body: JSON.stringify({ playerId, isReady })
    });
  }

  startGame(playerId: string) {
    this.client.publish({
      destination: '/app/lobby.start',
      body: JSON.stringify({ playerId })
    });
  }

  leaveRoom(playerId: string) {
    this.client.publish({
      destination: '/app/lobby.leave',
      body: JSON.stringify({ playerId })
    });
    this.leaveCurrentRoomSubscription();
  }

  // --- MANEJO DE LA SALA ACTUAL ---

  private roomSubscription: any = null;

  public subscribeToRoom(roomId: string) {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }

    this.roomSubscription = this.client.subscribe('/topic/room/' + roomId, (message: Message) => {
      const event: ServerEvent = JSON.parse(message.body);

      this.ngZone.run(() => {
        switch (event.event) {
          case 'PLAYER_JOINED':
          case 'PLAYER_LEFT':
          case 'PLAYER_READY': {
            const roomData = event.payload.room;
            const id = roomData.hostId || roomData.id || roomId;
            delete roomData.id;
            this.currentLobbySubject.next([id, roomData]);
            break;
          }
          case 'GAME_STARTED': {
            const roomData = event.payload;
            const id = roomData.hostId || roomData.id || roomId;
            delete roomData.id;
            this.currentLobbySubject.next([id, roomData]);
            alert('¡La partida ha comenzado!'); // Esto deberías manejarlo en la UI
            break;
          }
        }
      });
    });
  }

  private leaveCurrentRoomSubscription() {
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
      this.roomSubscription = null;
    }
    this.currentLobbySubject.next(null);
  }
}
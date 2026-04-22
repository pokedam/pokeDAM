export interface Lobby {
    name: string;
    password?: string | null;
    hostId: number;
    hostNickname: string | null;
    joiners: Map<number, Joiner>;
    maxPlayers: number;
}

export interface Joiner {
    isReady: boolean;
    nickname: string | null;
}

export interface LobbyResponse {
    name: string;
    hostId: number;
    hostNickname: string | null;
    joiners: {
        id: number;
        isReady: boolean;
        nickname: string | null;
    }[];
    maxPlayers: number;
}

export interface LobbyJoinRequest{
    id: string;
    password?: string | null;
}

export interface LobbyJoinResponse{
    nickname: string;
    playerCount: number;
}

export interface LobbySummaryResponse {
    id: string;
    name: string;
    hasPassword: boolean;
    playerCount: number;
    maxPlayers: number;
}

export interface LobbyCreationRequest {
    name: string | null;
    password: string | null;
}

export interface LobbyCreatedResponse {
    id: string;
}

export interface HostLeftResponse {
    newHostId: number | null;
}

export interface JoinerLeftResponse {
    id: number;
}

export type LeftResponse = HostLeftResponse | JoinerLeftResponse;

export interface LobbyBrowserEvent {
    id: string;
    playerCount: number;    
}

export type InLobbyEvent = PlayerReadyEvent | PlayerJoinedEvent | PlayerLeftEvent | HostLeftEvent;

export interface PlayerReadyEvent {
    type: 'ready';
    id: number; 
    isReady: boolean;
}

export interface PlayerJoinedEvent{
    type: 'joined';
    id: number;
    nickname: string ;
}

export interface PlayerLeftEvent{
    type: 'left';
    id: number;
}

export interface HostLeftEvent{    
    type: 'hostLeft';
    newHostId: number;
}

export const inLobbyEventFactory = {
  ready(id: number, isReady: boolean): PlayerReadyEvent {
    return {
      type: 'ready',
      id,
      isReady,
    };
  },

  joined(id: number, nickname: string): PlayerJoinedEvent {
    return {
      type: 'joined',
      id,
      nickname,
    };
  },

  left(id: number): PlayerLeftEvent {
    return {
      type: 'left',
      id,
    };
  },

  hostLeft(newHostId: number): HostLeftEvent {
    return {
      type: 'hostLeft',
      newHostId,
    };
  },
};
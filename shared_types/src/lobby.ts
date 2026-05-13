import { BoardResponse, PlayerResponse } from "./game";

export interface LobbyResponse {
    name: string;
    hostId: number;
    hostNickname: string;
    joiners: {
        id: number;
        isReady: boolean;
        nickname: string;
    }[];
    maxPlayers: number;
}

export type GroupResponse = LobbiesResponse | GameResponse;

export interface LobbiesResponse {
    type: "lobbies",
    lobbies: LobbySummaryResponse[],
}

export interface GameResponse {
    type: "game",
    board: BoardResponse,
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

export interface LobbyJoinRequest {
    id: string;
    password?: string | null;
}

export interface LobbyCreatedEvent {
    type: "created",
    res: LobbySummaryResponse,
}

export interface LobbyChangedEvent {
    type: "changed",
    id: string,
    count: number,
}

export type LobbyBrowserEvent = LobbyCreatedEvent | LobbyChangedEvent;

export type InLobbyEvent =
    | PlayerReadyEvent
    | PlayerJoinedEvent
    | PlayerLeftEvent
    | HostLeftEvent
    | StartGameEvent
    | TurnCompletedEvent;

export interface PlayerReadyEvent {
    type: 'ready';
    id: number;
    isReady: boolean;
}

export interface PlayerJoinedEvent {
    type: 'joined';
    id: number;
    nickname: string;
}

export interface PlayerLeftEvent {
    type: 'left';
    id: number;
}

export interface HostLeftEvent {
    type: 'host left';
    newHostId: number | null;
}

export interface StartGameEvent {
    type: "start",
    board: GameResponse,
}

export interface TurnCompletedEvent {
    type: "turn",
}

export const lobbyFactory = {
    create(name: string | null = null, password: string | null = null): LobbyCreationRequest {
        return { name, password };
    },

    createdEvent(res: LobbySummaryResponse): LobbyCreatedEvent {
        return {
            type: "created",
            res,
        };
    },

    changedEvent(id: string, count: number): LobbyChangedEvent {
        return {
            type: "changed",
            id,
            count
        };
    },

    join(id: string, password: string | null = null): LobbyJoinRequest {
        return { id, password };
    },

    readyEvent(id: number, isReady: boolean): PlayerReadyEvent {
        return {
            type: 'ready',
            id,
            isReady,
        };
    },

    joinedEvent(id: number, nickname: string): PlayerJoinedEvent {
        return {
            type: 'joined',
            id,
            nickname,
        };
    },

    leftEvent(id: number): PlayerLeftEvent {
        return {
            type: 'left',
            id,
        };
    },

    hostLeftEvent(newHostId: number | null): HostLeftEvent {
        return {
            type: 'host left',
            newHostId,
        };
    },
};

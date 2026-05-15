import { BoardResponse, GroupId, PlayerId, PlayerResponse, TurnHistory } from "./game";

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

export interface GroupResponse {
    lobbies: LobbyViewResponse[];
    game: GameResponse | null;
}

export interface GameResponse {
    id: GroupId;
    board: BoardResponse;
}

export interface LobbyViewResponse {
    id: GroupId;
    name: string;
    hasPassword: boolean;
    playerCount: number;
    maxPlayers: number;
}

export interface LobbyCreationRequest {
    name: string;
    password: string | null;
}

export interface LobbyCreatedResponse {
    id: GroupId;
}

export interface LobbyJoinRequest {
    id: GroupId;
    password?: string | null;
}

export interface LobbyCreatedEvent {
    type: "created",
    res: LobbyViewResponse,
}

export interface LobbyChangedEvent {
    type: "changed",
    id: GroupId,
    count: number,
}

export type LobbiesEvent = LobbyCreatedEvent | LobbyChangedEvent;

export type InLobbyEvent =
    | PlayerReadyEvent
    | PlayerJoinedEvent
    | PlayerLeftEvent
    | HostLeftEvent
    | StartGameEvent
    | TurnCompletedEvent;

export interface PlayerReadyEvent {
    type: 'ready';
    id: PlayerId;
    isReady: boolean;
}

export interface PlayerJoinedEvent {
    type: 'joined';
    id: PlayerId;
    nickname: string;
}

export interface PlayerLeftEvent {
    type: 'left';
    id: PlayerId;
}

export interface HostLeftEvent {
    type: 'host left';
    newHostId: PlayerId | null;
}

export interface StartGameEvent {
    type: "start",
    board: BoardResponse,
}

export interface TurnCompletedEvent {
    type: "turn",
    turn: TurnHistory
}

export const lobbyFactory = {
    create(name: string, password: string | null = null): LobbyCreationRequest {
        return { name, password };
    },

    createdEvent(res: LobbyViewResponse): LobbyCreatedEvent {
        return {
            type: "created",
            res,
        };
    },

    changedEvent(id: GroupId, count: number): LobbyChangedEvent {
        return {
            type: "changed",
            id,
            count
        };
    },

    join(id: GroupId, password: string | null = null): LobbyJoinRequest {
        return { id, password };
    },

    readyEvent(id: PlayerId, isReady: boolean): PlayerReadyEvent {
        return {
            type: 'ready',
            id,
            isReady,
        };
    },

    joinedEvent(id: PlayerId, nickname: string): PlayerJoinedEvent {
        return {
            type: 'joined',
            id,
            nickname,
        };
    },

    leftEvent(id: PlayerId): PlayerLeftEvent {
        return {
            type: 'left',
            id,
        };
    },

    hostLeftEvent(newHostId: PlayerId | null): HostLeftEvent {
        return {
            type: 'host left',
            newHostId,
        };
    },
};

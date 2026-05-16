import { InGame as InGame, GroupId, PlayerId, TurnHistory } from "./game";

// A full lobby state, sent to clients to sync with the server when joining a lobby.
export interface LobbyResponse {
    name: string;
    host: LobbyPlayer;
    joiners: (LobbyPlayer & {
        isReady: boolean;
    })[];
    maxPlayers: number;
}

export interface LobbyPlayer {
    id: PlayerId;
    nickname: string;
}

// Initial response when connecting to sockets. 
// Contains the list of lobbies and the game the player is currently in, if any.
export interface WelcomeResponse {
    lobbies: LobbyViewResponse[];
    game: GameGroupResponse | null;
}

// A full game response, with it's group id
export interface GameGroupResponse {
    id: GroupId;
    board: InGame;
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
    | PlayerKickEvent
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

export interface PlayerKickEvent {
    type: 'kick';
    id: PlayerId;
}

export interface HostLeftEvent {
    type: 'host left';
    newHostId: PlayerId | null;
}

export interface StartGameEvent {
    type: "start",
    board: InGame,
}

export interface TurnCompletedEvent {
    type: "turn";
    history: TurnHistory;
    gameEnd: GameEndEvent | undefined;
}

export interface GameEndEvent {
    winner: PlayerId | null;
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

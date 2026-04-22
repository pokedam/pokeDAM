import type { UUID } from "node:crypto";

const lobbies: Map<UUID, Lobby> = new Map();
const players: Map<number, string> = new Map();

export const lobbyService = {
    get,
    getAll,
}

export interface Lobby {
    name: string;
    password?: string | null;
    hostId: number;
    hostNickname: string | null;
    joiners: Map<number, Player>;
    maxPlayers: number;
}

export interface Player {
    isReady: boolean;
    nickname: string | null;
}


export interface LobbyGetAllResponse {
    id: UUID;
    name: string;
    hasPassword: boolean;
    playerCount: number;
    maxPlayers: number;
}

export interface LobbyGetResponse {
    name: string;
    hostId: number;
    hostNickname: string | null;
    joiners: PlayerGetResponse[];
    maxPlayers: number;

}

export interface PlayerGetResponse {
    id: number;
    isReady: boolean;
    nickname: string | null;
}

function lobbyToResponse(id: UUID, lobby: Lobby): LobbyGetAllResponse {
    return {
        id,
        name: lobby.name,
        hasPassword: !!lobby.password,
        playerCount: lobby.joiners.size + 1, // +1 for the host
        maxPlayers: lobby.maxPlayers,
    };
}

function getAll(): LobbyGetAllResponse[] {
    return Array.from(lobbies.entries()).map(([id, lobby]) => lobbyToResponse(id, lobby));
}

function get(id: UUID): LobbyGetResponse | null {
    const lobby = lobbies.get(id);
    if (!lobby) return null;

    return {
        name: lobby.name,
        hostId: lobby.hostId,
        hostNickname: lobby.hostNickname,
        joiners: Array.from(lobby.joiners.entries()).map(([id, player]) => ({
            id,
            ...player,
        })),
        maxPlayers: lobby.maxPlayers,
    };

}
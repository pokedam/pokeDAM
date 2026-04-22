import { lobbies } from "./lobby.js";

export interface GetAllResponse {
    id: string;
    name: string;
    hasPassword: boolean;
    playerCount: number;
    maxPlayers: number;
}

export function getAll(): GetAllResponse[] {
    return Array.from(lobbies.entries()).map(
        ([id, lobby]) => ({
            id,
            name: lobby.name,
            hasPassword: !!lobby.password,
            playerCount: lobby.joiners.size + 1,
            maxPlayers: lobby.maxPlayers,
        })
    );
}
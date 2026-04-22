import { lobbies, type Player } from "./lobby.js";

export interface GetResponse {
    name: string;
    hostId: number;
    hostNickname: string | null;
    joiners: JoinerGetResponse[];
    maxPlayers: number;
}

export interface JoinerGetResponse {
    id: number;
    isReady: boolean;
    nickname: string | null;
}

export function get(id: string): GetResponse | null {
    const lobby = lobbies.get(id);
    if (!lobby) return null;
    return {
        name: lobby.name,
        hostId: lobby.hostId,
        hostNickname: lobby.hostNickname,
        joiners: joiners(lobby.joiners),
        maxPlayers: lobby.maxPlayers,
    };
}

function joiners(map: Map<number, Player>): JoinerGetResponse[] {
    return Array.from(map.entries()).map(([id, player]) => ({
        id,
        ...player,
    }));
};

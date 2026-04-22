import { lobbies, players, type Player } from "./lobby.js";
import { result, type Result } from "../result.js";

export interface HostLeftResponse {
    newHostId: number | null;
}

export interface JoinerLeftResponse {
    id: number;
}

export type LeftResponse = HostLeftResponse | JoinerLeftResponse;

export function leave(playerId: number): Result<LeftResponse> {
    const lobbyId = players.get(playerId);
    if (!lobbyId) return result.conflict("Player with ID " + playerId + "not found on any lobby");
    return leaveWithLobbyId(playerId, lobbyId);
}

export function leaveWithLobbyId(playerId: number, lobbyId: string): Result<LeftResponse> {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict("Lobby with ID " + lobbyId + " not found");

    const player = lobby.joiners.get(playerId);
    if (!player) return result.conflict("Player with ID " + playerId + " not found");

    const isHost = lobby.hostId === playerId;

    if (isHost) {
        const iterator = lobby.joiners.entries().next();

        if (!iterator.done) {
            const [newHostId, newHost] = iterator.value;

            lobby.hostId = newHostId;
            lobby.hostNickname = newHost.nickname;

            lobby.joiners.delete(newHostId);
            return result.new({ newHostId });
        }

        lobbies.delete(lobbyId);
        return result.new({ newHostId: null });
    }

    lobby.joiners.delete(playerId);
    return result.new({ id: playerId });
}
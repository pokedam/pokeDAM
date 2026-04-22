import { lobbies, players, type Player } from "./lobby.js";
import { result, type Result } from "../result.js";

export interface IsReadyRequest {
    isReady: boolean;
}

export function isReady(playerId: number, req: IsReadyRequest): Result<void> {
    const lobbyId = players.get(playerId);
    if (!lobbyId) return result.conflict("Player with ID " + playerId + " is not in a Lobby");

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict("Lobby with ID " + lobbyId + " not found");

    const player = lobby.joiners.get(playerId);
    if (!player) return result.conflict("Player with ID " + playerId + " not found as joiner in lobby with ID " + lobbyId);

    player.isReady = req.isReady;
    return result.new(undefined);
}
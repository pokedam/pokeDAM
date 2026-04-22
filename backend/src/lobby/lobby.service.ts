import { v4 } from "uuid";
import { getUser } from "../database.js";
import { result, type Result } from "../result.js";
import type { Lobby } from "./lobby.js";
import type { LeftResponse, LobbyCreatedResponse, LobbyCreationRequest, LobbyJoinRequest, LobbyJoinResponse, LobbyResponse, LobbySummaryResponse } from "./lobby.models.js";

const lobbies: Map<string, Lobby> = new Map();
const players: Map<number, string> = new Map();

//////////////////////
// Model formatting //
//////////////////////
function response(lobby: Lobby): LobbyResponse {
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

function summaryResponse(id: string, lobby: Lobby): LobbySummaryResponse {
    return {
        id,
        name: lobby.name,
        hasPassword: lobby.password != null,
        playerCount: lobby.joiners.size + 1,
        maxPlayers: lobby.maxPlayers,
    };
}

/////////////////////
// Service actions //
/////////////////////
function get(id: string): Result<LobbyResponse> {
    const lobby = lobbies.get(id);
    return lobby ? result.ok(response(lobby)) : result.notFound("Lobby with ID " + id + " not found");
}

function getAll(): LobbySummaryResponse[] {
    return Array.from(lobbies.entries()).map(([id, lobby]) => summaryResponse(id, lobby));
}


export async function create(hostId: number, request: LobbyCreationRequest, maxPlayers: number = 8): Promise<Result<LobbyCreatedResponse>> {
    if (players.get(hostId)) return result.conflict("Player with Id " + hostId + " is already in a lobby");
    let nickname = (await getUser(hostId)).nickname;
    const lobby = {
        name: request.name ?? nickname + "'s Game",
        password: request.password,
        hostId,
        hostNickname: nickname,
        joiners: new Map(),
        maxPlayers
    };
    const lobbyId = v4();
    lobbies.set(lobbyId, lobby);
    players.set(hostId, lobbyId);
    return result.ok({ id: lobbyId });
}

async function join(playerId: number, req: LobbyJoinRequest): Promise<Result<LobbyJoinResponse>> {
    if (players.get(playerId)) return result.conflict("Player with ID " + playerId + " is already on a lobby");

    const lobby = lobbies.get(req.id);
    if (!lobby) return result.conflict("Lobby with ID " + req.id + " not found");

    if (lobby.password && lobby.password !== req.password)         
        return result.forbidden("Invalid lobby password");
    const nickname = (await getUser(playerId)).nickname ?? "Trainer " + playerId;
    lobby.joiners.set(playerId, {
        isReady: false,
        nickname,
    });
    
    players.set(playerId, req.id);
    return result.ok({
        nickname,
        playerCount: lobby.joiners.size + 1,
    });
}

function leave(playerId: number): Result<LeftResponse> {
    const lobbyId = players.get(playerId);
    if (!lobbyId) return result.conflict("Player with ID " + playerId + "not found on any lobby");

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
            return result.ok({ newHostId });
        }

        lobbies.delete(lobbyId);
        return result.ok({ newHostId: null });
    }

    lobby.joiners.delete(playerId);
    return result.ok({ id: playerId });
}

export function isReady(playerId: number, isReady: boolean): Result<void> {
    const lobbyId = players.get(playerId);
    if (!lobbyId) return result.conflict("Player with ID " + playerId + " is not in a Lobby");

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict("Lobby with ID " + lobbyId + " not found");

    const player = lobby.joiners.get(playerId);
    if (!player) return result.conflict("Player with ID " + playerId + " not found as joiner in lobby with ID " + lobbyId);

    player.isReady = isReady;
    return result.ok(undefined);
}

////////////
// Export //
////////////
export const lobbyService = {
    response,
    summaryResponse,
    get,
    getAll,
    create,
    join,
    leave,
    isReady,
};
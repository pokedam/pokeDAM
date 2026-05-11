import { v4 } from "uuid";
import type {
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    LobbySummaryResponse,
    Result
} from 'shared_types';
import { result } from 'shared_types';
import type { LeftResponse, Lobby, LobbyJoinResponse } from "./lobby.models.js";
import { dbService } from "../db/client.js";
const lobbies: Map<string, Lobby> = new Map();
const players: Map<number, string> = new Map();

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
    return lobby ? result.ok(response(lobby)) : result.notFound(`No lobby with ID ${id} found`);
}

function getAll(): LobbySummaryResponse[] {
    return Array.from(lobbies.entries()).map(([id, lobby]) => summaryResponse(id, lobby));
}


async function create(hostId: number, request: LobbyCreationRequest, maxPlayers: number = 8): Promise<Result<LobbySummaryResponse>> {
    if (players.get(hostId)) return result.conflict(`Player is already in a lobby`);
    let res = (await dbService.user.get(hostId));
    if (!res.success) return res;
    const lobby = {
        name: request.name ?? res.content.nickname,
        password: request.password,
        hostId,
        hostNickname: res.content.nickname,
        joiners: new Map(),
        maxPlayers
    };
    const lobbyId = v4();
    lobbies.set(lobbyId, lobby);
    players.set(hostId, lobbyId);
    return result.ok(summaryResponse(lobbyId, lobby));
}

async function join(playerId: number, req: LobbyJoinRequest): Promise<Result<LobbyJoinResponse>> {
    if (players.get(playerId)) return result.conflict(`Player is already in a lobby`);

    const lobby = lobbies.get(req.id);
    if (!lobby) return result.conflict(`No lobby with ID ${req.id} found`);

    if (lobby.password && lobby.password !== req.password)
        return result.forbidden("Invalid lobby password");
    let res = (await dbService.user.get(playerId));
    if (!res.success) return res;
    let nickname = res.content.nickname;
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
    if (!lobbyId) return result.conflict(`Leave failed: Player is not in a lobby`);
    return leaveLobby(playerId, lobbyId);
}

function kick(targetId: number, playerId: number): Result<LeftResponse> {
    let lobbyId = players.get(targetId);
    if (!lobbyId) return result.conflict(`Cannot kick player: Player is not in a lobby`);

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict(`Cannot kick player: Associated lobby is not available`);

    if (lobby.hostId !== playerId) return result.forbidden(`Cannot kick player: You are not the host of their current lobby`);

    return leaveLobby(targetId, lobbyId);
}

function leaveLobby(playerId: number, lobbyId: string): Result<LeftResponse> {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict(`Leave failed: No lobby with ID ${lobbyId} found`);

    players.delete(playerId);

    if (lobby.hostId === playerId) {
        const iterator = lobby.joiners.entries().next();

        if (!iterator.done) {
            const [newHostId, newHost] = iterator.value;

            lobby.hostId = newHostId;
            lobby.hostNickname = newHost.nickname;

            lobby.joiners.delete(newHostId);
            return result.ok({ type: 'host', newHostId, lobbyId, playerCount: lobby.joiners.size + 1 });
        }

        lobbies.delete(lobbyId);
        return result.ok({ type: 'host', newHostId: null, lobbyId, playerCount: 0 });
    } else
        if (!lobby.joiners.delete(playerId))
            return result.conflict(`Leave failed: Player is not in the lobby`);

    return result.ok({ type: 'joiner', joinerId: playerId, lobbyId, playerCount: lobby.joiners.size + 1 });
}

function isReady(playerId: number, isReady: boolean): Result<string> {
    const lobbyId = players.get(playerId);
    if (!lobbyId) return result.conflict("Change ready status failed: Player is not in a lobby");

    const lobby = lobbies.get(lobbyId);
    if (!lobby) return result.conflict("Change ready status failed: Associated lobby is not available");

    const player = lobby.joiners.get(playerId);
    if (!player) return result.conflict("Change ready status failed: Player is not in this lobby");

    player.isReady = isReady;
    return result.ok(lobbyId);
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
    kick,
    isReady,

};
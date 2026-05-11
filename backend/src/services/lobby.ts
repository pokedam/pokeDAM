import type {
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    LobbySummaryResponse,
    Result
} from 'shared_types';
import { result } from 'shared_types';
import { db } from "../db/client.js";
import * as store from "./store.js";
import type { PlayerId } from './store.js';

export interface Lobby {
    name: string;
    password?: string | null;
    hostId: PlayerId;
    hostNickname: string;
    joiners: Map<PlayerId, Joiner>;
    maxPlayers: number;
}

export interface Joiner {
    isReady: boolean;
    nickname: string;
}

export interface LobbyJoinResponse {
    nickname: string;
    playerCount: number;
}

export type LeftResponse = HostLeftResponse | JoinerLeftResponse;

interface HostLeftResponse {
    type: "host";
    newHostId: number | null;
    lobbyId: string;
    playerCount: number;
}

interface JoinerLeftResponse {
    type: "joiner";
    joinerId: number;
    lobbyId: string;
    playerCount: number;
}

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

function get(id: string): Result<LobbyResponse> {
    const lobby = store.lobbies.get(id);
    return lobby ? result.ok(response(lobby)) : result.notFound(`No lobby with ID ${id} found`);
}

function getAll(): LobbySummaryResponse[] {
    return Array.from(store.lobbies.all(), ([id, lobby]) => summaryResponse(id, lobby));
}

async function create(hostId: number, request: LobbyCreationRequest, maxPlayers: number = 8): Promise<Result<LobbySummaryResponse>> {
    if (store.groups.get(hostId)) return result.conflict(`Player is already in a lobby`);
    let res = (await db.user.get(hostId));
    if (!res.success) return res;
    const lobby = {
        name: request.name ?? res.content.nickname,
        password: request.password,
        hostId,
        hostNickname: res.content.nickname,
        joiners: new Map(),
        maxPlayers
    };

    const lobbyId = store.lobbies.set(lobby);
    store.players.set(hostId, lobbyId);
    return result.ok(summaryResponse(lobbyId, lobby));
}

async function join(playerId: number, req: LobbyJoinRequest): Promise<Result<LobbyJoinResponse>> {
    if (store.players.get(playerId)) return result.conflict(`Player is already in a lobby`);

    const lobby = store.lobbies.get(req.id);
    if (!lobby) return result.conflict(`No lobby with ID ${req.id} found`);

    if (lobby.password && lobby.password !== req.password)
        return result.forbidden("Invalid lobby password");
    let res = (await db.user.get(playerId));
    if (!res.success) return res;
    let nickname = res.content.nickname;
    lobby.joiners.set(playerId, {
        isReady: false,
        nickname,
    });

    store.players.set(playerId, req.id);
    return result.ok({
        nickname,
        playerCount: lobby.joiners.size + 1,
    });
}

function leave(playerId: number): Result<LeftResponse> {
    const lobbyId = store.players.get(playerId);
    if (!lobbyId) return result.conflict(`Leave failed: Player is not in a lobby`);

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) return result.conflict(`Leave failed: No lobby with ID ${lobbyId} found`);

    return leaveInternal(playerId, lobbyId, lobby);
}

function kick(targetId: number, playerId: number): Result<LeftResponse> {
    let lobbyId = store.players.get(targetId);
    if (!lobbyId) return result.conflict(`Cannot kick player: Player is not in a lobby`);

    const lobby = store.lobbies.get(targetId);
    if (!lobby) return result.conflict(`Cannot kick player: Associated lobby is not available`);

    if (lobby.hostId !== playerId) return result.forbidden(`Cannot kick player: You are not the host of their current lobby`);

    return leaveInternal(targetId, lobbyId, lobby);
}

function leaveInternal(playerId: number, lobbyId: string, lobby: Lobby): Result<LeftResponse> {

    store.players.delete(playerId);

    if (lobby.hostId === playerId) {
        const iterator = lobby.joiners.entries().next();

        if (!iterator.done) {
            const [newHostId, newHost] = iterator.value;

            lobby.hostId = newHostId;
            lobby.hostNickname = newHost.nickname;

            lobby.joiners.delete(newHostId);
            return result.ok({ type: 'host', newHostId, lobbyId, playerCount: lobby.joiners.size + 1 });
        }

        store.groups.delete(lobbyId);
        return result.ok({ type: 'host', newHostId: null, lobbyId, playerCount: 0 });
    } else
        if (!lobby.joiners.delete(playerId))
            return result.conflict(`Leave failed: Player is not in the lobby`);

    return result.ok({ type: 'joiner', joinerId: playerId, lobbyId, playerCount: lobby.joiners.size + 1 });
}

function isReady(playerId: number, isReady: boolean): Result<string> {
    const lobbyId = store.players.get(playerId);
    if (!lobbyId) return result.conflict("Change ready status failed: Player is not in a lobby");

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) return result.conflict("Change ready status failed: Associated lobby is not available");

    const player = lobby.joiners.get(playerId);
    if (!player) return result.conflict("Change ready status failed: Player is not in this lobby");

    player.isReady = isReady;
    return result.ok(lobbyId);
}

function start(playerId: number): Result<void> {
    throw new Error("Not implemented");
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
    start,
};
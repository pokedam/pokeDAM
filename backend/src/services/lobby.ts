import type {
    GroupResponse,
    Id,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    LobbySummaryResponse,
    PlayerId,
    Result
} from 'shared_types';
import { result } from 'shared_types';
import { db } from "../db/client.js";
import * as store from "./store.js";
import { gameToResponse } from './game.js';

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

function get(id: Id): Result<LobbyResponse> {
    const lobby = store.lobbies.get(id);
    return lobby ? result.ok(response(lobby)) : result.notFound(`No lobby with was found`);
}

function initialResponse(id: Id): GroupResponse {
    const game = store.games.get(id);
    return {
        board: game ? gameToResponse(game) : null,
        lobbies:Array.from(store.lobbies.all(), ([id, lobby]) => summaryResponse(id, lobby)),
    };
}

async function create(hostId: number, request: LobbyCreationRequest, maxPlayers: number = 8): Promise<LobbySummaryResponse> {
    if (store.groups.get(hostId)) throw result.conflict(`Player is already in a lobby`);
    let res = (await db.user.get(hostId));
    const lobby = {
        name: request.name ?? res.nickname,
        password: request.password,
        hostId,
        hostNickname: res.nickname,
        joiners: new Map(),
        maxPlayers
    };

    const lobbyId = store.lobbies.set(lobby);
    store.players.set(hostId, lobbyId);
    return summaryResponse(lobbyId, lobby);
}

async function join(playerId: number, req: LobbyJoinRequest): Promise<LobbyJoinResponse> {
    if (store.lobbies.id(playerId)) throw result.conflict(`Player is already in a lobby`);

    const lobby = store.lobbies.get(req.id);
    if (!lobby) throw result.conflict(`No lobby was found`);

    if (lobby.password && lobby.password !== req.password)
        throw result.forbidden("Invalid lobby password");
    let res = (await db.user.get(playerId));

    lobby.joiners.set(playerId, {
        isReady: false,
        nickname: res.nickname
    });

    store.players.set(playerId, req.id);
    return {
        nickname: res.nickname,
        playerCount: lobby.joiners.size + 1,
    };
}

function leave(playerId: number): LeftResponse {
    const lobbyId = store.lobbies.id(playerId);
    if (!lobbyId) throw result.conflict(`Leave failed: Player is not in a lobby`);

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) throw result.conflict(`Leave failed: No lobby was found`);

    return leaveInternal(playerId, lobbyId, lobby);
}

function kick(targetId: number, playerId: number): LeftResponse {
    let lobbyId = store.lobbies.id(targetId);
    if (!lobbyId) throw result.conflict(`Cannot kick player: Player is not in a lobby`);

    const lobby = store.lobbies.get(targetId);
    if (!lobby) throw result.conflict(`Cannot kick player: Associated lobby is not available`);

    if (lobby.hostId !== playerId) throw result.forbidden(`Cannot kick player: You are not the host of their current lobby`);

    return leaveInternal(targetId, lobbyId, lobby);
}

function leaveInternal(playerId: number, lobbyId: string, lobby: Lobby): LeftResponse {

    store.players.delete(playerId);

    if (lobby.hostId === playerId) {
        const iterator = lobby.joiners.entries().next();

        if (!iterator.done) {
            const [newHostId, newHost] = iterator.value;

            lobby.hostId = newHostId;
            lobby.hostNickname = newHost.nickname;

            lobby.joiners.delete(newHostId);
            return { type: 'host', newHostId, lobbyId, playerCount: lobby.joiners.size + 1 };
        }

        store.groups.delete(lobbyId);
        return { type: 'host', newHostId: null, lobbyId, playerCount: 0 };
    } else
        if (!lobby.joiners.delete(playerId))
            throw result.conflict(`Leave failed: Player is not in the lobby`);

    return { type: 'joiner', joinerId: playerId, lobbyId, playerCount: lobby.joiners.size + 1 };
}

function isReady(playerId: number, isReady: boolean): string {
    const lobbyId = store.lobbies.id(playerId);
    if (!lobbyId) throw result.conflict("Change ready status failed: Player is not in a lobby");

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) throw result.conflict("Change ready status failed: Associated lobby is not available");

    const player = lobby.joiners.get(playerId);
    if (!player) throw result.conflict("Change ready status failed: Player is not in this lobby");

    player.isReady = isReady;
    return lobbyId;
}

////////////
// Export //
////////////
export const lobbyService = {
    response,
    summaryResponse,
    get,
    getAll: initialResponse,
    create,
    join,
    leave,
    kick,
    isReady,
};
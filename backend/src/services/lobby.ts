import type {
    GroupId,
    Id,
    LobbyCreationRequest,
    LobbyJoinRequest,
    LobbyResponse,
    LobbyViewResponse as LobbyViewResponse,
    PlayerId,
    Result,
    LobbyPlayer
} from 'shared_types';
import { result } from 'shared_types';
import * as store from "./store.js";
export interface Lobby {
    name: string;
    password?: string | null;
    host: LobbyPlayer;
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

export function get(id: Id): Result<LobbyResponse> {
    const lobby = store.lobbies.get(id);
    return lobby ? result.ok(toResponse(lobby)) : result.notFound(`No lobby with was found`);
}



export function create(host: LobbyPlayer, request: LobbyCreationRequest, maxPlayers: number = 8): LobbyViewResponse {
    if (store.groups.get(host.id)) throw result.conflict(`Player is already in a lobby`);

    const lobby = {
        name: request.name,
        password: request.password,
        host,
        joiners: new Map(),
        maxPlayers
    };

    const lobbyId = store.lobbies.set(lobby);
    store.players.set(host.id, lobbyId);
    return toViewResponse(lobbyId, lobby);
}

export function join(playerId: PlayerId, nickname: string, req: LobbyJoinRequest): LobbyResponse {
    if (store.lobbies.id(playerId)) throw result.conflict(`Player is already in a lobby`);

    const lobby = store.lobbies.get(req.id);
    if (!lobby) throw result.conflict(`No lobby was found`);

    if (lobby.password && lobby.password !== req.password)
        throw result.forbidden("Invalid lobby password");


    lobby.joiners.set(playerId, {
        isReady: false,
        nickname,
    });

    store.players.set(playerId, req.id);
    return toResponse(lobby);
}

export function leave(playerId: PlayerId): LeftResponse {
    const lobbyId = store.lobbies.id(playerId);
    if (!lobbyId) throw result.conflict(`Leave failed: Player is not in a lobby`);

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) throw result.conflict(`Leave failed: No lobby was found`);

    return leaveInternal(playerId, lobbyId, lobby);
}

export function kick(targetId: PlayerId, playerId: PlayerId): LeftResponse {
    let lobbyId = store.lobbies.id(targetId);
    if (!lobbyId) throw result.conflict(`Cannot kick player: Player is not in a lobby`);

    const lobby = store.lobbies.get(targetId);
    if (!lobby) throw result.conflict(`Cannot kick player: Associated lobby is not available`);

    if (lobby.host.id !== playerId) throw result.forbidden(`Cannot kick player: You are not the host of their current lobby`);

    return leaveInternal(targetId, lobbyId, lobby);
}

export function leaveInternal(playerId: PlayerId, lobbyId: GroupId, lobby: Lobby): LeftResponse {

    store.players.delete(playerId);

    if (lobby.host.id === playerId) {
        const iterator = lobby.joiners.entries().next();

        if (!iterator.done) {
            const [newHostId, newHost] = iterator.value;
            lobby.host = { id: newHostId, nickname: newHost.nickname };
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

export function isReady(playerId: PlayerId, isReady: boolean): string {
    const lobbyId = store.lobbies.id(playerId);
    if (!lobbyId) throw result.conflict("Change ready status failed: Player is not in a lobby");

    const lobby = store.lobbies.get(lobbyId);
    if (!lobby) throw result.conflict("Change ready status failed: Associated lobby is not available");

    const player = lobby.joiners.get(playerId);
    if (!player) throw result.conflict("Change ready status failed: Player is not in this lobby");

    player.isReady = isReady;
    return lobbyId;
}


export function toResponse(lobby: Lobby): LobbyResponse {
    return {
        ...lobby,
        joiners: Array.from(lobby.joiners.entries()).map(([id, player]) => ({
            id,
            ...player,
        })),
    };
}

export function toViewResponse(id: string, lobby: Lobby): LobbyViewResponse {
    return {
        id,
        name: lobby.name,
        hasPassword: lobby.password != null,
        playerCount: lobby.joiners.size + 1,
        maxPlayers: lobby.maxPlayers,
    };
}
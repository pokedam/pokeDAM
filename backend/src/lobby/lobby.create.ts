import { v4 } from 'uuid';
import { lobbies, players, type Lobby, type Player } from "./lobby.js";
import { result, type Result } from "../result.js";
import { getUser } from "../database.js";

export interface LobbyCreationRequest {
    name: string | null;
    password: string | null;
}

export interface LobbyCreatedResponse {
    id: string;
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
    return result.new({ id: lobbyId });
}
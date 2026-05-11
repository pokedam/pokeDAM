export interface Lobby {
    name: string;
    password?: string | null;
    hostId: number;
    hostNickname: string;
    joiners: Map<number, Joiner>;
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

export interface HostLeftResponse {
    type: "host";
    newHostId: number | null;
    lobbyId: string;
    playerCount: number;
}

export interface JoinerLeftResponse {
    type: "joiner";
    joinerId: number;
    lobbyId: string;
    playerCount: number;
}
export interface Lobby {
    name: string;
    password?: string | null;
    hostId: number;
    hostNickname: string | null;
    joiners: Map<number, Player>;
    maxPlayers: number;
}

export interface Player {
    isReady: boolean;
    nickname: string | null;
}


export const lobbies: Map<string, Lobby> = new Map();
export const players: Map<number, string> = new Map();
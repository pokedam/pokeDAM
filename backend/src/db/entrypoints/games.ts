import { api } from '../client.js';
import type { GameSummary } from 'shared_types';

export function save(summary: GameSummary): Promise<void> {
    return api.post<void>('/games', summary);
}

export function ofUser(userId: number): Promise<GameSummary[]> {
    return api.get<GameSummary[]>(`/games/user/${userId}`);
}

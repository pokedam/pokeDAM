import { api } from '../client.js';
import type { Result, User, UserChangeRequest } from 'shared_types';

export function get(userId: number): Promise<Result<User>> {
    return api.get<User>(`/user/${userId}`);
}

export function set(userId: number, req: UserChangeRequest): Promise<Result<void>> {
    return api.patch<void>(`/user/${userId}`, req);
}
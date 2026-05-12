import { api } from '../client.js';
import type { Result, User, UserChangeRequest, PokemonResponse } from 'shared_types';

export function get(userId: number): Promise<Result<User>> {
    return api.get<User>(`/user/${userId}`);
}

export function set(userId: number, req: UserChangeRequest): Promise<Result<void>> {
    return api.patch<void>(`/user/${userId}`, req);
}


export function getPokemons(userId: number): Promise<Result<PokemonResponse[]>> {
    return api.get<PokemonResponse[]>(`/user/${userId}/pokemons`);
}

export function getActivePokemons(userId: number): Promise<Result<PokemonResponse[]>> {
    return api.get<PokemonResponse[]>(`/user/${userId}/pokemons/active`);
}

export function setPokemons(userId: number, req: number[]): Promise<Result<void>> {
    return api.patch(`/user/${userId}/pokemons`, req);
}


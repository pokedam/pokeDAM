import { api } from '../client.js';
import type { User, UserChangeRequest, PokemonResponse, PokemonResponseFull } from 'shared_types';

export function get(userId: number): Promise<User> {
    return api.get<User>(`/user/${userId}`);
}

export function set(userId: number, req: UserChangeRequest): Promise<void> {
    return api.patch<void>(`/user/${userId}`, req);
}


export function getPokemons(userId: number): Promise<PokemonResponse[]> {
    return api.get<PokemonResponse[]>(`/user/${userId}/pokemons`);
}

export function getActivePokemons(userId: number): Promise<PokemonResponseFull[]> {
    return api.get<PokemonResponseFull[]>(`/user/${userId}/pokemons/active`);
}

export function setPokemons(userId: number, req: number[]): Promise<void> {
    return api.patch(`/user/${userId}/pokemons`, req);
}
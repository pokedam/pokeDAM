import { api } from '../client.js';
import type { User, UserChangeRequest, PlayerPokemon, StartGamePlayer, PcPlayerPokemon } from 'shared_types';

export function get(userId: number): Promise<User> {
    return api.get<User>(`/user/${userId}`);
}

export function set(userId: number, req: UserChangeRequest): Promise<void> {
    return api.patch<void>(`/user/${userId}`, req);
}


export function getPokemons(userId: number): Promise<PcPlayerPokemon[]> {
    return api.get<PcPlayerPokemon[]>(`/user/${userId}/pokemons`);
}

export function setPokemons(userId: number, req: (number | null)[]): Promise<void> {
    return api.patch(`/user/${userId}/pokemons`, req);
}

export function renamePokemon(userId: number, pokemonId: number, name: string): Promise<void> {
    return api.patch<void>(`/user/${userId}/pokemons/${pokemonId}`, { name });
}

export function getStartGamePlayer(userId: number): Promise<StartGamePlayer> {
    return api.get<StartGamePlayer>(`/user/${userId}/team`);
}
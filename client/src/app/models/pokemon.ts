export { DB } from "./pokemon.dataset";

export interface Pokemon {
    id: number;
    name: string;
}

export function avatarUrl(id: number): string {

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
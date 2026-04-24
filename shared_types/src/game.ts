export type PokemonType = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'steel' | 'fairy';

export type Gender = 'male' | 'female' | 'genderless';

export interface Movs {

}

export const POKEMONS: Pokemon[] = [];



export interface Pokemon {
    type: PokemonType,
    id: number;
    name: string;
    statsBase: Stats;
}

export interface Stats {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    specialAttack: number;
    specialDefense: number;
}

export interface PcPlayerPokemon {
    isSelected: boolean;
    pokemon: PlayerPokemon;
}

export interface PlayerPokemon {
    id: number;
    alias: string | null;
    pokemon: number;
    lvl: number;
    exp: number;
    iv: Stats;
    movs: Movs[];
    gender: Gender;
    shiny: boolean;
}


// recibes: PcPlayerPokemon[], mostrarlos todos por pantalla

//    564,     43345 ,   698,     24357,    3466,      23546,
//["Pikachu", "Gepeto", "Gastly", "Hunter", "Golbat", "Bulbasaur"]

// Botón de guardar para seleccionar tu equipo de 6 pokemons

//[564, 43345, 698]
// envias number[] donde el numero es el indice del PcPlayerPokemon seleccionado en el array recibido
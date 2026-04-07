export type PokemonStatus = 'PAR' | 'DOR' | 'ENV' | 'QUE' | 'CON' | 'HEL';

export type PokeState = 'active' | 'available' | 'ko' | 'unavailable';

export interface Pokemon {
  id: number;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  avatarUrl: string; // Required pokemon photo
  statusConditions: PokemonStatus[];
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string; // Optional
  activePokemons: Pokemon[];
  isCurrentTurn: boolean;
  pokeStates: PokeState[]; // Up to 8 states; missing entries are treated as 'inhabilitado'
}

import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { PlayerPokemon, PcPlayerPokemon } from 'shared_types';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class PcService {
  private http = inject(HttpService);

  private _pokemons = signal<PcPlayerPokemon[]>([]);
  private _team = signal<PlayerPokemon[]>([]);

  public get pokemons() {
    return this._pokemons.asReadonly();
  }

  public get team() {
    return this._team.asReadonly();
  }

  /** Obtiene todos los pokemons del PC del usuario desde el backend */
  public getPokemons(): Observable<PcPlayerPokemon[]> {
    return this.http.get<PlayerPokemon[]>(`/pc`).pipe(
      map((pokemons) => {
        const pcPokemons: PcPlayerPokemon[] = pokemons.map(p => ({
          isSelected: false,
          pokemon: p
        }));
        this._pokemons.set(pcPokemons);
        return pcPokemons;
      }),
    );
  }

  /** Guarda el equipo seleccionado (array de IDs de pokemon) en el backend */
  public saveTeam(selectedPokemonIds: number[]): Observable<void> {
    return this.http.post<void>(`/pc`, selectedPokemonIds).pipe(
      tap(() => {
        // Actualizar el equipo local con los pokemons seleccionados
        const allPokemons = this._pokemons();
        const team = allPokemons
          .filter(p => selectedPokemonIds.includes(p.pokemon.id))
          .map(p => p.pokemon);
        this._team.set(team);
      }),
    );
  }
}

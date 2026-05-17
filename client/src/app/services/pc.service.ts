import { Injectable, Signal, inject, signal } from '@angular/core';
import { tap, throwError, Observable, EMPTY, } from 'rxjs';
import { PcPlayerPokemon, PlayerPokemon as RawPokemonResponse } from 'shared_types';
import { HttpService } from './http.service';

export interface PokemonResponse {
  pokedexIdx: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PcService {
  private http = inject(HttpService);

  private _pokemons = signal<PcPlayerPokemon[] | null>(null, { equal: () => false });
  // Exposes a PokemonResponse instead of RawPokemonResponse in order to hide
  // the id field, which is not needed in the frontend and can cause confusion
  pokemons: Signal<PcPlayerPokemon[] | null> = this._pokemons.asReadonly();


  public get(): Observable<PcPlayerPokemon[]> {
    return this.http.get<PcPlayerPokemon[]>(`/user/pokemons`).pipe(
      tap(res => this._pokemons.set(res))
    );
  }

  public set(idxs: (number | null)[]): Observable<void> {
    // const pokemons = this._pokemons();
    // if (pokemons == null) return throwError(() => new Error("No pokemons loaded"));    
    // const ids = idxs.map(id => pokemons[id]?.id);
    return this.http.patch<void>('/user/pokemons', idxs).pipe(
      tap(() => {
        this._pokemons.update(pokemons => {
          if (pokemons) {
            for (const pokemon of pokemons)
              pokemon.isActive = false;

            for (const idx of idxs)
              if (idx !== null)
                pokemons[idx].isActive = true;
          }

          return pokemons;
        })
      })
    );
  }

  public changeName(idx: number, name: string): Observable<void> {
    const pokemons = this._pokemons();
    if (pokemons == null) return throwError(() => new Error("No pokemons loaded"));
    const pokemon = pokemons[idx];
    if (!pokemon) return throwError(() => new Error("Pokemon not found"));

    const n = name.trim();
    if (n.length == 0) return EMPTY;
    return this.http.patch<void>(`/user/pokemons/${pokemon.id}`, { name: n }).pipe(
      tap(() => {
        this._pokemons.update(pList => {
          if (pList) {
            const data = pList[idx];
            data.name = n;
          }
          return pList;
        })
      })
    );
  }
}
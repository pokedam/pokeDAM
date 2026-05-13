import { Injectable, Signal, inject, signal } from '@angular/core';
import { tap, throwError, Observable, } from 'rxjs';
import { PokemonResponse as RawPokemonResponse } from 'shared_types';
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

  private _pokemons = signal<RawPokemonResponse[] | null>(null);
  // Exposes a PokemonResponse instead of RawPokemonResponse in order to hide
  // the id field, which is not needed in the frontend and can cause confusion
  pokemons: Signal<PokemonResponse[] | null> = this._pokemons.asReadonly();


  public get(): Observable<PokemonResponse[]> {
    return this.http.get<RawPokemonResponse[]>(`/user/pokemons`).pipe(
      tap(res => this._pokemons.set(res))
    );
  }

  public set(idxs: number[]): Observable<void> {
    const pokemons = this._pokemons();
    if (pokemons == null) return throwError(() => new Error("No pokemons loaded"));

    const ids = idxs.map(id => pokemons[id]?.id);
    return this.http.patch<void>('/user/pokemons', ids).pipe(
      tap(() => {
        this._pokemons.update(pokemons => {
          if (pokemons) {
            for (const pokemon of pokemons)
              pokemon.isActive = false;

            for (const idx of idxs)
              pokemons[idx].isActive = true;
          }

          return pokemons;
        })
      })
    );
  }
}
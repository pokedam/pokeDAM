import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PcPlayerPokemon, pokemon as getPokemon, pokemonSpriteUrl } from 'shared_types';
import { PcService } from '../../services/pc.service';
import { ErrorService } from '../../services/error.service';
import { ContentHeader } from '../../components/content-header/content-header';
import { AsyncButton } from '../../components/async-button/async-button';
import { catchError, EMPTY, map, Observable, of, tap } from 'rxjs';

interface PcItem {
    idx: number;
    pokemon: PcPlayerPokemon;
}

@Component({
    selector: 'app-pc-menu',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ContentHeader,
        AsyncButton
    ],
    templateUrl: './pc-menu.html',
    styleUrl: './pc-menu.css'
})
export class PcMenu implements OnInit {
    pc = inject(PcService);
    errorService = inject(ErrorService);
    cdr = inject(ChangeDetectorRef);
    router = inject(Router);

    filtered: PcItem[] = [];

    initialSelectedIndexes: null | (number | null)[] = [];
    selectedIndexes = signal<null | (number | null)[]>(null);;
    searchTerm = '';

    activeTab: 'pc' | 'team' = 'pc';

    ngOnInit() {
        this.pc.get().subscribe({
            next: (pokemons) => {
                const selected = pokemons.reduce((acc, p, idx) => {
                    if (p.isActive) acc.push(idx);
                    return acc;
                }, [] as number[]);
                this.initialSelectedIndexes = [...selected];
                this.selectedIndexes.set([...selected]);
                this.filterPokemons();
            },
            error: err => this.errorService.show(err.message),
        });
    }

    hasValidSelection(): boolean {
        const selected = this.selectedIndexes();
        if (!selected) return false;
        return selected.some(idx => idx !== null);
    }

    selectedPokemons(): null | (PcItem | null)[] {

        const pokemons = this.pc.pokemons();
        if (!pokemons) return null;

        const selected = this.selectedIndexes();
        if (!selected) return null;

        return selected.map(idx => idx !== null ? ({
            idx,
            pokemon: pokemons[idx],
        }) : null);
    }

    setTab(tab: 'pc' | 'team') {
        this.activeTab = tab;
    }

    sprite(id: number): string {
        return pokemonSpriteUrl(id);
    }

    nameOf(pkmn: PcItem): string {
        return pkmn.pokemon.name || getPokemon(pkmn.pokemon.pokedexIdx).name;
    }

    filterPokemons() {
        const pokemons = this.pc.pokemons();
        if (!pokemons) {
            this.filtered = [];
            return;
        }

        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filtered = pokemons.map((pokemon, idx) => ({
                idx,
                pokemon,
            }));
            return;
        }

        const idFilter = parseInt(term, 10);
        const isNumber = !isNaN(idFilter) && idFilter.toString() === term;

        this.filtered = pokemons.map((pokemon, idx) => ({ pokemon, idx })).filter((p) => {
            if (isNumber && p.pokemon.pokedexIdx === idFilter) {
                return true;
            }
            if (p.pokemon.name && p.pokemon.name.toLowerCase().includes(term)) return true;

            return getPokemon(p.pokemon.pokedexIdx).name.toLowerCase().includes(term);
        });
    }

    selectPokemon(originalIndex: number) {
        const selected = this.selectedIndexes();
        if (!selected) return;

        const newSelected = [...selected];
        const idx = newSelected.indexOf(originalIndex);
        if (idx < 0) {
            const nullIdx = newSelected.indexOf(null);
            if (nullIdx < 0) {
                if (newSelected.length < 3)
                    newSelected.push(originalIndex);
            } else {
                newSelected[nullIdx] = originalIndex;
            }
        }
        else newSelected[idx] = null;

        this.selectedIndexes.set(newSelected);
    }

    viewPokemon(idx: number) {
        this.router.navigate(['/pc', idx]);
    }

    hasChanged(): boolean {
        const selected = this.selectedIndexes();
        const initial = this.initialSelectedIndexes;
        if (!selected) {
            return initial !== null;
        }

        if (!initial) return true;

        const filteredSelected = selected.filter(idx => idx !== null);
        if (filteredSelected.length !== initial.length) return true;

        return !filteredSelected.every(idx => initial.includes(idx));
    }

    onSave(): Observable<boolean> {
        const selectedRaw = this.selectedIndexes();

        if (!selectedRaw) return of(false);

        const selected = selectedRaw.filter(idx => idx !== null);

        if (selected.length === 0) {
            return of(false);
        }

        return this.pc.set(selected).pipe(
            map(() => {
                this.initialSelectedIndexes = [...selected];
                this.selectedIndexes.set([...selected]);
                return true;
            }),
            catchError(() => {
                this.errorService.show('Failed to save team');
                return of(false);
            })
        );
    }
}

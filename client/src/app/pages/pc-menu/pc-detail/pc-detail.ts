import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { PcService } from '../../../services/pc.service';
import { ErrorService } from '../../../services/error.service';
import { ContentHeader } from '../../../components/content-header/content-header';
import { AsyncButton } from '../../../components/async-button/async-button';
import { pokemon as getPokemon, pokemonSpriteUrl, addStats, mov as getMov, Mov } from 'shared_types';

@Component({
  selector: 'app-pc-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ContentHeader, AsyncButton],
  templateUrl: './pc-detail.html',
  styleUrl: './pc-detail.css'
})
export class PcDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pc = inject(PcService);
  private errorService = inject(ErrorService);

  pokemonIdx = signal<number | null>(null);
  newName = '';

  pokemon = computed(() => {
    const pokemons = this.pc.pokemons();
    const idx = this.pokemonIdx();
    if (!pokemons || idx === null || idx < 0 || idx >= pokemons.length) {
      return null;
    }
    return pokemons[idx];
  });

  basePokemon = computed(() => {
    const p = this.pokemon();
    if (!p) return null;
    return getPokemon(p.pokedexIdx);
  });

  totalStats = computed(() => {
    const p = this.pokemon();
    const base = this.basePokemon();
    if (!p || !base) return null;
    return addStats(base.statsBase, p.iv);
  });

  spriteUrl = computed(() => {
    const p = this.pokemon();
    if (!p) return '';
    return pokemonSpriteUrl(p.pokedexIdx);
  });

  moves = computed<Mov[]>(() => {
    const p = this.pokemon();
    if (!p || !p.movs) return [];
    return p.movs.map(key => getMov(key));
  });

  constructor() {
    effect(() => {
      const p = this.pokemon();
      if (p) {
        this.newName = p.name || '';
      }
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      this.router.navigate(['/pc']);
      return;
    }
    this.pokemonIdx.set(parseInt(idParam, 10));
    
    // If pokemons are not loaded, we should load them.
    if (!this.pc.pokemons()) {
      this.pc.get().subscribe();
    }
  }

  hasChanged(): boolean {
    const p = this.pokemon();
    if (!p) return false;
    const currentName = p.name || '';
    const trimmed = this.newName.trim();
    return trimmed !== currentName && trimmed.length > 0;
  }

  onSave(): Observable<boolean> {
    const idx = this.pokemonIdx();
    if (idx === null) return of(false);
    const n = this.newName.trim();
    if (!n) return of(false);

    return this.pc.changeName(idx, n).pipe(
      map(() => true),
      catchError(err => {
        this.errorService.show(err.message || 'Error al cambiar de nombre');
        return of(false);
      })
    );
  }

  getStatPercentage(value: number): number {
    return Math.min(100, Math.max(0, (value / 255) * 100));
  }

  goBack() {
    this.router.navigate(['/pc']);
  }
}

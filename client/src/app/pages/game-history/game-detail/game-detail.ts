import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ContentHeader } from '../../../components/content-header/content-header';
import { PlayerTile } from '../../../components/player-tile/player-tile';
import { HistoryService } from '../../../services/history.service';
import { ErrorService } from '../../../services/error.service';
import { Player } from '../../../services/group.service';
import {
  GameSummary,
  GameEvent,
  InGamePokemon,
  SummaryGamePlayer,
  pokemon as getPokemon,
  addStats,
  mov,
  PlayerId,
} from 'shared_types';

interface TurnGroup {
  turnNumber: number;
  events: IndexedEvent[];
}

interface IndexedEvent {
  turnIdx: number;
  eventIdx: number;
  event: GameEvent;
  label: string;
}

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, ContentHeader, PlayerTile],
  templateUrl: './game-detail.html',
  styleUrl: './game-detail.css',
})
export class GameDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private historyService = inject(HistoryService);
  private error = inject(ErrorService);

  summary = signal<GameSummary | null>(null);
  board = signal<Map<PlayerId, Player>>(new Map());
  turnGroups = signal<TurnGroup[]>([]);
  activeEventKey = signal<string | null>(null);

  players = computed(() => Array.from(this.board().values()));

  winnerName = computed(() => {
    const s = this.summary();
    if (!s || s.end.winner === null) return null;
    return s.initialGame.find(p => p.id === s.end.winner)?.nickname ?? 'Unknown';
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      this.router.navigate(['/history']);
      return;
    }
    const idx = parseInt(idParam, 10);

    this.historyService.getGames().subscribe({
      next: (summaries) => {
        if (idx < 0 || idx >= summaries.length) {
          this.error.show('Partida no encontrada');
          this.router.navigate(['/history']);
          return;
        }
        const s = summaries[idx];
        this.summary.set(s);
        this.turnGroups.set(this.buildTurnGroups(s));
        this.resetBoard(s);
      },
      error: (err) => this.error.show(err.message),
    });
  }

  goBack(): void {
    this.router.navigate(['/history']);
  }

  /** Build the board from the initial game state (no events processed). */
  private resetBoard(s: GameSummary): void {
    this.board.set(this.buildBoardFromInitial(s));
  }

  /** Reset the board to initial state (clear active event). */
  resetToInitial(): void {
    const s = this.summary();
    if (!s) return;
    this.activeEventKey.set(null);
    this.resetBoard(s);
  }

  /** Build a fresh board Map from GameSummary.initialGame */
  private buildBoardFromInitial(s: GameSummary): Map<PlayerId, Player> {
    const board = new Map<PlayerId, Player>();
    for (const sp of s.initialGame) {
      board.set(sp.id, this.summaryPlayerToPlayer(sp));
    }
    return board;
  }

  /** Convert a SummaryGamePlayer into a Player (with full InGamePokemon). */
  private summaryPlayerToPlayer(sp: SummaryGamePlayer): Player {
    const pokemons: InGamePokemon[] = sp.pokemons.map(p => {
      const stats = addStats(p.iv, getPokemon(p.pokedexIdx).statsBase);
      return {
        id: p.id,
        name: p.name,
        pokedexIdx: p.pokedexIdx,
        movs: p.movs.map(key => mov(key)),
        stats,
        hp: stats.hp,
      };
    });
    return {
      id: sp.id,
      nickname: sp.nickname,
      pokemons,
      actives: [pokemons[0] ?? null, pokemons[1] ?? null, pokemons[2] ?? null],
      request: false,
    };
  }

  /** Build turn groups for the timeline. */
  private buildTurnGroups(s: GameSummary): TurnGroup[] {
    return s.history.map((turn, turnIdx) => ({
      turnNumber: turnIdx + 1,
      events: turn.map((event, eventIdx) => ({
        turnIdx,
        eventIdx,
        event,
        label: this.eventLabel(event, s),
      })),
    }));
  }

  /** Generate a human-readable label for a GameEvent. */
  private eventLabel(event: GameEvent, s: GameSummary): string {
    // switch (event.key) {
    //   case 'damage': {
    //     const de = event;
    //     const dealerPlayer = s.initialGame.find(p => p.id === de.dealer.playerId);
    //     const targetPlayer = s.initialGame.find(p => p.id === de.target.playerId);
    //     const dealerPkmn = dealerPlayer?.pokemons[de.dealer.pokemonIdx];
    //     const targetPkmn = targetPlayer?.pokemons[de.target.pokemonIdx];
    //     const dealerName = dealerPkmn ? (dealerPkmn.name ?? getPokemon(dealerPkmn.pokedexIdx).name) : '???';
    //     const targetName = targetPkmn ? (targetPkmn.name ?? getPokemon(targetPkmn.pokedexIdx).name) : '???';
    //     const dmg = de.damage;
    //     const damageDetails = dmg
    //       ? `-${dmg.amount} HP ${dmg.effectiveness === 1 ? '' : ` (x${dmg.effectiveness})`}${dmg.isCrit ? ' Crit!' : ''}` : 'Failed!';
    //     return `${dealerName} -> ${targetName} ${damageDetails}`;
    //   }
    //   case 'pokemon_fainted': {
    //     const fe = event;
    //     const owner = s.initialGame.find(p => p.id === fe.pokemon.playerId);
    //     const pkmn = owner?.pokemons[fe.pokemon.pokemonIdx];
    //     const name = pkmn?.name ?? (pkmn ? getPokemon(pkmn.pokedexIdx).name : '???');
    //     return `💀 ${name} fainted!`;
    //   }
    // }
    return "TODO";
  }

  /** Called when user clicks an event in the timeline. */
  onEventClick(ie: IndexedEvent): void {
    const s = this.summary();
    if (!s) return;

    const key = `${ie.turnIdx}-${ie.eventIdx}`;
    this.activeEventKey.set(key);

    // Build a fresh board and replay events up to (including) this one
    const board = this.buildBoardFromInitial(s);

    for (let t = 0; t <= ie.turnIdx; t++) {
      const turn = s.history[t];
      const maxE = t < ie.turnIdx ? turn.length : ie.eventIdx + 1;
      for (let e = 0; e < maxE; e++) {
        this.applyEvent(board, turn[e]);
      }
    }

    this.board.set(board);
  }

  /** Apply a single GameEvent to the board, mutating it. */
  private applyEvent(board: Map<PlayerId, Player>, event: GameEvent): void {
    // switch (event.key) {
    //   case 'damage': {
    //     const dmg = event.damage;
    //     if (!dmg) return;
    //     const targetPlayer = board.get(event.target.playerId);
    //     if (targetPlayer) {
    //       const pkmn = targetPlayer.actives[event.target.pokemonIdx];
    //       if (pkmn) {
    //         pkmn.hp = Math.max(0, pkmn.hp - dmg.amount);
    //       }
    //     }
    //     break;
    //   }
    //   case 'pokemon_fainted': {
    //     // HP is already set to 0 by the damage event, but ensure it
    //     const fe = event as PokemonFainted;
    //     const owner = board.get(fe.pokemon.playerId);
    //     if (owner) {
    //       const pkmn = owner.actives[fe.pokemon.pokemonIdx];
    //       if (pkmn) {
    //         pkmn.hp = 0;
    //       }
    //     }
    //     break;
    //   }
    // }
  }

  /** Selector for PlayerTile — no selection in replay mode. */
  noSelection = (_ref: any) => 'none' as const;

  isEventActive(ie: IndexedEvent): boolean {
    return this.activeEventKey() === `${ie.turnIdx}-${ie.eventIdx}`;
  }
}

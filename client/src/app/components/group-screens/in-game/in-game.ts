import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MovKey, PlayerId, TurnHistory, GameRequest, PokemonRef, MovRef, DamageEvent, InGamePokemon, Mov, pokemon as getPokemon, PokemonFainted, GameEnd } from 'shared_types';
import { PlayerTile } from '../../player-tile/player-tile';
import { Game, GroupService, Player } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { Dialogue, DialogueSequence } from '../../dialogue/dialogue';
import { ErrorService } from '../../../services/error.service';

export type Selector = (ctx: SelectionContext) => SelectionMode;
type OnSelection = (ctx: SelectionContext) => InGameState;

export type SelectionMode = 'none' | 'selectable' | 'damageable';

type InGameState =
  | PlayState
  | SelectMovState
  | SelectTargetState
  | TurnAnimationState
  | SelectionDoneState;

export interface SelectionContext {
  game: Game;
  selected: MovRef;
  target: PokemonRef;
}

interface PlayState {
  type: 'play';
}

interface SelectMovState {
  type: 'mov-selection';
  selected: number;
}

interface SelectTargetState {
  type: 'target-selection';
  selectableFn: Selector;
  onSelected: OnSelection;
  selected: MovRef;
}

interface SelectionDoneState {
  type: 'selection-done';
  request: GameRequest;
  isReady: boolean;
}

interface TurnAnimationState {
  type: 'turn-result';
  turn: TurnHistory;
}

interface ContextButtonDescriptor {
  label: string;
  action: (() => void) | null;
}

const SINGLE_ENEMY: (mov: MovRef) => SelectTargetState = (mov) => ({
  type: 'target-selection',
  selected: mov,
  onSelected: (ctx) => ({
    type: 'selection-done',
    request: {
      payload: {
        pokemonIdx: ctx.target.pokemonIdx,
        playerId: ctx.target.playerId,
      },
      pokemonIdx: ctx.selected.pokemonIdx,
      movIdx: ctx.selected.movIdx,
    },
    isReady: false,
  }),
  selectableFn: (ctx) => ctx.selected.playerId !== ctx.target.playerId ? 'damageable' : 'none',
});

type MovSelectionMap = { [K in MovKey]: (source: MovRef) => InGameState; };

const MOV_MAP: MovSelectionMap = {
  destructor: SINGLE_ENEMY,
  other: SINGLE_ENEMY,
};

@Component({
  selector: 'app-in-game',
  standalone: true,
  imports: [PlayerTile, Dialogue],
  templateUrl: './in-game.html',
  styleUrl: './in-game.css',
})
export class InGame implements OnInit {
  state = signal<InGameState>({ type: 'play' });
  currentMenu: 'main' | 'attacks' | 'target-selection' = 'main';
  group = inject(GroupService);
  auth = inject(AuthService);
  error = inject(ErrorService);
  game!: Game;

  contextButtonDescriptor = computed<ContextButtonDescriptor | null>(() => {
    const state = this.state();
    switch (state.type) {
      case 'mov-selection':
      case 'target-selection':
        return {
          label: 'Cancel',
          action: () => this.state.set({ type: 'play' })
        };

      case 'selection-done':
        return state.isReady ? {
          label: 'Done!',
          action: null,
        } : {
          label: 'Ready',
          action: () => {
            const current = this.state();
            if (current.type !== 'selection-done') return;
            this.group.play(current.request).subscribe({
              next: () => {
                const s = this.state();
                if (s.type !== 'selection-done') return;
                console.log("READY, play played!");
                this.state.set({ ...s, isReady: true });
              },
              error: (err) => this.error.show(err.message),
            })
          }
        };


      default: return null;
    }
  });

  constructor() {
    effect(() => {
      const turn = this.group.turn();
      if (turn) {
        this.state.set({ type: 'turn-result', turn });
      }
    });
  }

  ngOnInit(): void {
    this.game = this.group.asGame();
  }

  players(): Iterable<Player> {
    return this.game.board.values();
  }

  player(): Player {
    return this.game.board.get(this.auth.auth()!.user.id)!;
  }

  opponents(): Player[] {
    return Array.from(this.game.board.values()).filter(p => p.id !== this.auth.auth()!.user.id);
  }

  isUser(playerId: PlayerId) {
    return playerId === this.auth.auth()!.user.id;
  }

  pokemon(ref: PokemonRef): InGamePokemon {
    return this.game.board.get(ref.playerId)!.actives[ref.pokemonIdx]!;
  }

  mov(ref: MovRef): Mov {
    return this.pokemon(ref).movs[ref.movIdx];
  }


  getSelector(): (ref: PokemonRef) => SelectionMode {
    const state = this.state();
    switch (state.type) {
      case 'play':
        return (player) => player.playerId === this.auth.auth()!.user.id ? 'selectable' : 'none';
      case 'selection-done':
        return state.isReady ? () => 'none' : (player) => player.playerId === this.auth.auth()!.user.id ? 'selectable' : 'none';
      case 'target-selection':
        const selectableFn = state.selectableFn;
        const selected = state.selected;
        return (ref) => selectableFn({
          game: this.game,
          selected,
          target: {
            playerId: ref.playerId,
            pokemonIdx: ref.pokemonIdx
          }
        });
      default:
        return () => 'none';
    }
  }

  onPokemonSelect(event: PokemonRef) {

    const state = this.state();
    switch (state.type) {
      case 'selection-done':
        if (!state.isReady && event.playerId === this.player().id)
          this.state.set({ type: 'mov-selection', selected: event.pokemonIdx });
        break;
      case 'play':
        if (event.playerId === this.player().id)
          this.state.set({ type: 'mov-selection', selected: event.pokemonIdx });
        break;
      case 'target-selection':
        const ctx: SelectionContext = {
          game: this.game,
          selected: state.selected,
          target: event
        };
        this.state.set(state.onSelected(ctx));
        break;
      default:
        break;
    }
    if (this.currentMenu === 'target-selection') {
    }
  }

  executeContextAction(): void {
    const descriptor = this.contextButtonDescriptor();
    if (descriptor?.action) {
      descriptor.action();
    }
  }


  onMovSelect(movIdx: number) {
    const state = this.state();
    if (state.type !== 'mov-selection') return;

    const pokemonIdx = state.selected;
    const player = this.player();
    const mov = player.actives[pokemonIdx]?.movs[movIdx];

    if (!mov || mov.pp == 0) return;

    this.state.set(MOV_MAP[mov.key]({
      movIdx,
      playerId: player.id,
      pokemonIdx
    }));
  }

  dialogueText = computed<DialogueSequence>(() => {
    const state = this.state();
    switch (state.type) {
      case 'turn-result':
        return [
          ...state.turn.flatMap(event => {
            switch (event.key) {
              case 'damage': return this.damageDialogue(event);
              case 'pokemon_fainted': return this.faintedDialogue(event);
              case 'game_end': return this.gameEndDialogue(event);
            }
          }),
          { type: 'action', action: () => this.state.set({ type: 'play' }) },
        ];
      case 'target-selection':
        return ["Select a target!"];
      case 'play':
        return ["Choose your pokemon!"];
      case 'selection-done':
        return [state.isReady ? "Waiting for other players..." : "Confirm your selection!"];
      default: return [];
    }
  });

  damageDialogue(event: DamageEvent): DialogueSequence {
    const mov = this.mov(event.dealer);
    const dealer = this.pokemon(event.dealer);
    const target = this.pokemon(event.target);

    const dealerName = dealer.name ?? getPokemon(dealer.pokedexIdx).name;
    const targetName = target.name ?? getPokemon(target.pokedexIdx).name;
    const movName = mov.key;

    return [
      `${dealerName} used ${movName} on ${targetName}!`,
      {
        type: 'action', action: () => {
          target.hp = Math.max(0, target.hp - event.damage.amount);
        }
      },
      { type: 'jump' },
    ];
  }
  faintedDialogue(event: PokemonFainted): DialogueSequence {
    const pokemon = this.pokemon(event.pokemon);
    const name = pokemon.name ?? getPokemon(pokemon.pokedexIdx).name;

    return [
      `${name} was fainted!`,
      { type: 'jump' },
    ];
  }

  gameEndDialogue(event: GameEnd): DialogueSequence {

    const winner = this.game.board.get(event.winner)!.nickname;

    return [
      'Match has ended!',
      { type: 'jump', },
      `${winner} wins!`,
    ];
  }
}
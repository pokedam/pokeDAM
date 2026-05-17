import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import {
  MovKey,
  PlayerId,
  PlayRequest,
  PokemonRef,
  MovRef,
  InGamePokemon,
  Mov,
  pokemon as getPokemon,
  PokemonFaintedEvent,
  TurnCompletedEvent,
  GameEndEvent,
  MovUsedEvent,
  EventContent,
  Damage,
  Heal,
  getMaxPp as getMaxPpFromShared
} from 'shared_types';
import { PlayerTile } from '../../player-tile/player-tile';
import { Game, GroupService, Player } from '../../../services/group.service';
import { AuthService } from '../../../services/auth.service';
import { Dialogue, DialogueSequence, DialogueStep } from '../../dialogue/dialogue';
import { ErrorService } from '../../../services/error.service';
import { ClockComponent } from '../../clock/clock';

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
  request: PlayRequest;
}

interface TurnAnimationState {
  type: 'turn-result';
  event: TurnCompletedEvent;
}

interface ContextButtonDescriptor {
  label: string;
  action: (() => void) | null;
}

const UNTARGETED: (mov: MovRef) => SelectionDoneState = (mov) => ({
  type: 'selection-done',
  request: {
    payload: null,
    pokemonIdx: mov.pokemonIdx,
    movIdx: mov.movIdx,
    isReady: false,
  },
  isReady: false,
});

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
      isReady: false,
    },
    isReady: false,
  }),
  selectableFn: (ctx) => ctx.selected.playerId !== ctx.target.playerId ? 'damageable' : 'none',
});

const SINGLE_ALLY: (mov: MovRef) => SelectTargetState = (mov) => ({
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
      isReady: false,
    },
    isReady: false,
  }),
  selectableFn: (ctx) => ctx.selected.playerId === ctx.target.playerId ? 'damageable' : 'none',
});

type MovSelectionMap = { [K in MovKey]: (source: MovRef) => InGameState; };

const MOV_MAP: MovSelectionMap = {
  // Normal
  destructor: SINGLE_ENEMY,
  hyperBeam: SINGLE_ENEMY,
  megaPunch: SINGLE_ENEMY,
  recover: UNTARGETED,
  cheerUp: UNTARGETED,
  helpingHand: SINGLE_ALLY,
  // Fire
  ember: SINGLE_ENEMY,
  overheat: SINGLE_ENEMY,
  fireBlast: SINGLE_ENEMY,
  sunnyDay: UNTARGETED,
  warmHeal: SINGLE_ALLY,
  flameChargeBuff: UNTARGETED,
  // Water
  waterGun: SINGLE_ENEMY,
  hydroCannon: SINGLE_ENEMY,
  hydroPump: SINGLE_ENEMY,
  lifeDew: UNTARGETED,
  rainDance: UNTARGETED,
  aquaRing: UNTARGETED,
  // Grass
  vineWhip: SINGLE_ENEMY,
  frenzyPlant: SINGLE_ENEMY,
  leafStorm: SINGLE_ENEMY,
  synthesis: UNTARGETED,
  aromatherapy: UNTARGETED,
  cottonGuard: UNTARGETED,
  // Electric
  thunderShock: SINGLE_ENEMY,
  zapCannon: SINGLE_ENEMY,
  thunder: SINGLE_ENEMY,
  charge: UNTARGETED,
  magneticFlux: UNTARGETED,
  sparkHeal: SINGLE_ALLY,
  // Ice
  iceShard: SINGLE_ENEMY,
  freezeDry: SINGLE_ENEMY,
  blizzard: SINGLE_ENEMY,
  snowscape: UNTARGETED,
  iceShield: UNTARGETED,
  chillPill: UNTARGETED,
  // Fighting
  karateChop: SINGLE_ENEMY,
  closeCombat: SINGLE_ENEMY,
  dynamicPunch: SINGLE_ENEMY,
  bulkUp: UNTARGETED,
  coaching: UNTARGETED,
  meditate: UNTARGETED,
  // Poison
  poisonSting: SINGLE_ENEMY,
  sludgeWave: SINGLE_ENEMY,
  gunkShot: SINGLE_ENEMY,
  acidArmor: UNTARGETED,
  toxicBarrier: UNTARGETED,
  purify: SINGLE_ALLY,
  // Ground
  mudSlap: SINGLE_ENEMY,
  earthquake: SINGLE_ENEMY,
  mudBomb: SINGLE_ENEMY,
  spikesShield: UNTARGETED,
  shoreUp: UNTARGETED,
  earthBlessing: UNTARGETED,
  // Flying
  peck: SINGLE_ENEMY,
  braveBird: SINGLE_ENEMY,
  hurricane: SINGLE_ENEMY,
  roost: UNTARGETED,
  tailwind: UNTARGETED,
  featherDanceBuff: SINGLE_ALLY,
  // Psychic
  confusion: SINGLE_ENEMY,
  psychoBoost: SINGLE_ENEMY,
  zenHeadbutt: SINGLE_ENEMY,
  calmMind: UNTARGETED,
  healPulse: SINGLE_ALLY,
  reflect: UNTARGETED,
  // Bug
  furyCutter: SINGLE_ENEMY,
  bugBuzz: SINGLE_ENEMY,
  megahorn: SINGLE_ENEMY,
  quiverDance: UNTARGETED,
  pollenPuffHeal: SINGLE_ALLY,
  swarmBoost: UNTARGETED,
  // Rock
  rockThrow: SINGLE_ENEMY,
  headSmash: SINGLE_ENEMY,
  stoneEdge: SINGLE_ENEMY,
  rockPolish: UNTARGETED,
  wideGuard: UNTARGETED,
  stoneRest: UNTARGETED,
  // Ghost
  astonish: SINGLE_ENEMY,
  shadowForce: SINGLE_ENEMY,
  shadowClaw: SINGLE_ENEMY,
  shadowShield: UNTARGETED,
  spiritShackleBuff: UNTARGETED,
  spectralRest: UNTARGETED,
  // Dragon
  dragonBreath: SINGLE_ENEMY,
  dracoMeteor: SINGLE_ENEMY,
  dragonRush: SINGLE_ENEMY,
  dragonDance: UNTARGETED,
  dragonCheer: UNTARGETED,
  draconicAura: UNTARGETED,
  // Steel
  metalClaw: SINGLE_ENEMY,
  flashCannon: SINGLE_ENEMY,
  ironTail: SINGLE_ENEMY,
  ironDefense: UNTARGETED,
  gearUp: UNTARGETED,
  metallicShine: UNTARGETED,
  // Fairy
  fairyWind: SINGLE_ENEMY,
  fleurCannon: SINGLE_ENEMY,
  playRough: SINGLE_ENEMY,
  moonlight: UNTARGETED,
  floralHealing: SINGLE_ALLY,
  mistyTerrain: UNTARGETED,
  // Dark
  bite: SINGLE_ENEMY,
  darkPulse: SINGLE_ENEMY,
  darkBarrage: SINGLE_ENEMY,
  nastyPlot: UNTARGETED,
  darkCloak: UNTARGETED,
  midnightCheer: UNTARGETED,
};

@Component({
  selector: 'app-in-game',
  standalone: true,
  imports: [PlayerTile, Dialogue, ClockComponent],
  templateUrl: './in-game.html',
  styleUrl: './in-game.css',
})
export class InGame implements OnInit {
  state = signal<InGameState>({ type: 'play' }, { equal: () => false });
  currentMenu: 'main' | 'attacks' | 'target-selection' = 'main';
  group = inject(GroupService);
  auth = inject(AuthService);
  error = inject(ErrorService);
  game!: Game;
  winnerName = signal<string | null>(null);
  isWinner = signal<boolean>(false);

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
        return state.request.isReady ? {
          label: 'Done!',
          action: null,
        } : {
          label: 'Ready',
          action: () => {
            this.state.update(state => {
              if (state.type === 'selection-done') {
                state.request.isReady = true;
                this.group.play(state.request).subscribe({
                  error: (err) => {
                    this.error.show(err.message);
                    this.state.update(state => {
                      if (state.type === 'selection-done') state.request.isReady = false;
                      return state;
                    });
                  }
                });
              }
              return state;
            });
          }
        };


      default: return null;
    }
  });

  constructor() {
    effect(() => {
      const turn = this.group.turn();
      if (turn) {
        this.state.set({ type: 'turn-result', event: turn });
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


  getMaxPp(key: MovKey): number {
    return getMaxPpFromShared(key);
  }

  movDialogue(event: MovUsedEvent): DialogueSequence {
    if (event.contents.length == 0) return [];
    const mov = this.mov(event.dealer);
    const dealer = this.pokemon(event.dealer);

    const dealerName = dealer.name ?? getPokemon(dealer.pokedexIdx).name;
    const movName = mov.displayName;

    const deductPpAction: DialogueStep = {
      type: 'action',
      action: () => {
        if (mov.pp > 0) mov.pp -= 1;
        const p = this.game.board.get(event.dealer.playerId);
        if (p) {
          const pkmnInTeam = p.pokemons[event.dealer.pokemonIdx];
          if (pkmnInTeam) {
            const teamMov = pkmnInTeam.movs[event.dealer.movIdx];
            if (teamMov && teamMov.pp > 0) teamMov.pp -= 1;
          }
        }
      }
    };

    if (event.contents.length == 1) {
      const content = event.contents[0];
      const target = this.pokemon(content.target);
      const targetName = target.name ?? getPokemon(target.pokedexIdx).name;

      return [
        deductPpAction,
        `${dealerName} used ${movName} on ${targetName}!`,
        ...fullContentDialogue(content.content, target)
      ];
    }

    return [
      deductPpAction,
      `${dealerName} used ${movName}`,
      ...event.contents.flatMap(c => {
        const target = this.pokemon(c.target);
        return fastContentDialogue(c.content, target);
      })
    ];

  }

  faintedDialogue(event: PokemonFaintedEvent): DialogueSequence {
    const pokemon = this.pokemon(event.pokemon);
    const name = pokemon.name ?? getPokemon(pokemon.pokedexIdx).name;

    return [
      `${name} was fainted!`,
      { type: 'jump' },
    ];
  }
  gameEndDialogue(event: GameEndEvent): DialogueSequence {
    if (!event.winner) throw Error("Unimplemented");

    const winner = this.game.board.get(event.winner)!.nickname;
    const isWinner = event.winner === this.player().id;

    return [
      'Battle has ended!',
      { type: 'jump', },
      `${winner} wins!`,
      { type: 'action', action: () => this.openWinnerModal(winner, isWinner) }
    ];
  }

  playDialogue(): DialogueSequence {
    return [{
      type: 'action', ignoreOnFlush: true, action: () => {
        this.state.set({ type: 'play' });
      }
    }]
  }


  getSelector(): (ref: PokemonRef) => SelectionMode {
    const state = this.state();
    switch (state.type) {
      case 'play':
        return (player) => player.playerId === this.auth.auth()!.user.id ? 'selectable' : 'none';
      case 'selection-done':
        return state.request.isReady ? () => 'none' : (player) => player.playerId === this.auth.auth()!.user.id ? 'selectable' : 'none';
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
        if (!state.request.isReady && event.playerId === this.player().id)
          this.state.set({ type: 'mov-selection', selected: event.pokemonIdx });
        break;
      case 'play':
        if (event.playerId === this.player().id)
          this.state.set({ type: 'mov-selection', selected: event.pokemonIdx });
        break;
      case 'target-selection':
        const newState = state.onSelected({
          game: this.game,
          selected: state.selected,
          target: event
        });
        if (newState.type === 'selection-done')
          this.group.play(newState.request).subscribe({ error: () => { } });

        this.state.set(newState);
        break;
      default:
        break;
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
          ...state.event.history.flatMap(event => {
            switch (event.key) {
              case 'content': return this.movDialogue(event);
              case 'pokemon_fainted': return this.faintedDialogue(event);
            }
          }),
          ...state.event.gameEnd
            ? this.gameEndDialogue(state.event.gameEnd)
            : this.playDialogue(),
        ];
      case 'target-selection':
        return ["Select a target!"];
      case 'play':
        return ["Choose your pokemon!"];
      case 'selection-done':
        return [state.request.isReady ? "Waiting for other players..." : "Confirm your selection!"];
      default: return [];
    }
  });

  openWinnerModal(winner: string, isWinner: boolean) {
    this.winnerName.set(winner);
    this.isWinner.set(isWinner);
  }

  closeWinnerModal() {
    this.winnerName.set(null);
    this.isWinner.set(false);
    this.group.leaveEndedGame();
  }

}

function fastContentDialogue(content: EventContent, target: InGamePokemon): DialogueSequence {
  if (!content) return [];

  switch (content.type) {
    case 'damage':
      return damageDialogue(content, target);
    case 'heal':
      return healDialogue(content, target);
    default: return [];
  }
}

function fullContentDialogue(content: EventContent, target: InGamePokemon): DialogueSequence {
  if (!content) return ['But failed!', { type: 'jump' },];

  switch (content.type) {
    case 'damage':
      return fullDamageDialogue(content, target);
    case 'heal':
      return [...healDialogue(content, target), { type: 'jump' }];
    default: return [];
  }
}

function fullDamageDialogue(damage: Damage, target: InGamePokemon): DialogueSequence {
  const dialogue: DialogueSequence = [
    ...damageDialogue(damage, target),
    { type: 'jump' },
  ];

  if (damage.isCrit) {
    dialogue.push('A critical hit!');
    dialogue.push({ type: 'jump' });
  }

  switch (damage.effectiveness) {
    case 4:
    case 2:
      dialogue.push("It’s super effective!");
      dialogue.push({ type: 'jump' });
      break;
    case 0.25:
    case 0.5:
      dialogue.push("It’s not very effective…");
      dialogue.push({ type: 'jump' });
      break;
    case 0:
      dialogue.push(`It doesn't affect ${nameOf(target)}!`);
      dialogue.push({ type: 'jump' });
      break;
  }
  return dialogue;
}

function damageDialogue(damage: Damage, target: InGamePokemon): DialogueSequence {
  return [{
    type: 'action', action: () => {
      target.hp = Math.max(0, target.hp - damage.amount);
    }
  }];
}

function healDialogue(heal: Heal, target: InGamePokemon): DialogueSequence {
  return [{
    type: 'action', action: () => {
      target.hp = Math.min(target.stats.hp, target.hp + heal.amount);
    }
  }];
}

function nameOf(pokemon: InGamePokemon): string {
  return pokemon.name ?? getPokemon(pokemon.pokedexIdx).name;
}
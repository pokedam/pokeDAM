import { pokemon as getPokemon, type Damage, type Effectiveness, type GameHistory, type InGamePokemon, type MovKey, type MovMap, type MovRef, type MovUsedEvent, type PlayerId, type PlayRequest, type PokemonRef, type PokemonType, type PokemonTypes, type StartGamePlayer, type StatModification, type Stats, type TargetedContent, type TurnHistory } from "shared_types";

export type DamageClass = 'physical' | 'special';


export interface Game {
    board: Map<PlayerId, Player>;
    history: GameHistory,
    turn: number;
}

export interface Player {
    start: StartGamePlayer,
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: ValidatedRequest | null;
}

export interface ValidatedRequest extends PlayRequest {
    priority: number;
}


export interface Attack {
    amount: number,
    class: DamageClass,
    type: PokemonType,
    precision?: number,
    critChance?: number,
}

export interface ValidationContext<T> {
    board: Map<PlayerId, Player>;
    movRef: MovRef,
    payload: T;
}

export interface ExecutionContext<T> extends ValidationContext<T> {
    history: TurnHistory;
}


const BASE_CRIT_CHANCE = 1 / 24;

const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
    normal: { rock: 0.5, steel: 0.5, ghost: 0 },
    fire: { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
    water: { fire: 2, ground: 2, rock: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
    grass: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
    ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
    fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0 },
    poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
    ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
    flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
    bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
    rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
    ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
    dragon: { dragon: 2, steel: 0.5, fairy: 0 },
    steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
    fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
    dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 }
};

function effectiveness(attack: PokemonType, receiver: PokemonTypes): Effectiveness {
    const mainMult = TYPE_CHART[attack]?.[receiver.main] ?? 1;
    const secMult = receiver.secondary ? (TYPE_CHART[attack]?.[receiver.secondary] ?? 1) : 1;
    return (mainMult * secMult) as Effectiveness;
}


function calcaulateDamage(attack: Attack, stats: Stats, target: InGamePokemon): Damage | null {
    if (attack.precision && Math.random() > attack.precision) {
        return null;
    }

    const targetPokemon = getPokemon(target.pokedexIdx);
    const eff = effectiveness(attack.type, targetPokemon.types);
    if (eff === 0) {
        return { type: 'damage', amount: 0, effectiveness: 0, isCrit: false };
    }

    const isCrit = Math.random() < (attack.critChance ?? BASE_CRIT_CHANCE);
    const critMult = isCrit ? 1.5 : 1.0;

    const attackStat = attack.class === 'physical' ? stats.attack : stats.specialAttack;
    const defenseStat = attack.class === 'physical' ? target.stats.defense : target.stats.specialDefense;

    const baseDamage = (22 * attack.amount * (attackStat / defenseStat)) / 50 + 2;

    const randomMult = 0.85 + Math.random() * 0.15;

    const finalDamage = Math.floor(baseDamage * critMult * eff * randomMult);
    const amount = Math.max(1, finalDamage);

    return {
        type: 'damage',
        amount,
        effectiveness: eff,
        isCrit
    };
}

export function validateAlways(ctx: ValidationContext<any>): number {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    const pkmn = player.actives[ctx.movRef.pokemonIdx];
    if (!pkmn) return 0;
    return pkmn.stats.speed;
}

export function validateDamage(ctx: ValidationContext<PokemonRef>): number {
    if (ctx.payload.playerId === ctx.movRef.playerId) throw Error("Player can't attack himself");
    return validateAlways({
        ...ctx,
        payload: null
    });
}

export function healAllies(ctx: ExecutionContext<null>, amount: number) {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    ctx.history.push({
        key: 'content',
        dealer: ctx.movRef,
        contents: player.pokemons.map((_, idx) => healInternal({
            ...ctx,
            payload: {
                playerId: ctx.movRef.playerId,
                pokemonIdx: idx,
            },
        }, amount)).filter((c): c is TargetedContent => c !== undefined),
    })
}


export function healSelf(ctx: ExecutionContext<null>, amount: number) {
    heal({
        ...ctx,
        payload: ctx.movRef,
    }, amount);
}

export function heal(ctx: ExecutionContext<PokemonRef>, amount: number) {
    const heal = healInternal(ctx, amount);
    if (heal)
        ctx.history.push({
            key: "content",
            dealer: ctx.movRef,
            contents: [{
                target: ctx.payload,
                content: {
                    type: 'heal',
                    amount,
                }
            }]
        });
}

function healInternal(ctx: ExecutionContext<PokemonRef>, amount: number): TargetedContent | undefined {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    const pkmn = player.actives[ctx.movRef.pokemonIdx];

    if (!pkmn || pkmn.hp <= 0) return;

    const targetPlayer = ctx.board.get(ctx.payload.playerId)!;
    const targetPkmn = targetPlayer.actives[ctx.payload.pokemonIdx];

    if (!targetPkmn || targetPkmn.hp <= 0) return;

    targetPkmn.hp = Math.min(targetPkmn.stats.hp, targetPkmn.hp + amount);
    return {
        target: ctx.payload,
        content: {
            type: 'heal',
            amount,
        }
    };
}

export function modifyAllies(ctx: ExecutionContext<null>, modification: (stats: Stats) => StatModification) {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    ctx.history.push({
        key: 'content',
        dealer: ctx.movRef,
        contents: player.pokemons.map((_, idx) => modifyStatsInternal({
            ...ctx,
            payload: {
                playerId: ctx.movRef.playerId,
                pokemonIdx: idx,
            },
        }, modification)).filter((c): c is TargetedContent => c !== undefined),
    })
}

export function modifySelf(ctx: ExecutionContext<null>, modification: (stats: Stats) => StatModification) {
    modifyStats({
        ...ctx,
        payload: ctx.movRef,
    }, modification);
}

export const modify = modifyStats;

export function modifyStats(ctx: ExecutionContext<PokemonRef>, modificator: (stats: Stats) => StatModification) {
    const mod = modifyStatsInternal(ctx, modificator);
    if (mod)
        ctx.history.push({
            key: "content",
            dealer: ctx.movRef,
            contents: [mod]
        });
}

export function modifyStatsInternal(ctx: ExecutionContext<PokemonRef>, modificator: (stats: Stats) => StatModification): TargetedContent | undefined {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    const pkmn = player.actives[ctx.movRef.pokemonIdx];

    if (!pkmn || pkmn.hp <= 0) return;

    const targetPlayer = ctx.board.get(ctx.payload.playerId)!;
    const targetPkmn = targetPlayer.actives[ctx.payload.pokemonIdx];

    if (!targetPkmn || targetPkmn.hp <= 0) return;

    return {
        target: ctx.payload,
        content: modificator(targetPkmn.stats),
    };
}

export function dealDamage(ctx: ExecutionContext<PokemonRef>, attack: Attack) {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    const pkmn = player.actives[ctx.movRef.pokemonIdx]!;

    //Pokemon will not attack if it has fainted during the turn
    if (pkmn.hp <= 0) return;

    const opp = ctx.board.get(ctx.payload.playerId)!;
    const oppPkmn = opp.actives[ctx.payload.pokemonIdx]!;


    const damage = calcaulateDamage(
        attack,
        pkmn.stats,
        oppPkmn
    );
    ctx.history.push({
        key: "content",
        dealer: ctx.movRef,
        contents: [{
            target: ctx.payload,
            content: damage,
        }]
    });
    if (damage) {
        oppPkmn.hp = Math.max(0, oppPkmn.hp - damage.amount);
        if (oppPkmn.hp <= 0) ctx.history.push({
            key: 'pokemon_fainted',
            pokemon: ctx.payload,
        });
    }
}

export function dealDamagesRandomly(ctx: ExecutionContext<null>, attack: Attack, count: number) {
    let i = 0;
    ctx.history.push({
        key: 'content',
        dealer: ctx.movRef,
        contents: Array.from({ length: count }, () => dealDamageRandomlyInternal(ctx, attack)).filter((c): c is TargetedContent => c !== undefined),
    })

}

export function dealDamageRandomly(ctx: ExecutionContext<null>, attack: Attack) {
    const damage = dealDamageRandomlyInternal(ctx, attack);
    ctx.history.push({
        key: "content",
        dealer: ctx.movRef,
        contents: damage ? [damage] : [],
    });

}

function dealDamageRandomlyInternal(ctx: ExecutionContext<null>, attack: Attack): TargetedContent | undefined {
    const player = ctx.board.get(ctx.movRef.playerId)!;
    const pkmn = player.actives[ctx.movRef.pokemonIdx]!;

    if (pkmn.hp <= 0) return;

    const opps = Array.from(ctx.board.entries()).filter(([id, _]) => ctx.movRef.playerId !== id);
    const oppEntry = opps[Math.floor(Math.random() * opps.length)];
    if (!oppEntry) return;
    const [oppId, opp] = oppEntry;
    const oppPkmns = opp.actives.filter(opp => opp && opp.hp >= 0);
    const oppIdx = Math.floor(Math.random() * oppPkmns.length);
    const oppPkmn = oppPkmns[oppIdx]!;
    const oppRef = {
        playerId: oppId,
        pokemonIdx: oppIdx,
    };

    const damage = calcaulateDamage(
        attack,
        pkmn.stats,
        oppPkmn
    );

    if (damage) {
        oppPkmn.hp = Math.max(0, oppPkmn.hp - damage.amount);
        if (oppPkmn.hp <= 0) ctx.history.push({
            key: 'pokemon_fainted',
            pokemon: oppRef,
        });
    }

    return {
        target: oppRef,
        content: damage,
    };

}
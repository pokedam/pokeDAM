import type { MovKey, MovMap } from "shared_types";
import {
    dealDamage,
    dealDamageRandomly,
    heal,
    healAllies,
    healSelf,
    modify,
    modifyAllies,
    modifySelf,
    validateAlways,
    validateDamage,
    type ExecutionContext,
    type ValidationContext
} from "./sim.js";

type MovLogicMap = {
    [K in MovKey]: {
        validate: (ctx: ValidationContext<MovMap[K]>) => number;
        execute: (ctx: ExecutionContext<MovMap[K]>) => void;
    };
};

export const MOV_MAP: MovLogicMap = {
    // Normal
    destructor: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'physical', type: 'normal' })
    },
    hyperBeam: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 150, class: 'special', type: 'normal' })
    },
    megaPunch: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'normal', precision: 0.8 })
    },
    recover: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 50)
    },
    cheerUp: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.attack = Math.floor(s.attack * 1.25); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    helpingHand: {
        validate: validateAlways,
        execute: (ctx): void => modify(ctx, (s) => { s.attack = Math.floor(s.attack * 1.5); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    // Fire
    ember: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'special', type: 'fire' })
    },
    overheat: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 130, class: 'special', type: 'fire' })
    },
    fireBlast: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'fire', precision: 0.85 })
    },
    sunnyDay: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.25); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    warmHeal: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 60)
    },
    flameChargeBuff: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.speed = Math.floor(s.speed * 1.5); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    // Water
    waterGun: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'special', type: 'water' })
    },
    hydroCannon: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 150, class: 'special', type: 'water' })
    },
    hydroPump: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'water', precision: 0.8 })
    },
    lifeDew: {
        validate: validateAlways,
        execute: (ctx): void => healAllies(ctx, 40)
    },
    rainDance: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.speed = Math.floor(s.speed * 1.25); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    aquaRing: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 40)
    },
    // Grass
    vineWhip: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 45, class: 'physical', type: 'grass' })
    },
    frenzyPlant: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 150, class: 'special', type: 'grass' })
    },
    leafStorm: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 130, class: 'special', type: 'grass', precision: 0.85 })
    },
    synthesis: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    aromatherapy: {
        validate: validateAlways,
        execute: (ctx): void => healAllies(ctx, 50)
    },
    cottonGuard: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.75); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    // Electric
    thunderShock: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'special', type: 'electric' })
    },
    zapCannon: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'special', type: 'electric' })
    },
    thunder: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'electric', precision: 0.7 })
    },
    charge: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.5); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    magneticFlux: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.defense = Math.floor(s.defense * 1.25); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    sparkHeal: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 50)
    },
    // Ice
    iceShard: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'physical', type: 'ice' })
    },
    freezeDry: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 130, class: 'special', type: 'ice' })
    },
    blizzard: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'ice', precision: 0.7 })
    },
    snowscape: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.defense = Math.floor(s.defense * 1.25); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    iceShield: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.5); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    chillPill: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 50)
    },
    // Fighting
    karateChop: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 50, class: 'physical', type: 'fighting' })
    },
    closeCombat: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'physical', type: 'fighting' })
    },
    dynamicPunch: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'fighting', precision: 0.5 })
    },
    bulkUp: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.attack = Math.floor(s.attack * 1.5); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    coaching: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.attack = Math.floor(s.attack * 1.25); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    meditate: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.attack = Math.floor(s.attack * 1.5); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    // Poison
    poisonSting: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 35, class: 'physical', type: 'poison' })
    },
    sludgeWave: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'special', type: 'poison' })
    },
    gunkShot: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'physical', type: 'poison', precision: 0.8 })
    },
    acidArmor: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.75); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    toxicBarrier: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.specialDefense = Math.floor(s.specialDefense * 1.25); return { type: 'mod', class: 'increase', stat: 'specialDefense' }; })
    },
    purify: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 60)
    },
    // Ground
    mudSlap: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'special', type: 'ground' })
    },
    earthquake: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'ground' })
    },
    mudBomb: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 65, class: 'special', type: 'ground', precision: 0.85 })
    },
    spikesShield: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.5); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    shoreUp: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    earthBlessing: {
        validate: validateAlways,
        execute: (ctx): void => healAllies(ctx, 45)
    },
    // Flying
    peck: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 35, class: 'physical', type: 'flying' })
    },
    braveBird: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'physical', type: 'flying' })
    },
    hurricane: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'flying', precision: 0.7 })
    },
    roost: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    tailwind: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.speed = Math.floor(s.speed * 1.5); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    featherDanceBuff: {
        validate: validateAlways,
        execute: (ctx): void => modify(ctx, (s) => { s.defense = Math.floor(s.defense * 1.5); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    // Psychic
    confusion: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 50, class: 'special', type: 'psychic' })
    },
    psychoBoost: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 140, class: 'special', type: 'psychic' })
    },
    zenHeadbutt: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 80, class: 'physical', type: 'psychic', precision: 0.9 })
    },
    calmMind: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.5); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    healPulse: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 60)
    },
    reflect: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.defense = Math.floor(s.defense * 1.25); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    // Bug
    furyCutter: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'physical', type: 'bug' })
    },
    bugBuzz: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 90, class: 'special', type: 'bug' })
    },
    megahorn: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'physical', type: 'bug', precision: 0.85 })
    },
    quiverDance: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.5); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    pollenPuffHeal: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 60)
    },
    swarmBoost: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.speed = Math.floor(s.speed * 1.25); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    // Rock
    rockThrow: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 50, class: 'physical', type: 'rock' })
    },
    headSmash: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 150, class: 'physical', type: 'rock' })
    },
    stoneEdge: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'rock', precision: 0.8 })
    },
    rockPolish: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.speed = Math.floor(s.speed * 1.75); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    wideGuard: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.defense = Math.floor(s.defense * 1.25); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    stoneRest: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    // Ghost
    astonish: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 30, class: 'physical', type: 'ghost' })
    },
    shadowForce: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 120, class: 'physical', type: 'ghost' })
    },
    shadowClaw: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 70, class: 'physical', type: 'ghost', precision: 0.85 })
    },
    shadowShield: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.5); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    spiritShackleBuff: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.specialDefense = Math.floor(s.specialDefense * 1.25); return { type: 'mod', class: 'increase', stat: 'specialDefense' }; })
    },
    spectralRest: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    // Dragon
    dragonBreath: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 60, class: 'special', type: 'dragon' })
    },
    dracoMeteor: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 130, class: 'special', type: 'dragon' })
    },
    dragonRush: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'dragon', precision: 0.75 })
    },
    dragonDance: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.attack = Math.floor(s.attack * 1.5); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    dragonCheer: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.attack = Math.floor(s.attack * 1.25); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
    draconicAura: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialDefense = Math.floor(s.specialDefense * 1.5); return { type: 'mod', class: 'increase', stat: 'specialDefense' }; })
    },
    // Steel
    metalClaw: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 50, class: 'physical', type: 'steel' })
    },
    flashCannon: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'special', type: 'steel' })
    },
    ironTail: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'physical', type: 'steel', precision: 0.75 })
    },
    ironDefense: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.defense = Math.floor(s.defense * 1.75); return { type: 'mod', class: 'increase', stat: 'defense' }; })
    },
    gearUp: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.speed = Math.floor(s.speed * 1.25); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    metallicShine: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.5); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    // Fairy
    fairyWind: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 40, class: 'special', type: 'fairy' })
    },
    fleurCannon: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 130, class: 'special', type: 'fairy' })
    },
    playRough: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 90, class: 'physical', type: 'fairy', precision: 0.9 })
    },
    moonlight: {
        validate: validateAlways,
        execute: (ctx): void => healSelf(ctx, 60)
    },
    floralHealing: {
        validate: validateAlways,
        execute: (ctx): void => heal(ctx, 60)
    },
    mistyTerrain: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.specialDefense = Math.floor(s.specialDefense * 1.25); return { type: 'mod', class: 'increase', stat: 'specialDefense' }; })
    },
    // Dark
    bite: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 60, class: 'physical', type: 'dark' })
    },
    darkPulse: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 100, class: 'special', type: 'dark' })
    },
    darkBarrage: {
        validate: validateDamage,
        execute: (ctx): void => dealDamage(ctx, { amount: 110, class: 'physical', type: 'dark', precision: 0.8 })
    },
    nastyPlot: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.specialAttack = Math.floor(s.specialAttack * 1.75); return { type: 'mod', class: 'increase', stat: 'specialAttack' }; })
    },
    darkCloak: {
        validate: validateAlways,
        execute: (ctx): void => modifySelf(ctx, (s) => { s.speed = Math.floor(s.speed * 1.5); return { type: 'mod', class: 'increase', stat: 'speed' }; })
    },
    midnightCheer: {
        validate: validateAlways,
        execute: (ctx): void => modifyAllies(ctx, (s) => { s.attack = Math.floor(s.attack * 1.25); return { type: 'mod', class: 'increase', stat: 'attack' }; })
    },
};

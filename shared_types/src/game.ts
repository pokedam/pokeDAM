import { GameEndEvent } from "./lobby";
import { PlayerPokemon, Stats } from "./pokemon";

export type Effectiveness = 4 | 2 | 1 | 0.5 | 0.25 | 0;

export type PlayerId = number;
export type GroupId = string;
export type Id = PlayerId | GroupId;

// Refers to a pokemon in the game, 
// identified by the player it belongs to and its index in that player's team
export interface PokemonRef {
    playerId: PlayerId;
    pokemonIdx: number;
}

export interface MovRef extends PokemonRef {
    movIdx: number;
}

export interface Damage {
    type: 'damage',
    amount: number;
    effectiveness: Effectiveness;
    isCrit: boolean;
}

export interface Heal {
    type: 'heal',
    amount: number;
}

export type ModificationClass = 'increase' | 'decrease';
export type Stat = keyof Stats;

export interface StatModification {
    type: 'mod',
    class: ModificationClass,
    stat: Stat,
}

export type EventContent = Damage | Heal | StatModification | null;

export interface TargetedContent {
    target: PokemonRef,
    content: EventContent,
}

export interface MovUsedEvent {
    key: 'content',
    dealer: MovRef,
    contents: TargetedContent[],
}

export interface PokemonFaintedEvent {
    key: 'pokemon_fainted';
    pokemon: PokemonRef;
}
export type GameEvent = MovUsedEvent | PokemonFaintedEvent;

export type TurnHistory = GameEvent[];

export type GameHistory = TurnHistory[];

export interface PlayRequest {
    payload: Payload;
    pokemonIdx: number;
    movIdx: number;
    isReady: boolean;
}


// Collection of {key: payload} pairs describing all the movs in the game.
export type MovMap = {
    // Normal
    destructor: PokemonRef,
    hyperBeam: PokemonRef,
    megaPunch: PokemonRef,
    recover: null,
    cheerUp: null,
    helpingHand: PokemonRef,
    // Fire
    ember: PokemonRef,
    overheat: PokemonRef,
    fireBlast: PokemonRef,
    sunnyDay: null,
    warmHeal: PokemonRef,
    flameChargeBuff: null,
    // Water
    waterGun: PokemonRef,
    hydroCannon: PokemonRef,
    hydroPump: PokemonRef,
    lifeDew: null,
    rainDance: null,
    aquaRing: null,
    // Grass
    vineWhip: PokemonRef,
    frenzyPlant: PokemonRef,
    leafStorm: PokemonRef,
    synthesis: null,
    aromatherapy: null,
    cottonGuard: null,
    // Electric
    thunderShock: PokemonRef,
    zapCannon: PokemonRef,
    thunder: PokemonRef,
    charge: null,
    magneticFlux: null,
    sparkHeal: PokemonRef,
    // Ice
    iceShard: PokemonRef,
    freezeDry: PokemonRef,
    blizzard: PokemonRef,
    snowscape: null,
    iceShield: null,
    chillPill: null,
    // Fighting
    karateChop: PokemonRef,
    closeCombat: PokemonRef,
    dynamicPunch: PokemonRef,
    bulkUp: null,
    coaching: null,
    meditate: null,
    // Poison
    poisonSting: PokemonRef,
    sludgeWave: PokemonRef,
    gunkShot: PokemonRef,
    acidArmor: null,
    toxicBarrier: null,
    purify: PokemonRef,
    // Ground
    mudSlap: PokemonRef,
    earthquake: PokemonRef,
    mudBomb: PokemonRef,
    spikesShield: null,
    shoreUp: null,
    earthBlessing: null,
    // Flying
    peck: PokemonRef,
    braveBird: PokemonRef,
    hurricane: PokemonRef,
    roost: null,
    tailwind: null,
    featherDanceBuff: PokemonRef,
    // Psychic
    confusion: PokemonRef,
    psychoBoost: PokemonRef,
    zenHeadbutt: PokemonRef,
    calmMind: null,
    healPulse: PokemonRef,
    reflect: null,
    // Bug
    furyCutter: PokemonRef,
    bugBuzz: PokemonRef,
    megahorn: PokemonRef,
    quiverDance: null,
    pollenPuffHeal: PokemonRef,
    swarmBoost: null,
    // Rock
    rockThrow: PokemonRef,
    headSmash: PokemonRef,
    stoneEdge: PokemonRef,
    rockPolish: null,
    wideGuard: null,
    stoneRest: null,
    // Ghost
    astonish: PokemonRef,
    shadowForce: PokemonRef,
    shadowClaw: PokemonRef,
    shadowShield: null,
    spiritShackleBuff: null,
    spectralRest: null,
    // Dragon
    dragonBreath: PokemonRef,
    dracoMeteor: PokemonRef,
    dragonRush: PokemonRef,
    dragonDance: null,
    dragonCheer: null,
    draconicAura: null,
    // Steel
    metalClaw: PokemonRef,
    flashCannon: PokemonRef,
    ironTail: PokemonRef,
    ironDefense: null,
    gearUp: null,
    metallicShine: null,
    // Fairy
    fairyWind: PokemonRef,
    fleurCannon: PokemonRef,
    playRough: PokemonRef,
    moonlight: null,
    floralHealing: PokemonRef,
    mistyTerrain: null,
    // Dark
    bite: PokemonRef,
    darkPulse: PokemonRef,
    darkBarrage: PokemonRef,
    nastyPlot: null,
    darkCloak: null,
    midnightCheer: null,
};

// Collection of {key: number} pairs describing the PP amount for each mov.
const pps = {
    // Normal
    destructor: 32,
    hyperBeam: 5,
    megaPunch: 15,
    recover: 20,
    cheerUp: 15,
    helpingHand: 20,
    // Fire
    ember: 25,
    overheat: 5,
    fireBlast: 10,
    sunnyDay: 15,
    warmHeal: 20,
    flameChargeBuff: 20,
    // Water
    waterGun: 25,
    hydroCannon: 5,
    hydroPump: 10,
    lifeDew: 15,
    rainDance: 15,
    aquaRing: 20,
    // Grass
    vineWhip: 25,
    frenzyPlant: 5,
    leafStorm: 10,
    synthesis: 20,
    aromatherapy: 15,
    cottonGuard: 15,
    // Electric
    thunderShock: 30,
    zapCannon: 5,
    thunder: 10,
    charge: 20,
    magneticFlux: 15,
    sparkHeal: 20,
    // Ice
    iceShard: 30,
    freezeDry: 5,
    blizzard: 10,
    snowscape: 15,
    iceShield: 20,
    chillPill: 20,
    // Fighting
    karateChop: 25,
    closeCombat: 5,
    dynamicPunch: 10,
    bulkUp: 20,
    coaching: 15,
    meditate: 20,
    // Poison
    poisonSting: 35,
    sludgeWave: 5,
    gunkShot: 10,
    acidArmor: 20,
    toxicBarrier: 15,
    purify: 20,
    // Ground
    mudSlap: 30,
    earthquake: 5,
    mudBomb: 10,
    spikesShield: 20,
    shoreUp: 20,
    earthBlessing: 15,
    // Flying
    peck: 35,
    braveBird: 5,
    hurricane: 10,
    roost: 20,
    tailwind: 15,
    featherDanceBuff: 20,
    // Psychic
    confusion: 25,
    psychoBoost: 5,
    zenHeadbutt: 15,
    calmMind: 20,
    healPulse: 20,
    reflect: 15,
    // Bug
    furyCutter: 20,
    bugBuzz: 5,
    megahorn: 10,
    quiverDance: 20,
    pollenPuffHeal: 20,
    swarmBoost: 15,
    // Rock
    rockThrow: 15,
    headSmash: 5,
    stoneEdge: 10,
    rockPolish: 20,
    wideGuard: 15,
    stoneRest: 20,
    // Ghost
    astonish: 25,
    shadowForce: 5,
    shadowClaw: 15,
    shadowShield: 20,
    spiritShackleBuff: 15,
    spectralRest: 20,
    // Dragon
    dragonBreath: 20,
    dracoMeteor: 5,
    dragonRush: 10,
    dragonDance: 20,
    dragonCheer: 15,
    draconicAura: 20,
    // Steel
    metalClaw: 35,
    flashCannon: 5,
    ironTail: 15,
    ironDefense: 20,
    gearUp: 15,
    metallicShine: 20,
    // Fairy
    fairyWind: 30,
    fleurCannon: 5,
    playRough: 10,
    moonlight: 20,
    floralHealing: 20,
    mistyTerrain: 15,
    // Dark
    bite: 25,
    darkPulse: 5,
    darkBarrage: 10,
    nastyPlot: 20,
    darkCloak: 20,
    midnightCheer: 15,
} satisfies { [M in MovKey]: number };

// Collection of {key: string} with a short description for each move.
const descriptions = {
    // Normal
    destructor: "A powerful strike with claws or tail.",
    hyperBeam: "A devastating beam of pure energy that deals massive damage.",
    megaPunch: "A punch infused with incredible force, but difficult to land.",
    recover: "Restores HP to the user.",
    cheerUp: "Increases attack of all allies.",
    helpingHand: "Increases attack of a single ally.",
    // Fire
    ember: "Launches small flames at the enemy.",
    overheat: "A scorching attack of enormous power that exhausts the user.",
    fireBlast: "A powerful burst of fire that may fail.",
    sunnyDay: "Increases specialAttack of all allies.",
    warmHeal: "Gently warms an ally to restore HP.",
    flameChargeBuff: "Increases speed of the user.",
    // Water
    waterGun: "Fires a fast jet of water at the enemy.",
    hydroCannon: "Launches a high-pressure water cannon blast.",
    hydroPump: "Releases a torrent of water at extreme speed and power.",
    lifeDew: "Scatters water to heal all allies.",
    rainDance: "Increases speed of all allies.",
    aquaRing: "Surrounds the user with water to heal HP.",
    // Grass
    vineWhip: "Strikes the enemy with whip-like vines.",
    frenzyPlant: "Attacks with giant, enraged roots.",
    leafStorm: "Summons a powerful storm of sharp leaves.",
    synthesis: "Absorbs sunlight to restore HP.",
    aromatherapy: "Soothing scent heals all allies.",
    cottonGuard: "Drastically increases defense.",
    // Electric
    thunderShock: "An electrical shock that strikes the target.",
    zapCannon: "Fires an unstable and devastating electric sphere.",
    thunder: "Calls down a powerful and brutal lightning strike.",
    charge: "Charges power, increasing specialAttack.",
    magneticFlux: "Magnetic fields increase defense of allies.",
    sparkHeal: "Electric stimulation restores ally HP.",
    // Ice
    iceShard: "Launches sharp ice fragments at high speed.",
    freezeDry: "Instantly freezes the enemy with glacial cold.",
    blizzard: "Unleashes a violent and freezing snowstorm.",
    snowscape: "Cold snow increases defense of allies.",
    iceShield: "Creates an ice barrier increasing defense.",
    chillPill: "A refreshing chill restores user HP.",
    // Fighting
    karateChop: "A slicing strike performed with an open hand.",
    closeCombat: "Engages in relentless close-range combat.",
    dynamicPunch: "A powerful and unpredictable punch that is hard to avoid.",
    bulkUp: "Flexes muscles to increase attack.",
    coaching: "Inspires allies, increasing attack and defense.",
    meditate: "Calms the spirit to increase attack.",
    // Poison
    poisonSting: "Attacks with a toxin-coated stinger or spike.",
    sludgeWave: "Floods the battlefield with highly toxic sludge.",
    gunkShot: "Hurls a large mass of toxic waste at the opponent.",
    acidArmor: "Liquefies the body to increase defense.",
    toxicBarrier: "Creates a poison mist increasing specialDefense.",
    purify: "Cleanses toxins to heal an ally.",
    // Ground
    mudSlap: "Throws mud directly into the target’s face.",
    earthquake: "Shakes the ground with great ferocity and power.",
    mudBomb: "Launches a dense ball of heavy mud.",
    spikesShield: "Hardens ground around user to increase defense.",
    shoreUp: "Gathers sand to restore HP.",
    earthBlessing: "Ground energy restores HP to all allies.",
    // Flying
    peck: "Quickly strikes the enemy with a sharp beak.",
    braveBird: "A reckless diving strike that deals heavy damage.",
    hurricane: "Creates a hurricane of cutting, violent winds.",
    roost: "Lands on the ground to rest and heal HP.",
    tailwind: "Whips up a turbulent whirlwind increasing allies' speed.",
    featherDanceBuff: "Beautiful feathers increase ally defense.",
    // Psychic
    confusion: "Attacks the enemy’s mind with psychic energy.",
    psychoBoost: "Releases all stored mental power in a single strike.",
    zenHeadbutt: "Focuses willpower into the forehead for a headbutt.",
    calmMind: "Focuses mind to increase specialAttack.",
    healPulse: "Emits a healing pulse to restore an ally's HP.",
    reflect: "Creates a psychic wall increasing defense for allies.",
    // Bug
    furyCutter: "Rapidly slashes the enemy with claws or scythes.",
    bugBuzz: "Emits high-pitched sound waves from its wings.",
    megahorn: "Violently charges using massive horns.",
    quiverDance: "A beautiful dance increasing specialAttack and speed.",
    pollenPuffHeal: "Nutritious pollen puff that heals an ally.",
    swarmBoost: "Insect hum increases speed of all allies.",
    // Rock
    rockThrow: "Throws heavy rocks to crush the target.",
    headSmash: "A brutal headbutt with rock-like hardness.",
    stoneEdge: "Summons sharp stalagmites beneath the enemy.",
    rockPolish: "Polishes body to sharply increase speed.",
    wideGuard: "Rock wall protects allies, increasing defense.",
    stoneRest: "Hardens into unmoving stone to restore HP.",
    // Ghost
    astonish: "Suddenly shocks the opponent with a frightening cry.",
    shadowForce: "Vanishing into shadows before delivering a lethal strike.",
    shadowClaw: "Slashes the opponent with shadowy claws.",
    shadowShield: "Wraps in shadows to increase defense.",
    spiritShackleBuff: "Ghostly aura increases specialDefense of allies.",
    spectralRest: "Absorbs ambient spirit energy to restore HP.",
    // Dragon
    dragonBreath: "Exhales a breath infused with draconic power.",
    dracoMeteor: "Summons a rain of meteors upon the target.",
    dragonRush: "Engulfs itself in intimidating aura and charges fiercely.",
    dragonDance: "Mystical dance increasing attack.",
    dragonCheer: "Draconic roar inspires allies, increasing attack.",
    draconicAura: "Surrounds with aura to increase specialDefense.",
    // Steel
    metalClaw: "Swiftly strikes with hardened steel claws.",
    flashCannon: "Focuses metallic light into a powerful beam.",
    ironTail: "Strikes with a tail as hard as forged iron.",
    ironDefense: "Hardens body to sharply increase defense.",
    gearUp: "Engages gears to increase speed of allies.",
    metallicShine: "Shines brightly to increase specialAttack.",
    // Fairy
    fairyWind: "Summons a magical wind infused with fairy dust.",
    fleurCannon: "Releases a dazzling torrent of mystical floral energy.",
    playRough: "Playfully rough behavior that deals damage.",
    moonlight: "Basks in moonlight to restore HP.",
    floralHealing: "Restores an ally's HP with flowers.",
    mistyTerrain: "Fairy mist increases specialDefense of allies.",
    // Dark
    bite: "Fiercely bites with sharp dark fangs.",
    darkPulse: "Releases a wave of dark and terrifying aura.",
    darkBarrage: "A relentless barrage of attacks from the shadows.",
    nastyPlot: "Thinks bad thoughts to sharply increase specialAttack.",
    darkCloak: "Conceals in darkness to increase speed.",
    midnightCheer: "Shadows bolster allies, increasing attack.",
} satisfies { [M in MovKey]: string | undefined };

// Collection of {key: string} with a friendly display name for each move.
const displayNames = {
    // Normal
    destructor: "Destructor",
    hyperBeam: "Hyper Beam",
    megaPunch: "Mega Punch",
    recover: "Recover",
    cheerUp: "Cheer Up",
    helpingHand: "Helping Hand",
    // Fire
    ember: "Ember",
    overheat: "Overheat",
    fireBlast: "Fire Blast",
    sunnyDay: "Sunny Day",
    warmHeal: "Warm Heal",
    flameChargeBuff: "Flame Charge",
    // Water
    waterGun: "Water Gun",
    hydroCannon: "Hydro Cannon",
    hydroPump: "Hydro Pump",
    lifeDew: "Life Dew",
    rainDance: "Rain Dance",
    aquaRing: "Aqua Ring",
    // Grass
    vineWhip: "Vine Whip",
    frenzyPlant: "Frenzy Plant",
    leafStorm: "Leaf Storm",
    synthesis: "Synthesis",
    aromatherapy: "Aromatherapy",
    cottonGuard: "Cotton Guard",
    // Electric
    thunderShock: "Thunder Shock",
    zapCannon: "Zap Cannon",
    thunder: "Thunder",
    charge: "Charge",
    magneticFlux: "Magnetic Flux",
    sparkHeal: "Spark Heal",
    // Ice
    iceShard: "Ice Shard",
    freezeDry: "Freeze-Dry",
    blizzard: "Blizzard",
    snowscape: "Snowscape",
    iceShield: "Ice Shield",
    chillPill: "Chill Pill",
    // Fighting
    karateChop: "Karate Chop",
    closeCombat: "Close Combat",
    dynamicPunch: "Dynamic Punch",
    bulkUp: "Bulk Up",
    coaching: "Coaching",
    meditate: "Meditate",
    // Poison
    poisonSting: "Poison Sting",
    sludgeWave: "Sludge Wave",
    gunkShot: "Gunk Shot",
    acidArmor: "Acid Armor",
    toxicBarrier: "Toxic Barrier",
    purify: "Purify",
    // Ground
    mudSlap: "Mud-Slap",
    earthquake: "Earthquake",
    mudBomb: "Mud Bomb",
    spikesShield: "Spikes Shield",
    shoreUp: "Shore Up",
    earthBlessing: "Earth Blessing",
    // Flying
    peck: "Peck",
    braveBird: "Brave Bird",
    hurricane: "Hurricane",
    roost: "Roost",
    tailwind: "Tailwind",
    featherDanceBuff: "Feather Dance",
    // Psychic
    confusion: "Confusion",
    psychoBoost: "Psycho Boost",
    zenHeadbutt: "Zen Headbutt",
    calmMind: "Calm Mind",
    healPulse: "Heal Pulse",
    reflect: "Reflect",
    // Bug
    furyCutter: "Fury Cutter",
    bugBuzz: "Bug Buzz",
    megahorn: "Megahorn",
    quiverDance: "Quiver Dance",
    pollenPuffHeal: "Pollen Puff",
    swarmBoost: "Swarm Boost",
    // Rock
    rockThrow: "Rock Throw",
    headSmash: "Head Smash",
    stoneEdge: "Stone Edge",
    rockPolish: "Rock Polish",
    wideGuard: "Wide Guard",
    stoneRest: "Stone Rest",
    // Ghost
    astonish: "Astonish",
    shadowForce: "Shadow Force",
    shadowClaw: "Shadow Claw",
    shadowShield: "Shadow Shield",
    spiritShackleBuff: "Spirit Shackle",
    spectralRest: "Spectral Rest",
    // Dragon
    dragonBreath: "Dragon Breath",
    dracoMeteor: "Draco Meteor",
    dragonRush: "Dragon Rush",
    dragonDance: "Dragon Dance",
    dragonCheer: "Dragon Cheer",
    draconicAura: "Draconic Aura",
    // Steel
    metalClaw: "Metal Claw",
    flashCannon: "Flash Cannon",
    ironTail: "Iron Tail",
    ironDefense: "Iron Defense",
    gearUp: "Gear Up",
    metallicShine: "Metallic Shine",
    // Fairy
    fairyWind: "Fairy Wind",
    fleurCannon: "Fleur Cannon",
    playRough: "Play Rough",
    moonlight: "Moonlight",
    floralHealing: "Floral Healing",
    mistyTerrain: "Misty Terrain",
    // Dark
    bite: "Bite",
    darkPulse: "Dark Pulse",
    darkBarrage: "Dark Barrage",
    nastyPlot: "Nasty Plot",
    darkCloak: "Dark Cloak",
    midnightCheer: "Midnight Cheer",
} satisfies { [M in MovKey]: string };

export function mov(key: MovKey): Mov {
    return { key, pp: pps[key], description: descriptions[key], displayName: displayNames[key] };
}

export function getMaxPp(key: MovKey): number {
    return pps[key];
}

export type MovKey = keyof MovMap;

// Message to be sent to the server describing the mov.
export type Payload = { [Key in MovKey]: MovMap[Key] }[MovKey]

export interface Mov { key: MovKey, pp: number, description: string | undefined, displayName: string }

export interface InGamePokemon {
    id: number;
    name: string | null;
    pokedexIdx: number;
    movs: Mov[];
    stats: Stats;
    hp: number;
}



export interface InGamePlayer {
    id: PlayerId;
    nickname: string;
    pokemons: InGamePokemon[];
    actives: (InGamePokemon | null)[];
    request: boolean;
}

export interface StartGamePlayer {
    nickname: string;
    pokemons: PlayerPokemon[];
}

export interface SummaryGamePlayer extends StartGamePlayer {
    id: PlayerId;
}

export type StartGame = StartGamePlayer[];
export type SummaryGame = SummaryGamePlayer[];
export type InGame = InGamePlayer[];

export interface GameSummary {
    date?: number,
    initialGame: SummaryGame,
    history: GameHistory,
    end: GameEndEvent,
}
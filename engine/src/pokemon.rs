use arrayvec::ArrayVec;
use derive_more::{Deref, DerefMut};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Pokemon {
    pub name: String,
    pub level: u8,
    pub types: crate::PokemonTypes,
    pub stats: Stats,
    pub status: PokemonStatus,
    pub movs: ArrayVec<PokemonMov, 4>,
}

#[derive(Serialize, Deserialize, Deref, DerefMut)]
pub struct Stats {
    #[deref]
    #[deref_mut]
    pub stats: types::Stats,
    pub hp: u16,
    pub evasion: u16,
    pub precision: u16,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub struct PokemonMov {
    pub id: u16,
    pub pp: u8,
}

bitflags::bitflags! {
    /// Representa los diferentes estados (persistentes y volátiles) que puede tener un Pokémon.
    #[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Default, Serialize, Deserialize)]
    pub struct PokemonStatus: u32 {
        /// The Pokémon has a 25% chance of not attacking and its speed is halved.
        const PARALYZED = 1 << 0;
        /// The Pokémon loses 1/16 of its total HP each turn and its attack is halved.
        const BURNED = 1 << 1;
        /// The Pokémon loses 1/8 of its total HP each turn.
        const POISONED = 1 << 2;
        /// The Pokémon loses 1/16 of its total HP on the first turn and the damage increases by 1/16 each turn.
        const BADLY_POISONED = 1 << 3;
        /// The Pokémon falls asleep and cannot attack. It will wake up after 1 to 3 turns.
        const ASLEEP = 1 << 4;
        /// Has a 50% chance of not attacking, and takes more damage from attacks. (Legends Arceus)
        const DROWSY = 1 << 5;
        /// The Pokémon cannot attack, each turn has a 20% chance to thaw out.
        const FROZEN = 1 << 6;
        /// Loses 1/16 of its total HP each turn and its special attack is halved. (Legends Arceus)
        const FROSTBITE = 1 << 7;
        /// The Pokémon has a 1/3 chance of hurting itself.
        const CONFUSED = 1 << 8;
        /// The Pokémon loses 1/4 of its total HP each turn.
        const CURSED = 1 << 9;
        /// The Pokémon has a 1/4 chance of not attacking.
        const INFATUATED = 1 << 10;
        /// The Pokémon cannot be switched out or flee from battle.
        const CANNOT_ESCAPE = 1 << 11;
        /// Takes damage for several turns, during which it cannot be switched out or flee.
        const TRAPPED = 1 << 12;
        /// Loses 1/8 of its total HP each turn, which is recovered by the opponent.
        const LEECH_SEED = 1 << 13;
        /// Receives a countdown and will faint after 3 turns.
        const PERISH_COUNT = 1 << 14;
        /// The Pokémon becomes the target of all attacks.
        const SPOTLIGHT = 1 << 15;
        /// The Pokémon cannot attack that turn.
        const FLINCHED = 1 << 16;
        /// The Pokémon is immobilized and easier to catch.
        const FATIGUE = 1 << 17;
        /// The Pokémon has fainted and cannot battle.
        const FAINTED = 1 << 18;
    }
}

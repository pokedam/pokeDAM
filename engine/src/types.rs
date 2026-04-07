use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub enum PokemonType {
    Normal,
    Fighting,
    Flying,
    Poison,
    Ground,
    Rock,
    Bug,
    Ghost,
    Steel,
    Fire,
    Water,
    Grass,
    Electric,
    Psychic,
    Ice,
    Dragon,
    Dark,
    Fairy,
    Stellar,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct PokemonTypes(pub PokemonType, pub Option<PokemonType>);

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Effectiveness {
    Quadruple,        // ++
    SuperEffective,   // +
    Regular,          // default
    NotVeryEffective, // -
    Quarter,          // --
    Immune,           // sin efecto
}

impl Effectiveness {
    pub const fn multiplier(&self) -> u32 {
        match self {
            Effectiveness::Quadruple => 16,
            Effectiveness::SuperEffective => 8,
            Effectiveness::Regular => 4,
            Effectiveness::NotVeryEffective => 2,
            Effectiveness::Quarter => 1,
            Effectiveness::Immune => 0,
        }
    }
}

impl PokemonType {
    pub fn effectiveness_against(self, defender_types: PokemonTypes) -> Effectiveness {
        use Effectiveness::*;

        let eff1 = self.effectiveness_against_single(defender_types.0);
        let eff2 = defender_types
            .1
            .map(|t| self.effectiveness_against_single(t))
            .unwrap_or(Regular);

        match (eff1, eff2) {
            (Immune, _) | (_, Immune) => Immune,
            (SuperEffective, SuperEffective) => Quadruple,
            (NotVeryEffective, NotVeryEffective) => Quarter,
            (SuperEffective, NotVeryEffective) | (NotVeryEffective, SuperEffective) => Regular,
            (Regular, other) | (other, Regular) => other,
            _ => Regular,
        }
    }

    fn effectiveness_against_single(self, defender: PokemonType) -> Effectiveness {
        use Effectiveness::*;

        use PokemonType::*;
        match (self, defender) {
            (Normal, Rock | Steel) => NotVeryEffective,
            (Normal, Ghost) => Immune,

            (Fighting, Normal | Rock | Steel | Ice | Dark) => SuperEffective,
            (Fighting, Flying | Poison | Bug | Psychic | Fairy) => NotVeryEffective,
            (Fighting, Ghost) => Immune,

            (Flying, Fighting | Bug | Grass) => SuperEffective,
            (Flying, Rock | Steel | Electric) => NotVeryEffective,

            (Poison, Grass | Fairy) => SuperEffective,
            (Poison, Poison | Ground | Rock | Ghost) => NotVeryEffective,
            (Poison, Steel) => Immune,

            (Ground, Poison | Rock | Steel | Fire | Electric) => SuperEffective,
            (Ground, Bug | Grass) => NotVeryEffective,
            (Ground, Flying) => Immune,

            (Rock, Flying | Bug | Fire | Ice) => SuperEffective,
            (Rock, Fighting | Ground | Steel) => NotVeryEffective,

            (Bug, Grass | Psychic | Dark) => SuperEffective,
            (Bug, Fighting | Flying | Poison | Ghost | Steel | Fire | Fairy) => NotVeryEffective,

            (Ghost, Ghost | Psychic) => SuperEffective,
            (Ghost, Dark) => NotVeryEffective,
            (Ghost, Normal) => Immune,

            (Steel, Rock | Ice | Fairy) => SuperEffective,
            (Steel, Steel | Fire | Water | Electric) => NotVeryEffective,

            (Fire, Bug | Steel | Grass | Ice) => SuperEffective,
            (Fire, Rock | Fire | Water | Dragon) => NotVeryEffective,

            (Water, Ground | Rock | Fire) => SuperEffective,
            (Water, Water | Grass | Dragon) => NotVeryEffective,

            (Grass, Ground | Rock | Water) => SuperEffective,
            (Grass, Flying | Poison | Bug | Steel | Fire | Grass | Dragon) => NotVeryEffective,

            (Electric, Flying | Water) => SuperEffective,
            (Electric, Grass | Electric | Dragon) => NotVeryEffective,
            (Electric, Ground) => Immune,

            (Psychic, Fighting | Poison) => SuperEffective,
            (Psychic, Steel | Psychic) => NotVeryEffective,
            (Psychic, Dark) => Immune,

            (Ice, Flying | Ground | Grass | Dragon) => SuperEffective,
            (Ice, Steel | Fire | Water | Ice) => NotVeryEffective,

            (Dragon, Dragon) => SuperEffective,
            (Dragon, Steel) => NotVeryEffective,
            (Dragon, Fairy) => Immune,

            (Dark, Ghost | Psychic) => SuperEffective,
            (Dark, Fighting | Dark | Fairy) => NotVeryEffective,

            (Fairy, Fighting | Dragon | Dark) => SuperEffective,
            (Fairy, Poison | Steel | Fire) => NotVeryEffective,

            (Stellar, _) => Regular,

            _ => Regular,
        }
    }
}

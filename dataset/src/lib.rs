pub use types::*;

include!(concat!(env!("OUT_DIR"), "/pokemon_dataset.rs"));

pub struct Dataset;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Pokemon {
    index: usize,
}

impl Pokemon {
    pub fn new(index: usize) -> Self {
        Self { index }
    }

    #[inline]
    pub fn name(&self) -> &'static str {
        &POKEMONS[self.index].name
    }

    pub fn forms(&self) -> &'static [types::PokemonForm] {
        let start = match self.index.checked_sub(1) {
            Some(idx) => POKEMONS[idx].forms,
            None => 0,
        };
        &POKEMON_FORMS[start..POKEMONS[self.index].forms]
    }

    pub fn moves(&self) -> &'static [types::MovInfo] {
        let start = match self.index.checked_sub(1) {
            Some(idx) => POKEMONS[idx].moves,
            None => 0,
        };
        &MOV_INFOS[start..POKEMONS[self.index].moves]
    }

    pub fn types(&self) -> &'static [types::PokemonType] {
        let start = match self.index.checked_sub(1) {
            Some(idx) => POKEMONS[idx].types,
            None => 0,
        };
        &POKEMON_TYPES[start..POKEMONS[self.index].types]
    }

    pub fn stats(&self) -> &'static types::Stats {
        &POKEMONS[self.index].stats
    }
}

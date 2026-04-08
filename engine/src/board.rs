use arrayvec::ArrayVec;
use serde::{Deserialize, Serialize};

use crate::{ACTIVE_COUNT, PKMNS_PER_PLAYER, PLAYERS_PER_BOARD, Pokemon};

#[derive(Serialize, Deserialize, Default)]
pub struct Board {
    pub players: ArrayVec<Player, PLAYERS_PER_BOARD>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct Player {
    pub pokemons: ArrayVec<Pokemon, PKMNS_PER_PLAYER>,
    pub active_pokemons: [u8; ACTIVE_COUNT],
    pub items: Vec<u8>,
}

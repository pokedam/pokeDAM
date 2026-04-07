use serde::Serialize;

use crate::*;

#[derive(Serialize)]
pub struct History(Vec<GameEvent>);

impl History {
    pub fn push(&mut self, event: GameEvent) {
        self.0.push(event);
    }
}

#[derive(Serialize)]
pub enum GameEvent {
    PokemonFainted {
        player: u8,
        pokemon: u8,
    },
    PokemonStatusChanged {
        player_id: u8,
        pkm_id: u8,
        status: PokemonStatus,
    },
    PokemonDamaged {
        player: u8,
        pokemon: u8,
        damage: u16,
        effectiveness: Effectiveness,
        is_critical_hit: bool,
    },
    Error(String),
}

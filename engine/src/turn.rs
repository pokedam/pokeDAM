use crate::*;

pub const PLAYERS_PER_BOARD: usize = 8;
pub const PKMNS_PER_PLAYER: usize = 8;
pub const ACTIVE_COUNT: usize = 3;

pub struct Turn {
    board: Board,
    requests: [PlayerRequest; PLAYERS_PER_BOARD],
}

impl Turn {
    pub fn execute(&mut self, history: &mut History) {
        // --- Fase 1: validar y recolectar prioridades ---
        // Cada entrada: (Priority, player_id, active_id)
        // Las requests inválidas se registran como error y se omiten.
        let mut order: Vec<(Priority, usize, usize)> = Vec::with_capacity(
            PLAYERS_PER_BOARD * ACTIVE_COUNT,
        );

        for player_id in 0..PLAYERS_PER_BOARD {
            for active_id in 0..ACTIVE_COUNT {
                let pkm_slot = self.board.players[player_id].active_pokemons[active_id];
                let req = &self.requests[player_id].pokemons[pkm_slot as usize];

                match req.validate(PokeContext {
                    board: &self.board,
                    history,
                    player: player_id as u8,
                    active: active_id as u8,
                }) {
                    Ok(priority) => order.push((priority, player_id, active_id)),
                    Err(err) => history.push(GameEvent::Error(err.to_string())),
                }
            }
        }

        // --- Fase 2: ordenar de mayor a menor prioridad ---
        // `Priority::cmp` compara nivel primero, velocidad como desempate;
        // invertimos para que el mayor quede al frente.
        order.sort_unstable_by(|a, b| b.0.cmp(&a.0));

        // --- Fase 3: ejecutar en el orden establecido ---
        for (_, player_id, active_id) in order {
            let pkm_slot = self.board.players[player_id].active_pokemons[active_id];
            let req = &self.requests[player_id].pokemons[pkm_slot as usize];

            if let Err(err) = req.execute(PokeContext {
                board: &mut self.board,
                history,
                player: player_id as u8,
                active: active_id as u8,
            }) {
                history.push(GameEvent::Error(err.to_string()));
            }
        }
    }
}

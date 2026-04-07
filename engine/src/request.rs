use anyhow::{Result, anyhow};
use serde::Deserialize;

use crate::*;

#[derive(Deserialize)]
pub struct PlayerRequest {
    pub pokemons: [PokemonRequest; ACTIVE_COUNT],
    pub items: Vec<u8>,
}

#[derive(Deserialize)]
pub enum PokemonRequest {
    Swap(u8),
    UseMov { id: u8, descriptor: Vec<u8> },
    ReceiveItem(u8),
}

impl PokemonRequest {
    pub fn validate(&self, ctx: PokeContext<&Board>) -> Result<Priority> {
        match self {
            PokemonRequest::Swap(target_id) => {
                let player = ctx.player();
                let pokemon = ctx.pokemon();

                // El Pokémon activo no puede cambiar si está atrapado.
                if pokemon
                    .status
                    .intersects(PokemonStatus::CANNOT_ESCAPE | PokemonStatus::TRAPPED)
                {
                    return Err(anyhow!("El Pokémon no puede retirarse"));
                }

                // El Pokémon destino debe existir en el equipo.
                let target = player
                    .pokemons
                    .get(*target_id as usize)
                    .ok_or_else(|| anyhow!("ID de Pokémon destino fuera de rango"))?;

                // El Pokémon destino no puede estar debilitado.
                if target.status.contains(PokemonStatus::FAINTED) {
                    return Err(anyhow!("El Pokémon destino está debilitado"));
                }

                // Los cambios tienen prioridad +6 en los juegos oficiales.
                Ok(Priority::new(6, pokemon.stats.speed))
            }
            PokemonRequest::UseMov { id, descriptor } => {
                let pokemon = ctx.pokemon();
                let speed = pokemon.stats.speed;
                let mov = &pokemon.movs[*id as usize];
                let level = MOVS[mov.id as usize].validate(MovContext {
                    inner: ctx,
                    descriptor,
                })?;
                Ok(Priority::new(level, speed))
            }
            PokemonRequest::ReceiveItem(item_idx) => {
                let player = ctx.player();
                let pokemon = ctx.pokemon();

                // El índice del ítem debe ser válido.
                if *item_idx as usize >= player.items.len() {
                    return Err(anyhow!("Índice de ítem fuera de rango"));
                }

                // Los ítems tienen la prioridad más alta: +7.
                Ok(Priority::new(7, pokemon.stats.speed))
            }
        }
    }

    pub fn execute(&self, mut ctx: PokeContext<&mut Board>) -> Result<()> {
        match self {
            PokemonRequest::Swap(id) => {
                let idx = ctx.active as usize;
                ctx.player_mut().active_pokemons[idx] = *id;
                Ok(())
            }
            PokemonRequest::UseMov { id, descriptor } => {
                let pokemon = ctx.pokemon_mut();
                let mov = &mut pokemon.movs[*id as usize];
                match mov.pp.checked_sub(1) {
                    Some(pp) => {
                        mov.pp = pp;
                        MOVS[mov.id as usize].execute(MovContext {
                            inner: ctx,
                            descriptor,
                        })
                    }
                    None => Err(anyhow!("No pp left")),
                }
            }
            PokemonRequest::ReceiveItem(_) => todo!(),
        }
    }
}

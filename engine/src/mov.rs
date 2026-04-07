use anyhow::{anyhow, Result};
use derive_more::{Deref, DerefMut};

use crate::*;

#[derive(Deref, DerefMut)]
pub struct MovContext<'h, B> {
    #[deref]
    #[deref_mut]
    pub inner: PokeContext<'h, B>,
    pub descriptor: &'h [u8],
}

pub const MOVS: [Mov; 0] = [
    //HERE we will have the movs, for now is empty because we haven't implemented any mov yet
];

pub struct Mov {
    pub validate: fn(ctx: MovContext<&Board>) -> Result<i8>,
    pub execute: fn(ctx: MovContext<&mut Board>) -> Result<()>,
}

impl Mov {
    pub fn validate(&self, ctx: MovContext<&Board>) -> Result<i8> {
        (self.validate)(ctx)
    }
    pub fn execute(&self, ctx: MovContext<&mut Board>) -> Result<()> {
        (self.execute)(ctx)
    }
}

pub enum AttackType {
    Physical,
    Special,
    Status,
}

pub struct BasicAttack {
    pub power: u16,
    pub mov_type: PokemonType,
    pub attack_type: AttackType,
    pub acc: u8,
    pub crit: u8,
}

impl BasicAttack {
    pub fn execute<B>(&self, mut ctx: MovContext<B>) -> Result<()>
    where
        B: AsRef<Board> + AsMut<Board>,
    {
        let Some(&player_id) = ctx.descriptor.get(0) else {
            return Err(anyhow!(
                "Descriptor must have at least 2 bytes for player and pokémon id"
            ));
        };
        let Some(&pkm_id) = ctx.descriptor.get(1) else {
            return Err(anyhow!(
                "Descriptor must have at least 2 bytes for player and pokémon id"
            ));
        };

        // let (types, def, sp) = ctx
        //     .board
        //     .as_ref()
        //     .players
        //     .get(player_id as usize)
        //     .and_then(|p| p.pokemons.get(pkm_id as usize))
        //     .map(|pkm| (pkm.types, pkm.stats.defense, pkm.stats.special_defense))
        //     .ok_or_else(|| anyhow!("Target player or pokémon out of bounds"))?;

        // // Canonical Pokémon damage formula (Gen V+):
        // // Damage = ((2 * Level / 5 + 2) * Power * A / D / 50 + 2) * Modifiers
        // let attacker = ctx.pokemon();
        // let level = attacker.level as f32;
        // let (atk, def) = match self.attack_type {
        //     AttackType::Physical => (attacker.stats.attack as f32, def as f32),
        //     AttackType::Special => (attacker.stats.special_attack as f32, sp as f32),
        //     AttackType::Status => return Ok(()), // Status moves don't deal direct damage
        // };

        // let base_damage =
        //     (2.5 * level + 2.0) * 0.02 * self.power as f32 * atk as f32 / def.max(1.0) + 2.0;
        //let total_power = (base_damage as f32 * effectiveness.multiplier()) as u16;

        let attacker = ctx.pokemon();
        let level = attacker.level as u32;
        let atk = match self.attack_type {
            AttackType::Physical => attacker.stats.attack,
            AttackType::Special => attacker.stats.special_attack,
            AttackType::Status => return Err(anyhow!("Status moves don't deal direct damage")),
        } as u32;

        let Some(other_player) = ctx.board.as_mut().players.get_mut(player_id as usize) else {
            return Err(anyhow!("Target player out of bounds"));
        };

        let Some(other_pkm) = other_player.pokemons.get_mut(pkm_id as usize) else {
            return Err(anyhow!("Target pokémon out of bounds"));
        };

        let def = match self.attack_type {
            AttackType::Physical => other_pkm.stats.defense,
            AttackType::Special => other_pkm.stats.special_defense,
            AttackType::Status => return Err(anyhow!("Status moves don't deal direct damage")),
        } as u32;
        let base_damage = (5 * level / 2 + 2) * self.power as u32 * atk / def.max(1) / 50 + 2;
        let effectiveness = self.mov_type.effectiveness_against(other_pkm.types);
        let total_power =
            (base_damage * effectiveness.multiplier() / Effectiveness::Regular.multiplier()) as u16;
        if other_pkm.status.contains(PokemonStatus::FAINTED) {
            return Ok(());
        }

        other_pkm.stats.hp = other_pkm.stats.hp.saturating_sub(total_power);

        let register_damage = |ctx: &mut MovContext<_>| {
            ctx.history.push(GameEvent::PokemonDamaged {
                player: player_id,
                pokemon: pkm_id,
                damage: total_power,
                effectiveness,
                is_critical_hit: false,
            })
        };

        if other_pkm.stats.hp == 0 {
            let status = PokemonStatus::FAINTED;
            other_pkm.status = status;
            register_damage(&mut ctx);
            ctx.history.push(GameEvent::PokemonStatusChanged {
                player_id,
                pkm_id,
                status,
            });
        } else {
            register_damage(&mut ctx);
        }
        Ok(())
    }
}

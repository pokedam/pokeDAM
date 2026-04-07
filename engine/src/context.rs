use crate::{Board, History, Player, Pokemon};

pub struct PokeContext<'h, B> {
    pub board: B,
    pub history: &'h mut History,
    pub player: u8,
    pub active: u8,
}

impl AsRef<Board> for &Board {
    fn as_ref(&self) -> &Board {
        *self
    }
}

impl AsRef<Board> for &mut Board {
    fn as_ref(&self) -> &Board {
        *self
    }
}

impl AsMut<Board> for &mut Board {
    fn as_mut(&mut self) -> &mut Board {
        *self
    }
}

impl<'h, B: AsRef<Board>> PokeContext<'h, B> {
    pub fn player(&self) -> &Player {
        &self.board.as_ref().players[self.player as usize]
    }

    pub fn pokemon(&self) -> &Pokemon {
        let player = &self.board.as_ref().players[self.player as usize];
        &player.pokemons[player.active_pokemons[self.active as usize] as usize]
    }
}

impl<'h, B: AsMut<Board>> PokeContext<'h, B> {
    pub fn player_mut(&mut self) -> &mut Player {
        &mut self.board.as_mut().players[self.player as usize]
    }

    pub fn pokemon_mut(&mut self) -> &mut Pokemon {
        let player = &mut self.board.as_mut().players[self.player as usize];
        &mut player.pokemons[player.active_pokemons[self.active as usize] as usize]
    }
}

// pub struct PokeContextMut<'a> {
//     pub board: &'a mut Board,
//     pub history: &'a mut History,
//     pub player: u8,
//     pub active: u8,
// }

// impl<'a> PokeContextMut<'a> {
//     pub fn player(&mut self) -> &mut Player {
//         &mut self.board.players[self.player as usize]
//     }

//     pub fn pokemon(&mut self) -> &mut Pokemon {
//         let player = &mut self.board.players[self.player as usize];
//         &mut player.pokemons[player.active_pokemons[self.active as usize] as usize]
//     }
// }

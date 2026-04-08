use actix::prelude::*;
use derive_more::{Deref, From};
use log::{error, info};
use std::collections::HashMap;
use uuid::Uuid;

use engine::{
    PLAYERS_PER_BOARD, board::Board, history::History, request::PlayerRequest, turn::Turn,
};

use crate::ws_actor::PlayerSession;

const TURN_TIME_LIMIT: std::time::Duration = std::time::Duration::from_secs(60);

// Messages
#[derive(Message, Deref, From)]
#[rtype(result = "Option<Uuid>")]
pub struct InitMatch(pub Board);

#[derive(Message)]
#[rtype(result = "Result<(), String>")]
pub struct ConnectPlayer {
    pub match_id: Uuid,
    pub player_id: usize,
    pub addr: Addr<PlayerSession>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct DisconnectPlayer {
    pub match_id: Uuid,
    pub player_id: usize,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct PlayerInput {
    pub match_id: Uuid,
    pub player_id: usize,
    pub request: PlayerRequest,
}

#[derive(Message, Clone, Deref, From)]
#[rtype(result = "()")]
pub struct MatchHistory(pub String);

struct MatchState {
    board: Option<Board>,
    connected_players: HashMap<usize, Addr<PlayerSession>>,
    pending_requests: HashMap<usize, PlayerRequest>,
    turn_id: u32,
}

pub struct GameServer {
    matches: HashMap<Uuid, MatchState>,
}

impl Default for GameServer {
    fn default() -> Self {
        Self::new()
    }
}

impl GameServer {
    pub fn new() -> GameServer {
        info!("GameServer initialized");
        GameServer {
            matches: HashMap::new(),
        }
    }

    fn handle_timeout(&mut self, match_id: Uuid, turn_id: u32, ctx: &mut Context<Self>) {
        if let Some(state) = self.matches.get(&match_id) {
            if state.turn_id == turn_id {
                info!("Turn {} timeout for match {}", turn_id, match_id);
                self.execute_turn(match_id, ctx);
            }
        }
    }

    fn execute_turn(&mut self, match_id: Uuid, ctx: &mut Context<Self>) {
        if let Some(state) = self.matches.get_mut(&match_id) {
            info!("Executing turn {} for match {}", state.turn_id, match_id);

            let mut requests_vec = Vec::with_capacity(PLAYERS_PER_BOARD);
            for i in 0..PLAYERS_PER_BOARD {
                if let Some(req) = state.pending_requests.remove(&i) {
                    requests_vec.push(req);
                } else {
                    requests_vec.push(PlayerRequest::default());
                }
            }

            let requests_arr: [PlayerRequest; PLAYERS_PER_BOARD] = match requests_vec.try_into() {
                Ok(arr) => arr,
                Err(_) => {
                    error!("Failed to convert requests to fixed array");
                    return;
                }
            };

            let board = state.board.take().expect("Board should exist");

            let mut turn = Turn {
                board,
                requests: requests_arr,
            };

            let mut history = History::default();
            turn.execute(&mut history);

            match serde_json::to_string(&history) {
                Ok(json) => {
                    let hist_msg = MatchHistory(json);
                    for (_, addr) in &state.connected_players {
                        addr.do_send(hist_msg.clone());
                    }
                }
                Err(e) => {
                    error!("Failed to serialize history: {}", e);
                }
            }

            state.board = Some(turn.board);
            state.turn_id += 1;
            state.pending_requests.clear();

            let next_turn_id = state.turn_id;
            ctx.run_later(TURN_TIME_LIMIT, move |act, ctx| {
                act.handle_timeout(match_id, next_turn_id, ctx);
            });
        }
    }
}

impl Actor for GameServer {
    type Context = Context<Self>;
}

// Handler for REST API initializing a game
impl Handler<InitMatch> for GameServer {
    type Result = Option<Uuid>;

    fn handle(&mut self, msg: InitMatch, ctx: &mut Context<Self>) -> Self::Result {
        let match_id = Uuid::new_v4();
        let state = MatchState {
            board: Some(msg.0),
            connected_players: HashMap::new(),
            pending_requests: HashMap::new(),
            turn_id: 1,
        };
        self.matches.insert(match_id, state);
        info!("Initialized match {}", match_id);

        ctx.run_later(std::time::Duration::from_secs(60), move |act, ctx| {
            act.handle_timeout(match_id, 1, ctx);
        });

        Some(match_id)
    }
}

impl Handler<ConnectPlayer> for GameServer {
    type Result = Result<(), String>;

    fn handle(&mut self, msg: ConnectPlayer, _: &mut Context<Self>) -> Self::Result {
        if let Some(state) = self.matches.get_mut(&msg.match_id) {
            state.connected_players.insert(msg.player_id, msg.addr);
            info!("Player {} joined match {}", msg.player_id, msg.match_id);
            Ok(())
        } else {
            Err("Match not found".to_string())
        }
    }
}

impl Handler<DisconnectPlayer> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: DisconnectPlayer, _: &mut Context<Self>) {
        if let Some(state) = self.matches.get_mut(&msg.match_id) {
            state.connected_players.remove(&msg.player_id);
            info!(
                "Player {} disconnected from match {}",
                msg.player_id, msg.match_id
            );
        }
    }
}

impl Handler<PlayerInput> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: PlayerInput, ctx: &mut Context<Self>) {
        if let Some(state) = self.matches.get_mut(&msg.match_id) {
            // Register player request
            state.pending_requests.insert(msg.player_id, msg.request);
            info!(
                "Received request from player {} for match {}",
                msg.player_id, msg.match_id
            );

            // Turn execution logic if all 8 players submitted their actions
            if state.pending_requests.len() == PLAYERS_PER_BOARD {
                info!(
                    "All {} players submitted commands. Executing turn...",
                    PLAYERS_PER_BOARD
                );

                let match_id = msg.match_id;
                self.execute_turn(match_id, ctx);
            }
        }
    }
}

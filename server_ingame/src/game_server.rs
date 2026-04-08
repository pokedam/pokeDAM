use actix::prelude::*;
use derive_more::{Deref, From};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

use engine::{
    PLAYERS_PER_BOARD, board::Board, history::History, request::PlayerRequest, turn::Turn,
};

use crate::ws_actor::PlayerSession;

const TURN_TIME_LIMIT: std::time::Duration = std::time::Duration::from_secs(60);

// --- Modelos Cliente-Servidor (JSON) ---
#[derive(Deserialize)]
#[serde(tag = "action", content = "payload")]
pub enum ClientMessage {
    CreateRoom,
    JoinRoom { room_id: Uuid },
    SetReady { is_ready: bool },
    StartGame,
    BattleAction(PlayerRequest),
}

#[derive(Serialize, Clone)]
#[serde(tag = "event", content = "payload")]
pub enum ServerEvent {
    PlayerJoined { player_id: usize },
    PlayerReady { player_id: usize, is_ready: bool },
    GameStarted,
    MatchHistory(History),
}

// --- Mensajes Internos del Actor ---
#[derive(Message, Clone, Deref, From)]
#[rtype(result = "()")]
pub struct MessageToClient(pub String);

#[derive(Message)]
#[rtype(result = "()")]
pub struct DisconnectPlayer {
    pub player_id: usize,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientAction {
    pub player_id: usize,
    pub msg: ClientMessage,
}

// --- Estados del Loby / Partida ---
struct MatchState {
    board: Option<Board>,
    pending_requests: HashMap<usize, PlayerRequest>,
    turn_id: u32,
}

enum RoomState {
    Waiting {
        host_id: usize,
        readys: HashMap<usize, bool>,
    },
    Playing(MatchState),
}

struct Room {
    state: RoomState,
    connected_players: HashMap<usize, Addr<PlayerSession>>,
}

impl Room {
    fn new(host_id: usize) -> Self {
        let mut readys = HashMap::new();
        readys.insert(host_id, false);

        Room {
            state: RoomState::Waiting { host_id, readys },
            connected_players: HashMap::new(),
        }
    }

    fn broadcast(&self, event: &ServerEvent) {
        if let Ok(json) = serde_json::to_string(event) {
            let msg = MessageToClient(json);
            for addr in self.connected_players.values() {
                addr.do_send(msg.clone());
            }
        }
    }
}

pub struct GameServer {
    rooms: HashMap<Uuid, Room>,
    player_rooms: HashMap<usize, Uuid>,
}

impl Default for GameServer {
    #[inline]
    fn default() -> Self {
        Self::new()
    }
}

impl GameServer {
    #[inline]
    pub fn new() -> GameServer {
        GameServer {
            rooms: HashMap::new(),
            player_rooms: HashMap::new(),
            //redis_pool,
        }
    }

    fn handle_timeout(&mut self, match_id: Uuid, turn_id: u32, ctx: &mut Context<Self>) {
        if let Some(room) = self.rooms.get_mut(&match_id) {
            if let RoomState::Playing(state) = &mut room.state {
                if state.turn_id == turn_id {
                    self.execute_turn(match_id, ctx);
                }
            }
        }
    }

    fn execute_turn(&mut self, match_id: Uuid, ctx: &mut Context<Self>) {
        if let Some(room) = self.rooms.get_mut(&match_id) {
            if let RoomState::Playing(state) = &mut room.state {

                let mut requests_vec = Vec::with_capacity(PLAYERS_PER_BOARD);
                for i in 0..PLAYERS_PER_BOARD {
                    if let Some(req) = state.pending_requests.remove(&i) {
                        requests_vec.push(req);
                    } else {
                        requests_vec.push(PlayerRequest::default());
                    }
                }

                if let Ok(requests_arr) = requests_vec.try_into() {
                    if let Some(board) = state.board.take() {
                        let mut turn = Turn {
                            board,
                            requests: requests_arr,
                        };
                        let mut history = History::default();
                        turn.execute(&mut history);

                        state.board = Some(turn.board);
                        state.turn_id += 1;
                        state.pending_requests.clear();

                        let turn_id = state.turn_id;
                        room.broadcast(&ServerEvent::MatchHistory(history));
                        ctx.run_later(TURN_TIME_LIMIT, move |act, ctx| {
                            act.handle_timeout(match_id, turn_id, ctx);
                        });
                    }
                }
            }
        }
    }
}

impl Actor for GameServer {
    type Context = Context<Self>;
}

impl Handler<DisconnectPlayer> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: DisconnectPlayer, _: &mut Context<Self>) {
        if let Some(room_id) = self.player_rooms.remove(&msg.player_id) {
            if let Some(room) = self.rooms.get_mut(&room_id) {
                room.connected_players.remove(&msg.player_id);
            }
        }
    }
}

impl Handler<ClientAction> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: ClientAction, ctx: &mut Context<Self>) {
        let player_id = msg.player_id;

        match msg.msg {
            ClientMessage::CreateRoom => {
                let room_id = Uuid::new_v4();

                let room = Room::new(player_id);
                self.rooms.insert(room_id, room);
                self.player_rooms.insert(player_id, room_id);

            }
            ClientMessage::JoinRoom { room_id } => {
                if let Some(room) = self.rooms.get_mut(&room_id) {
                    if let RoomState::Waiting { readys, .. } = &mut room.state {
                        readys.insert(player_id, false);
                        self.player_rooms.insert(player_id, room_id);
                        room.broadcast(&ServerEvent::PlayerJoined { player_id });                        
                    }
                }
            }
            ClientMessage::SetReady { is_ready } => {
                if let Some(room_id) = self.player_rooms.get(&player_id) {
                    if let Some(room) = self.rooms.get_mut(room_id) {
                        if let RoomState::Waiting { readys, .. } = &mut room.state {
                            readys.insert(player_id, is_ready);
                            room.broadcast(&ServerEvent::PlayerReady {
                                player_id,
                                is_ready,
                            });
                        }
                    }
                }
            }
            ClientMessage::StartGame => {
                if let Some(room_id) = self.player_rooms.get(&player_id) {
                    if let Some(room) = self.rooms.get_mut(room_id) {
                        if let RoomState::Waiting { host_id, readys } = &room.state {
                            if *host_id == player_id
                                && readys.len() > 1
                                && readys.values().all(|r| *r)
                            {
                                if let Some(room) = self.rooms.get_mut(&room_id) {
                                    room.broadcast(&ServerEvent::GameStarted);

                                    room.state = RoomState::Playing(MatchState {
                                        board: Some(Board::default()), // Fake init
                                        pending_requests: HashMap::new(),
                                        turn_id: 1,
                                    });

                                }
                                let room_id = *room_id;
                                ctx.run_later(
                                    std::time::Duration::from_secs(60),
                                    move |act: &mut GameServer, ctx| {
                                        act.handle_timeout(room_id, 1, ctx);
                                    },
                                );
                            }
                        }
                    }
                }
            }
            ClientMessage::BattleAction(req) => {
                let mut run_turn = false;
                let mut the_room_id = None;

                if let Some(room_id) = self.player_rooms.get(&player_id) {
                    if let Some(room) = self.rooms.get_mut(room_id) {
                        if let RoomState::Playing(state) = &mut room.state {
                            state.pending_requests.insert(player_id, req);
                            if state.pending_requests.len() == room.connected_players.len() {
                                run_turn = true;
                                the_room_id = Some(*room_id);
                            }
                        }
                    }
                }

                if run_turn {
                    self.execute_turn(the_room_id.unwrap(), ctx);
                }
            }
        }
    }
}

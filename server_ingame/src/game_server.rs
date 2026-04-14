use actix::prelude::*;
use derive_more::{Deref, From};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

use engine::{
    PLAYERS_PER_BOARD, board::Board, history::History, request::PlayerRequest, turn::Turn,
};

use crate::player_session::PlayerSession;

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
    PlayerDisconnected { player_id: usize },
    PlayerReconnected { player_id: usize },
    PlayerEliminated { player_id: usize },
    GameOver { winner_id: usize },
}

// --- Mensajes Internos del Actor ---
#[derive(Message, Clone, Deref, From)]
#[rtype(result = "()")]
pub struct MessageToClient(pub String);

#[derive(Message)]
#[rtype(result = "()")]
pub struct ConnectPlayer {
    pub player_id: usize,
    pub addr: Addr<PlayerSession>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct DisconnectPlayer {
    pub player_id: usize,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct HandleDisconnectTimeout {
    pub match_id: Uuid,
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
    player_indices: HashMap<usize, usize>,
    active_players: Vec<usize>,
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

    fn check_and_execute_turn_if_ready(&mut self, match_id: Uuid, ctx: &mut Context<Self>) {
        let run_turn = {
            if let Some(room) = self.rooms.get(&match_id) {
                if let RoomState::Playing(state) = &room.state {
                    // Check if all active players have submitted requests
                    state.pending_requests.len() == state.active_players.len()
                } else { false }
            } else { false }
        };

        if run_turn {
            self.execute_turn(match_id, ctx);
        }
    }

    fn execute_turn(&mut self, match_id: Uuid, ctx: &mut Context<Self>) {
        if let Some(room) = self.rooms.get_mut(&match_id) {
            if let RoomState::Playing(state) = &mut room.state {
                if let Some(board) = state.board.take() {
                    let mut requests_arr: [PlayerRequest; PLAYERS_PER_BOARD] = Default::default();
                    for &pid in &state.active_players {
                        if let Some(&idx) = state.player_indices.get(&pid) {
                            if let Some(req) = state.pending_requests.remove(&pid) {
                                requests_arr[idx] = req;
                            }
                        }
                    }

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

impl Actor for GameServer {
    type Context = Context<Self>;
}

impl Handler<ConnectPlayer> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: ConnectPlayer, _: &mut Context<Self>) {
        if let Some(room_id) = self.player_rooms.get(&msg.player_id).copied() {
            if let Some(room) = self.rooms.get_mut(&room_id) {
                room.connected_players.insert(msg.player_id, msg.addr.clone());

                if let RoomState::Playing(state) = &room.state {
                    if state.active_players.contains(&msg.player_id) {
                        room.broadcast(&ServerEvent::PlayerReconnected {
                            player_id: msg.player_id,
                        });
                    }
                }
            }
        }
    }
}

impl Handler<DisconnectPlayer> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: DisconnectPlayer, ctx: &mut Context<Self>) {
        let player_id = msg.player_id;
        if let Some(&room_id) = self.player_rooms.get(&player_id) {
            if let Some(room) = self.rooms.get_mut(&room_id) {
                room.connected_players.remove(&player_id);

                let is_playing = matches!(&room.state, RoomState::Playing(_));
                if is_playing {
                    if let RoomState::Playing(state) = &room.state {
                        if state.active_players.contains(&player_id) {
                            room.broadcast(&ServerEvent::PlayerDisconnected { player_id });
                            ctx.run_later(
                                std::time::Duration::from_secs(30),
                                move |act, ctx| {
                                    act.do_send(HandleDisconnectTimeout {
                                        match_id: room_id,
                                        player_id,
                                    });
                                },
                            );
                        }
                    }
                } else {
                    self.player_rooms.remove(&player_id);
                }
            }
        }
    }
}

impl Handler<HandleDisconnectTimeout> for GameServer {
    type Result = ();

    fn handle(&mut self, msg: HandleDisconnectTimeout, ctx: &mut Context<Self>) {
        let mut room_finished = false;

        if let Some(room) = self.rooms.get_mut(&msg.match_id) {
            if !room.connected_players.contains_key(&msg.player_id) {
                if let RoomState::Playing(state) = &mut room.state {
                    if let Some(pos) = state.active_players.iter().position(|&p| p == msg.player_id) {
                        state.active_players.remove(pos);
                        room.broadcast(&ServerEvent::PlayerEliminated {
                            player_id: msg.player_id,
                        });

                        if state.active_players.len() == 1 {
                            let winner = state.active_players[0];
                            room.broadcast(&ServerEvent::GameOver { winner_id: winner });
                            room_finished = true;
                        }
                    }
                }
            }
        }

        if room_finished {
            self.rooms.remove(&msg.match_id);
        } else if !room_finished && self.rooms.contains_key(&msg.match_id) {
            self.check_and_execute_turn_if_ready(msg.match_id, ctx);
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

                                    let mut player_indices = HashMap::new();
                                    for (i, &pid) in room.connected_players.keys().enumerate() {
                                        player_indices.insert(pid, i);
                                    }
                                    let active_players = room.connected_players.keys().copied().collect();

                                    room.state = RoomState::Playing(MatchState {
                                        board: None, // TODO: perform board request to central server.
                                        pending_requests: HashMap::new(),
                                        turn_id: 1,
                                        player_indices,
                                        active_players,
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
                let mut the_room_id = None;

                if let Some(room_id) = self.player_rooms.get(&player_id) {
                    if let Some(room) = self.rooms.get_mut(room_id) {
                        if let RoomState::Playing(state) = &mut room.state {
                            if state.active_players.contains(&player_id) {
                                state.pending_requests.insert(player_id, req);
                                the_room_id = Some(*room_id);
                            }
                        }
                    }
                }

                if let Some(rid) = the_room_id {
                    self.check_and_execute_turn_if_ready(rid, ctx);
                }
            }
        }
    }
}

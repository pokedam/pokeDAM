use actix::prelude::*;
use actix_web_actors::ws;
use engine::request::PlayerRequest;
use log::{error, info};
use serde_json;
use uuid::Uuid;

use crate::game_server::{ConnectPlayer, DisconnectPlayer, GameServer, PlayerInput};

pub struct PlayerSession {
    pub match_id: Uuid,
    pub player_id: usize,
    pub game_server: Addr<GameServer>,
}

impl Actor for PlayerSession {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        info!(
            "Player {} connecting to match {}",
            self.player_id, self.match_id
        );

        let addr = ctx.address();
        self.game_server
            .send(ConnectPlayer {
                match_id: self.match_id,
                player_id: self.player_id,
                addr,
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(Ok(_)) => {
                        info!("Player {} connected.", act.player_id);
                    }
                    _ => {
                        error!("Failed to connect player to match.");
                        ctx.stop();
                    }
                }
                fut::ready(())
            })
            .wait(ctx);
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.game_server.do_send(DisconnectPlayer {
            match_id: self.match_id,
            player_id: self.player_id,
        });
        Running::Stop
    }
}

/// Handle messages from WebSocket client
impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for PlayerSession {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match msg {
            Ok(msg) => msg,
            Err(_) => {
                ctx.stop();
                return;
            }
        };

        match msg {
            ws::Message::Text(text) => {
                // Parse PlayerRequest from text
                match serde_json::from_str::<PlayerRequest>(&text) {
                    Ok(request) => {
                        self.game_server.do_send(PlayerInput {
                            match_id: self.match_id,
                            player_id: self.player_id,
                            request,
                        });
                    }
                    Err(e) => {
                        error!("Invalid PlayerRequest JSON: {}", e);
                    }
                }
            }
            ws::Message::Ping(msg) => ctx.pong(&msg),
            ws::Message::Pong(_) => {}
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => (),
        }
    }
}

// Receive History messages from MatchServer
impl Handler<crate::game_server::MatchHistory> for PlayerSession {
    type Result = ();

    fn handle(&mut self, msg: crate::game_server::MatchHistory, ctx: &mut Self::Context) {
        // Send history over websocket to player
        ctx.text(msg.0);
    }
}

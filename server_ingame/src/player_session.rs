use actix::prelude::*;
use actix_web_actors::ws;

use crate::game_server::GameServer;

pub struct PlayerSession {
    pub player_id: usize,
    pub game_server: Addr<GameServer>,
}

impl Actor for PlayerSession {
    type Context = ws::WebsocketContext<Self>;
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
                match serde_json::from_str::<crate::game_server::ClientMessage>(&text) {
                    Ok(client_msg) => {
                        self.game_server.do_send(crate::game_server::ClientAction {
                            player_id: self.player_id,
                            msg: client_msg,
                        });
                    }
                    Err(e) => {
                        todo!("Handle invalid client message: {}", e);
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

// Receive messages from GameServer to forward to the client
impl Handler<crate::game_server::MessageToClient> for PlayerSession {
    type Result = ();

    fn handle(&mut self, msg: crate::game_server::MessageToClient, ctx: &mut Self::Context) {
        ctx.text(msg.0);
    }
}

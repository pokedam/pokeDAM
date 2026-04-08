use actix::prelude::*;
use actix_web::{App, Error, HttpRequest, HttpResponse, HttpServer, web};
use actix_web_actors::ws;

mod game_server;
mod ws_actor;

async fn ws_player_connect(
    req: HttpRequest,
    stream: web::Payload,
    path: web::Path<usize>,
    srv: web::Data<Addr<game_server::GameServer>>,
) -> Result<HttpResponse, Error> {
    let player_id = path.into_inner();

    let player_session = ws_actor::PlayerSession {
        player_id,
        game_server: srv.get_ref().clone(),
    };

    ws::start(player_session, &req, stream)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let game_server = game_server::GameServer::new().start();


    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(game_server.clone()))
            .route(
                "/ws/{player_id}",
                web::get().to(ws_player_connect),
            )
    })
    .bind(("0.0.0.0", 8081))?
    .run()
    .await
}

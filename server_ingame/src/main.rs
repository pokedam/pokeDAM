use actix::prelude::*;
use actix_web::{App, Error, HttpRequest, HttpResponse, HttpServer, web};
use actix_web_actors::ws;
use log::info;
use uuid::Uuid;

mod game_server;
mod start_game;
mod ws_actor;

/// WebSocket Endpoint for players to connect to an existing match.
/// The path takes `{match_id}` and `{player_id}`.
async fn ws_player_connect(
    req: HttpRequest,
    stream: web::Payload,
    path: web::Path<(Uuid, usize)>,
    srv: web::Data<Addr<game_server::GameServer>>,
) -> Result<HttpResponse, Error> {
    let (match_id, player_id) = path.into_inner();

    let player_session = ws_actor::PlayerSession {
        match_id,
        player_id,
        game_server: srv.get_ref().clone(),
    };

    ws::start(player_session, &req, stream)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt::init();

    let game_server = game_server::GameServer::new().start();

    info!("Starting in-game server at http://0.0.0.0:8081");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(game_server.clone()))
            .service(
                web::resource("/match/init")
                    .wrap(actix_web::middleware::from_fn(start_game::middleware))
                    .route(web::post().to(start_game::post)),
            )
            .route(
                "/ws/{match_id}/{player_id}",
                web::get().to(ws_player_connect),
            )
    })
    .bind(("0.0.0.0", 8081))?
    .run()
    .await
}

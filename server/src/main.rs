pub use actix_cors::Cors;
use actix_web::{App, HttpServer, middleware};

use server::{*, prelude::*};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let database: Database = Database::from_env(); 

    db::init(&database.pool).await.unwrap();

    let bind_addr = std::env::var("BIND_ADDR");
    let bind_addr = bind_addr
        .as_ref()
        .map(String::as_str)
        .unwrap_or_else(|_| "127.0.0.1:8080");


    let app_config = web::Data::new(database.clone());

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(app_config.clone())
            // Public
            .route(
                "/api/auth/anonymous",
                web::post().to(auth_annonymous::login),
            )
            // Protected
            .service(
                web::scope("/api/auth")
                    .wrap(middleware::from_fn(jwt::jwt_auth))
                    .route("/google", web::post().to(auth_google::login)), // .route(
                                                                           //     "/generate_token",
                                                                           //     web::post().to(generate_token::generate_token),
                                                                           // )
                                                                           // .route("/consume_token", web::post().to(consume_token::consume_token))
                                                                           // .route("/create_company", web::post().to(create_company::create_company)),
            )
    })
    .bind(&bind_addr)?
    .run()
    .await
}

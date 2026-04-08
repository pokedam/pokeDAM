use actix::Addr;
use actix_web::{
    Error, HttpResponse, Responder,
    body::MessageBody,
    dev::{ServiceFactory, ServiceRequest, ServiceResponse},
    web,
};
use engine::Board;
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode};
use log::info;
use std::{env, sync::OnceLock};

use crate::game_server;

static JWT_PUBLIC_KEY: OnceLock<DecodingKey> = OnceLock::new();

pub fn endpoint() -> actix_web::Resource<
    impl ServiceFactory<
        ServiceRequest,
        Config = (),
        Response = ServiceResponse<impl MessageBody>,
        Error = Error,
        InitError = (),
    >,
> {
    web::resource("/match/init")
        .wrap(actix_web::middleware::from_fn(middleware))
        .route(web::post().to(post))
}

#[derive(serde::Deserialize)]
struct Claims {
    // JWT standard claims
    #[allow(dead_code)]
    pub exp: usize,
    // Add any specific game claims here if needed
}

/// Actix-web middleware function for validating JWT Tokens
pub async fn middleware(
    req: ServiceRequest,
    next: actix_web::middleware::Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    // Extract Token from Authorization Header
    let auth_header = req
        .headers()
        .get("Authorization")
        .and_then(|h| h.to_str().ok());

    let token = match auth_header {
        Some(h) if h.starts_with("Bearer ") => &h[7..],
        _ => {
            let (req, _pl) = req.into_parts();
            let res = HttpResponse::Unauthorized()
                .body("Missing or invalid Bearer token")
                .map_into_right_body();
            return Ok(ServiceResponse::new(req, res));
        }
    };

    // Obtain the pre-loaded Public Key
    let decoding_key = JWT_PUBLIC_KEY
        .get()
        .expect("La llave JWT_PUBLIC_KEY no fue inicializada");

    // Validate using RS256
    let mut validation = Validation::new(Algorithm::RS256);
    validation.validate_exp = true;

    match decode::<Claims>(token, decoding_key, &validation) {
        Ok(_) => {
            // Token is valid, proceed to the requested endpoint
            next.call(req)
                .await
                .map(ServiceResponse::map_into_left_body)
        }
        Err(e) => {
            log::error!("Token invalido: {}", e);
            let (req, _pl) = req.into_parts();
            let res = HttpResponse::Unauthorized()
                .body("Invalid Token")
                .map_into_right_body();
            Ok(ServiceResponse::new(req, res))
        }
    }
}

/// Endpoint to initialize a game match.
/// Secured globally by jwt_middleware via wrapping.
pub async fn post(
    payload: web::Json<Board>,
    srv: web::Data<Addr<game_server::GameServer>>,
) -> impl Responder {
    let board = payload.into_inner();
    let res = srv.send(game_server::InitMatch(board)).await;

    match res {
        Ok(Some(match_id)) => HttpResponse::Ok().json(serde_json::json!({ "match_id": match_id })),
        _ => HttpResponse::InternalServerError().body("Error initializing match"),
    }
}

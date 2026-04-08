use actix_web::{
    Error, HttpMessage,
    body::MessageBody,
    dev::{ServiceRequest, ServiceResponse},
    middleware::Next,
};
use chrono::NaiveDateTime;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: i64,
    pub exp: NaiveDateTime,
    pub iat: NaiveDateTime, // issued at
}

impl Claims {
    pub fn new(sub: i64, iat: NaiveDateTime) -> Self {
        Self {
            sub,
            iat,
            exp: iat + chrono::Duration::days(30), // 30 days
        }
    }
}

pub async fn jwt_auth(
    req: ServiceRequest,
    next: Next<impl MessageBody + 'static>,
) -> Result<ServiceResponse<impl MessageBody>, Error> {
    let secret = if let Some(cfg) = req.app_data::<actix_web::web::Data<crate::db::Database>>()
    {
        cfg.secret.clone()
    } else if let Some(s) = req.app_data::<actix_web::web::Data<String>>() {
        s.get_ref().clone()
    } else {
        panic!("AppConfig not found")
    };
    let auth_header = req
        .headers()
        .get("Authorization")
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Missing Authorization header"))
        .and_then(|v| {
            v.to_str().map_err(|err| {
                actix_web::error::ErrorUnauthorized(format!(
                    "Invalid Authorization header: {}",
                    err
                ))
            })
        })?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or_else(|| actix_web::error::ErrorUnauthorized("Invalid Authorization format"))?;

    #[derive(Deserialize)]
    struct RawClaims {
        sub: i64,
        exp: i64,
        iat: i64,
    }

    let raw = decode::<RawClaims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map_err(|err| actix_web::error::ErrorUnauthorized(err.to_string()))?
    .claims;

    let claims = Claims {
        sub: raw.sub,
        iat: chrono::DateTime::<chrono::Utc>::from_timestamp(raw.iat, 0)
            .ok_or_else(|| actix_web::error::ErrorUnauthorized("Invalid Authorization format"))?
            .naive_utc(),
        exp: chrono::DateTime::<chrono::Utc>::from_timestamp(raw.exp, 0)
            .ok_or_else(|| actix_web::error::ErrorUnauthorized("Invalid Authorization format"))?
            .naive_utc(),
    };

    req.extensions_mut().insert(claims);

    next.call(req).await.map(|res| res.map_into_boxed_body())
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{App, HttpResponse, http::StatusCode, middleware, test, web};

    #[actix_rt::test]
    async fn jwt_auth_allows_valid_token() {
        let secret = "testsecret";
        let key = jsonwebtoken::EncodingKey::from_secret(secret.as_bytes());
        let now = chrono::Utc::now().timestamp();
        let payload = serde_json::json!({ "sub": 7, "iat": now, "exp": now + 3600 });
        let token = jsonwebtoken::encode(&jsonwebtoken::Header::default(), &payload, &key).unwrap();

        let app = test::init_service(
            App::new()
                .app_data(web::Data::new(secret.to_string()))
                .wrap(middleware::from_fn(jwt_auth))
                .route("/", web::get().to(|| HttpResponse::Ok())),
        )
        .await;

        let req = test::TestRequest::get()
            .uri("/")
            .insert_header(("Authorization", format!("Bearer {}", token)))
            .to_request();

        let resp = test::call_service(&app, req).await;
        assert_eq!(resp.status(), StatusCode::OK);
    }
}

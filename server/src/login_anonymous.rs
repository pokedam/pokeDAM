use crate::prelude::*;
use jsonwebtoken::{EncodingKey, Header, encode};

// ── POST /api/auth/anonymous ───────────────────────────────
pub async fn login_anonymous(
    config: web::Data<AppConfig>,
    repo: web::Data<dyn Repository>,
) -> Result<HttpResponse, Error> {
    #[derive(Debug, Serialize)]
    pub struct TokenResponse {
        pub token: String,
        pub user_id: i64,
    }

    let user = repo
        .create_anonymous_user()
        .await
        .map_err(Error::internal)?;

    let token = encode(
        &Header::default(),
        &Claims::new(user.id, chrono::Utc::now().naive_utc()),
        &EncodingKey::from_secret(config.secret.as_bytes()),
    )
    .map_err(Error::internal)?;
    Ok(HttpResponse::Ok().json(TokenResponse {
        token,
        user_id: user.id,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::http::StatusCode;
    use std::sync::Arc;

    #[actix_rt::test]
    async fn login_anonymous_ok() {
        let fake = TestRepository {
            user_id: 123,
            ..Default::default()
        };
        let repo: web::Data<dyn Repository> =
            web::Data::from(Arc::new(fake) as Arc<dyn Repository>);

        let cfg = crate::config::AppConfig::new(
            Some("host".to_string()),
            Some(20349),
            Some("user".to_string()),
            Some("pass".to_string()),
            Some("db_name".to_string()),
            "super_secret_key".to_string(),
        );
        let config = web::Data::new(cfg);

        // Call handler
        let resp = login_anonymous(config, repo).await.unwrap();
        assert_eq!(resp.status(), StatusCode::OK);
        let body = actix_web::body::to_bytes(resp.into_body()).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["user_id"].as_i64().unwrap(), 123);
        assert!(json["token"].as_str().is_some());
    }
}

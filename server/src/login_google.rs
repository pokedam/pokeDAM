use crate::prelude::*;

#[derive(Debug, Deserialize)]
pub struct GoogleLoginRequest {
    pub id_token: String,
}

#[derive(Debug, Deserialize)]
struct GoogleTokenInfo {
    pub sub: String,
    pub email: Option<String>,
}

// ── POST /api/auth/google ──────────────────────────────────
pub async fn login_google(
    req: HttpRequest,
    repo: web::Data<dyn Repository>,
    body: web::Json<GoogleLoginRequest>,
) -> Result<HttpResponse, Error> {
    #[derive(Debug, Deserialize)]
    // Use module-scoped struct for reuse in tests
    

    #[derive(thiserror::Error, Clone, Copy)]
    #[error("Missing claims in request extensions")]
    struct MissingClaimsError;

    let user_id = req
        .extensions()
        .get::<Claims>()
        .ok_or_else(|| Error::unauthorized(MissingClaimsError))?
        .sub;

    let google_info: GoogleTokenInfo = verify_google_token(&body.id_token).await?;

    let user = repo
        .link_google_account(user_id, &google_info.sub, google_info.email.as_deref())
        .await
        .map_err(|e| Error::conflict(e.to_string()))?;

    Ok(HttpResponse::Ok().json(user))
}

async fn verify_google_token(id_token: &str) -> Result<GoogleTokenInfo, Error> {
    #[cfg(not(test))]
    {
        let info = reqwest::get(&format!(
            "https://oauth2.googleapis.com/tokeninfo?id_token={}",
            id_token
        ))
        .await
        .map_err(Error::internal)?
        .json::<GoogleTokenInfo>()
        .await
        .map_err(|e| Error::bad_request(format!("Google token verification failed: {}", e)))?;
        Ok(info)
    }

    #[cfg(test)]
    {
        // In tests we encode the id_token as "sub|email" for simplicity
        let parts: Vec<&str> = id_token.split('|').collect();
        let sub = parts.get(0).map(|s| s.to_string()).unwrap_or_default();
        let email = parts.get(1).map(|s| s.to_string());
        Ok(GoogleTokenInfo { sub, email })
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::{test, web, http::StatusCode};
    use std::sync::Arc;

    #[actix_rt::test]
    async fn login_google_ok() {
        let fake = TestRepository { user_id: 50, user_email: Some("g@e.com".to_string()), user_google_sub: Some("sub50".to_string()), ..Default::default() };
        let repo: web::Data<dyn Repository> = web::Data::from(Arc::new(fake) as Arc<dyn Repository>);

        let claims = crate::jwt::Claims::new(5, chrono::Utc::now().naive_utc());
        let req = test::TestRequest::default().to_http_request();
        req.extensions_mut().insert(claims);

        let body = GoogleLoginRequest { id_token: "sub50|g@e.com".to_string() };

        let resp = login_google(req, repo, web::Json(body)).await.unwrap();
        assert_eq!(resp.status(), StatusCode::OK);
        let body = actix_web::body::to_bytes(resp.into_body()).await.unwrap();
        let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
        assert_eq!(json["id"].as_i64().unwrap(), 50);
    }
}

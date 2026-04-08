use crate::prelude::*;
use async_trait::async_trait;
use deadpool_postgres::{Config, ManagerConfig, Pool, RecyclingMethod, Runtime};
use tokio_postgres::NoTls;

mod functions;
pub use functions::*;
/// Application configuration loaded from environment variables.
#[derive(Clone)]
pub struct Database {
    pub secret: String,
    pub pool: Pool,
}

impl Database {
    pub fn new(
        host: Option<String>,
        port: Option<u16>,
        user: Option<String>,
        password: Option<String>,
        db_name: Option<String>,
        jwt_secret: String,
    ) -> Self {
        Database {
            secret: jwt_secret,
            pool: Config {
                host,
                port,
                user,
                password,
                dbname: db_name,
                manager: Some(ManagerConfig {
                    recycling_method: RecyclingMethod::Fast,
                }),
                ..Default::default()
            }
            .create_pool(Some(Runtime::Tokio1), NoTls)
            .expect("Failed to create database pool"),
        }
    }

    pub fn from_env() -> Self {
        Self::new(
            std::env::var("PG_HOST").ok(),
            std::env::var("PG_PORT").ok().map(|v| v.parse().unwrap()),
            std::env::var("PG_USER").ok(),
            std::env::var("PG_PASSWORD").ok(),
            std::env::var("PG_DBNAME").ok(),
            std::env::var("JWT_SECRET").expect("JWT_SECRET must be set"),
        )
    }

    //    #[cfg(test)]
    // pub fn test_new(secret: &str) -> Self {
    //     let mut cfg = Config::new();
    //     cfg.manager = Some(ManagerConfig {
    //         recycling_method: RecyclingMethod::Fast,
    //     });
    //     cfg.dbname = Some("test".into());
    //     cfg.user = Some("test".into());
    //     cfg.password = Some("".into());
    //     let pool = cfg
    //         .create_pool(Some(Runtime::Tokio1), NoTls)
    //         .expect("Failed to create test pool");
    //     AppConfig {
    //         secret: secret.to_string(),
    //         pool,
    //     }
    // }
}

#[async_trait]
impl Repository for Database {
    async fn create_anonymous_user(&self) -> Result<db::User, Box<dyn std::error::Error>> {
        create_anonymous_user(&self.pool).await
    }

    async fn link_google_account(
        &self,
        user_id: i64,
        google_sub: &str,
        google_email: Option<&str>,
    ) -> Result<db::User, Box<dyn std::error::Error>> {
        link_google_account(&self.pool, user_id, google_sub, google_email).await
    }
}

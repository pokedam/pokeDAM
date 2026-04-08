pub mod config;
pub mod db;
pub mod error;
pub mod jwt;
pub mod login_anonymous;
pub mod login_google;
pub mod repository;

pub mod prelude {
    #[cfg(test)]
    pub use crate::repository::TestRepository;
    pub use crate::{config::AppConfig, db, error::Error, jwt::Claims, repository::Repository};
    pub use actix_web::{HttpMessage, HttpRequest, HttpResponse, web};
    pub use serde::{Deserialize, Serialize};
}

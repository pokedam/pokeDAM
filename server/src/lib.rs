pub mod auth_annonymous;
pub mod auth_google;
pub mod db;
pub mod error;
pub mod jwt;
pub mod repository;

pub mod prelude {
    #[cfg(test)]
    pub use crate::repository::TestRepository;
    pub use crate::{db::Database, db, error::Error, jwt::Claims, repository::Repository};
    pub use actix_web::{HttpMessage, HttpRequest, HttpResponse, web};
    pub use serde::{Deserialize, Serialize};
}

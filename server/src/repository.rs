use async_trait::async_trait;

use crate::db;

#[async_trait]
pub trait Repository: Send + Sync + 'static {
    async fn create_anonymous_user(&self) -> Result<db::User, Box<dyn std::error::Error>>;

    async fn link_google_account(
        &self,
        user_id: i64,
        google_sub: &str,
        google_email: Option<&str>,
    ) -> Result<db::User, Box<dyn std::error::Error>>;
}

#[cfg(test)]
pub use tests::TestRepository;

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Default)]
    pub struct TestRepository {
        pub profile_id: i64,
        pub company_id: i64,
        pub allowed: bool,
        pub token_id: uuid::Uuid,
        pub user_id: i64,
        pub user_email: Option<String>,
        pub user_google_sub: Option<String>,
    }

    #[async_trait]
    impl Repository for TestRepository {
        async fn create_anonymous_user(&self) -> Result<db::User, Box<dyn std::error::Error>> {
            Ok(db::User {
                id: self.user_id,
                google_email: self.user_email.clone(),
                google_sub: self.user_google_sub.clone(),
                created_at: chrono::Utc::now().naive_utc(),
            })
        }

        async fn link_google_account(
            &self,
            _user_id: i64,
            _google_sub: &str,
            _google_email: Option<&str>,
        ) -> Result<db::User, Box<dyn std::error::Error>> {
            Ok(db::User {
                id: self.user_id,
                google_email: self.user_email.clone(),
                google_sub: self.user_google_sub.clone(),
                created_at: chrono::Utc::now().naive_utc(),
            })
        }
    }
}

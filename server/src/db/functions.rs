use chrono::NaiveDateTime;
use core::error::Error;
use deadpool_postgres::Pool;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct User {
    pub id: i64,
    pub google_email: Option<String>,
    pub google_sub: Option<String>,
    pub created_at: NaiveDateTime,
}

/// Run the initial migration: create the `users` table if it doesn't exist.
pub async fn init(pool: &Pool) -> Result<(), Box<dyn Error>> {
    pool.get()
        .await?
        .batch_execute(include_str!("init.sql"))
        .await?;

    Ok(())
}

/// Insert a new anonymous user and return it.
pub async fn create_anonymous_user(pool: &Pool) -> Result<User, Box<dyn std::error::Error>> {
    let client = pool.get().await?;
    let row = client
        .query_one(
            "INSERT INTO users DEFAULT VALUES
            RETURNING *",
            &[],
        )
        .await?;

    Ok(row_to_user(&row))
}

/// Links a Google account to an existing user.
/// Check if google_sub is already linked to another user
/// If google_sub is already linked, return the old user, otherwise link to the current user.
pub async fn link_google_account(
    pool: &Pool,
    user_id: i64,
    google_sub: &str,
    google_email: Option<&str>,
) -> Result<User, Box<dyn std::error::Error>> {
    let client = pool.get().await?;

    let existing = client
        .query_opt(
            "SELECT *
        FROM users
        WHERE google_sub = $1",
            &[&google_sub],
        )
        .await?;

    let row = match existing {
        Some(data) => data,
        None => {
            client
                .query_one(
                    "UPDATE users SET google_sub = $1, google_email = $2
                    WHERE id = $3
                    RETURNING *",
                    &[&google_sub, &google_email, &user_id],
                )
                .await?
        }
    };

    print!("Google sub check: {:?}\n", row);

    Ok(row_to_user(&row))
}

fn row_to_user(row: &tokio_postgres::Row) -> User {
    User {
        id: row.get("id"),
        google_email: row.get("google_email"),
        google_sub: row.get("google_sub"),
        created_at: row.get("created_at"),
    }
}

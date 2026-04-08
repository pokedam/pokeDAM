use server::prelude::*;

#[tokio::test]
async fn db_flow_end_to_end() {
    let config = AppConfig::new(
        Some("localhost".to_string()),
        Some(5432),
        Some("postgres".to_string()),
        Some("postgres".to_string()),
        Some("winpyme".to_string()),
        "super_secret_key".to_string(),
    );
    // apply migrations
    db::init(&config.pool).await.unwrap();

    // create anonymous user
    let user = db::create_anonymous_user(&config.pool).await.unwrap();

    // create company + admin profile and assign to user
    let (_, profile_id) = db::create_company(&config.pool, user.id, "TestCo")
        .await
        .unwrap();

    // create a non-reusable token
    let token = db::create_token(&config.pool, profile_id, None, false)
        .await
        .unwrap();

    // consume token and link user
    let profile = db::consume_token_for_user(&config.pool, user.id, token.id)
        .await
        .unwrap();
    assert_eq!(profile, profile_id);

    // attempting to consume again should fail (token removed)
    let res = db::consume_token_for_user(&config.pool, user.id, token.id).await;
    assert!(res.is_err());
}

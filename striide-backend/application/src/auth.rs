/*
 * External imports
 */
use chrono::{DateTime, Utc};
use rocket::http::Status;
use rocket_db_pools::sqlx::{PgConnection, Row};

/*
 * Internal imports
 */
use models::session::Session;
use models::user::User;
use shared::response_models::ErrorResponse;

use crate::utils;

pub async fn user_exists(conn: &mut PgConnection, email: String) -> Result<bool, ErrorResponse> {
    sqlx::query("SELECT email FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(conn)
        .await
        .and_then(|row| Ok(row.is_some()))
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to check if user exists".to_owned(),
        })
}

pub async fn insert_user(conn: &mut PgConnection, user: User) -> Result<String, ErrorResponse> {
    sqlx::query(
        "INSERT INTO users (email, hashed_password, name, role) VALUES ($1, $2, $3, $4) RETURNING xata_id",
    )
    .bind(user.get_email())
    .bind(user.get_hashed_password())
    .bind(user.get_name())
    .bind(user.get_role())
    .fetch_one(conn)
    .await
    .and_then(|row| {
        let xata_id: String = row.try_get("xata_id")?;
        Ok(xata_id)
    })
    .map_err(|_| ErrorResponse {
        status: Status::InternalServerError,
        message: "Failed to create user".to_owned(),
    })
}

pub async fn get_user_id(conn: &mut PgConnection, email: String) -> Result<String, ErrorResponse> {
    sqlx::query("SELECT xata_id FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let xata_id: String = row.try_get("xata_id")?;
            Ok(xata_id)
        })
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to retrieve user".to_owned(),
        })
}

pub async fn get_user_password(
    conn: &mut PgConnection,
    email: String,
) -> Result<String, ErrorResponse> {
    sqlx::query("SELECT hashed_password FROM users WHERE email = $1")
        .bind(email)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let hashed_password: String = row.try_get("hashed_password")?;
            Ok(hashed_password)
        })
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to retrieve user".to_owned(),
        })
}

pub async fn insert_user_ip(
    conn: &mut PgConnection,
    ip: String,
    user_id: String,
) -> Result<(), ErrorResponse> {
    sqlx::query("INSERT INTO user_ip (ip_address, userid) VALUES ($1, $2)")
        .bind(ip)
        .bind(user_id)
        .execute(conn)
        .await
        .and_then(|_| Ok(()))
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to create user ip".to_owned(),
        })
}

pub async fn insert_session(
    conn: &mut PgConnection,
    session: Session,
    user_id: String,
) -> Result<(), ErrorResponse> {
    sqlx::query("INSERT INTO session (created, access_expires, access_token, refresh_expires, refresh_token, userid) VALUES ($1, $2, $3, $4, $5, $6)")
        .bind(session.created_at())
        .bind(session.access_expires())
        .bind(session.access_token())
        .bind(session.refresh_expires())
        .bind(session.refresh_token())
        .bind(user_id)
        .execute(conn)
        .await
        .and_then(|_| {
            Ok(())
        })
        .map_err(|_| {
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to create session".to_owned(),
            }
        })
}

pub async fn get_session(
    conn: &mut PgConnection,
    user_id: String,
) -> Result<Session, ErrorResponse> {
    sqlx::query("SELECT created, access_expires, access_token, refresh_expires, refresh_token FROM session WHERE userid = $1")
        .bind(user_id)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let created: DateTime<Utc> = row.try_get("created")?;
            let access_expires: DateTime<Utc> = row.try_get("access_expires")?;
            let access_token: String = row.try_get("access_token")?;
            let refresh_expires: DateTime<Utc> = row.try_get("refresh_expires")?;
            let refresh_token: String = row.try_get("refresh_token")?;
            Ok(Session::new_from_values(created, access_expires, access_token, refresh_expires, refresh_token))
        })
        .map_err(|_| {
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to retrieve session".to_owned(),
            }
        })
}

pub async fn remove_session(conn: &mut PgConnection, user_id: String) -> Result<(), ErrorResponse> {
    sqlx::query("DELETE FROM session WHERE userid = $1")
        .bind(user_id)
        .execute(conn)
        .await
        .and_then(|_| Ok(()))
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to delete session".to_owned(),
        })
}

pub async fn valid_refresh_token(
    conn: &mut PgConnection,
    refresh_token: String,
) -> Result<bool, ErrorResponse> {
    sqlx::query("SELECT refresh_expires FROM session INNER JOIN users ON session.userid = users.xata_id WHERE refresh_token = $1")
        .bind(refresh_token)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let expires: DateTime<Utc> = row.try_get("refresh_expires")?;
            let is_active = expires > Utc::now();
            return Ok(is_active);
        })
        .map_err(|_| {
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to retrieve session".to_owned(),
            }
        })
}

pub async fn new_refresh_token(
    conn: &mut PgConnection,
    user_id: String,
    token_length: usize,
    days_expires: i64,
) -> Result<String, ErrorResponse> {
    let new_token = utils::create_token(token_length);
    sqlx::query("UPDATE session SET refresh_token = $1, refresh_expires = $2 WHERE userid = $3")
        .bind(new_token.clone())
        .bind(Utc::now() + chrono::Duration::days(days_expires))
        .bind(user_id)
        .execute(conn)
        .await
        .and_then(|res| {
            if res.rows_affected() != 1 {
                return Err(sqlx::Error::RowNotFound);
            }
            Ok(new_token)
        })
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to update access token".to_owned(),
        })
}

pub async fn new_access_token(
    conn: &mut PgConnection,
    refresh_token: String,
    token_length: usize,
    min_expires: i64,
) -> Result<String, ErrorResponse> {
    let new_token = utils::create_token(token_length);
    sqlx::query(
        "UPDATE session SET access_token = $1, access_expires = $2 WHERE refresh_token = $3",
    )
    .bind(new_token.clone())
    .bind(Utc::now() + chrono::Duration::minutes(min_expires))
    .bind(refresh_token)
    .execute(conn)
    .await
    .and_then(|_| Ok(new_token))
    .map_err(|_| ErrorResponse {
        status: Status::InternalServerError,
        message: "Failed to update access token".to_owned(),
    })
}

pub async fn new_csrf_token(
    conn: &mut PgConnection,
    access_token: String,
    token_length: usize,
) -> Result<String, ErrorResponse> {
    let new_token = utils::create_token(token_length);
    sqlx::query("UPDATE session SET csrf_token = $1 WHERE access_token = $2")
        .bind(new_token.clone())
        .bind(access_token)
        .execute(conn)
        .await
        .and_then(|_| Ok(new_token))
        .map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to update csrf token".to_owned(),
        })
}

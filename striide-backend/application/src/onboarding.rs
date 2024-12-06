use chrono::{DateTime, Utc};
use rocket::http::Status;
use rocket_db_pools::sqlx::{PgConnection, Row};

/*
 * Internal imports
 */
use models::session::Session;
use models::onboarding::UserInfo;
use shared::response_models::ErrorResponse;

use crate::utils;


pub async fn insert_user(conn: &mut PgConnection, email: String, user_info: UserInfo) -> Result<String, ErrorResponse> {
    sqlx::query(
        "INSERT INTO user_info (email, city, state, occupation, gender, birthdate, phone_number, transport_modes, commute_frequency, travel_time, feed_type) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (user_id) DO UPDATE SET
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         occupation = EXCLUDED.occupation,
         gender = EXCLUDED.gender,
         birthdate = EXCLUDED.birthdate,
         phone_number = EXCLUDED.phone_number,
         transport_modes = EXCLUDED.transport_modes,
         commute_frequency = EXCLUDED.commute_frequency,
         travel_time = EXCLUDED.travel_time,
         feed_type = EXCLUDED.feed_type"
    )
    .bind(email)
    .bind(user_info.get_city())
    .bind(user_info.get_state())
    .bind(user_info.get_occupation())
    .bind(user_info.get_gender().to_string())
    .bind(user_info.get_birthdate())
    .bind(user_info.get_phone_number())
    .bind(user_info.get_transport_modes().iter().map(|m| m.to_string()).collect::<Vec<String>>())
    .bind(user_info.get_commute_frequency().to_string())
    .bind(user_info.get_travel_time().to_string())
    .bind(user_info.get_feed_type().to_string())
    .execute(conn)
    .await
    .map(|_| "Success".to_string())  // Change this block
    .map_err(|e| ErrorResponse {  // Change this block
        status: Status::InternalServerError,
        message: format!("Failed to create user: {}", e),
    })
}


pub async fn create_user_info_table(conn: &mut PgConnection) -> Result<(), ErrorResponse> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS user_info (
            user_id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            city VARCHAR(100),
            state VARCHAR(100),
            occupation VARCHAR(100),
            gender VARCHAR(50),
            birthdate DATE,
            phone_number VARCHAR(20),
            transport_modes TEXT[],
            commute_frequency VARCHAR(50),
            travel_time VARCHAR(50),
            feed_type VARCHAR(50)
        )"
    )
    .execute(conn)
    .await
    .map(|_| ())
    .map_err(|e| ErrorResponse {
        status: Status::InternalServerError,
        message: format!("Failed to create user_info table: {}", e),
    })
}



/*
 * External imports
 */
use rocket::http::Status;
use rocket_db_pools::sqlx::{PgConnection, Row};

/*
 * Internal imports
 */
use chrono::{Datelike, Timelike, Utc, Weekday};
use chrono_tz::US::Eastern;
use shared::response_models::ErrorResponse;

pub async fn get_open_businesses(conn: &mut PgConnection) -> Result<Vec<i64>, ErrorResponse> {
    let now_est = Utc::now().with_timezone(&Eastern);
    let minutes = (now_est.num_seconds_from_midnight() / 60) as i32;
    let weekday = match now_est.weekday() {
        Weekday::Mon => 0,
        Weekday::Tue => 1,
        Weekday::Wed => 2,
        Weekday::Thu => 3,
        Weekday::Fri => 4,
        Weekday::Sat => 5,
        Weekday::Sun => 6,
    };

    let result = sqlx::query(
        "
        SELECT mapbox_id 
        FROM business_hours 
        INNER JOIN mapbox_id ON business_hours.business = mapbox_id.business 
        WHERE (day = $1 AND open <= $2 AND close >= $2) OR (day = $3 AND open <= $4 AND close >= $4)
    ",
    )
    .bind(weekday)
    .bind(minutes)
    .bind((weekday - 1) % 7)
    .bind(minutes + 1440)
    .fetch_all(conn)
    .await
    .and_then(|rows| {
        let building_ids: Vec<i64> = rows
            .into_iter()
            .map(|row| row.try_get("mapbox_id"))
            .filter_map(Result::ok)
            .collect();
        Ok(building_ids)
    });

    match result {
        Ok(building_ids) => Ok(building_ids),
        Err(_) => Err(ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to retrieve open businesses".to_owned(),
        }),
    }
}

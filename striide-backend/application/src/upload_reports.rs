use chrono::{DateTime, Utc};
use models::user::UserSession;
use rocket::http::Status;
use rocket::serde::{Deserialize, Serialize};
// use rocket_db_pools::sqlx::PgConnection;
use shared::response_models::{BasicReport, ErrorResponse, MediaBody, ReportString, UserReport};
use sqlx::{PgConnection, Row};

use shared::response_models::{InsertReportBody, ReportBody, ReportRequest};

pub async fn insert_report(
    user_session: UserSession,
    request: UserReport,
) -> Result<String, ErrorResponse> {
    let UserReport {
        location,
        description,
        duration,
        is_published,
        media,
        address,
    } = request;

    if location.is_empty() || description.is_empty() || duration.is_empty() {
        return Err(ErrorResponse {
            status: Status::BadRequest,
            message: "Input was malformed - expected a location - [lng, lat], description - string, duration - string, media - file type, is_published - bool".to_owned(),
        });
    }

    let json_body = InsertReportBody {
        address: address,
        userid: user_session.id,
        lng: location[0],
        lat: location[1],
        duration: duration,
        media: media
            .into_iter()
            .map(|m| {
                Some(MediaBody {
                    name: m.name,
                    mediaType: m.media_type,
                    base64Content: m.base64,
                })
            })
            .collect(),
        description: description,
        is_published: is_published,
    };

    let client = reqwest::Client::new();

    let res = client
        .post("https://Striide-cb2s42.us-east-1.xata.sh/db/striide:main/tables/reports/data")
        .bearer_auth(std::env::var("XATA_API_KEY").unwrap_or("".to_owned()))
        .json(&json_body)
        .send()
        .await
        .map_err(|err| {
            println!("{:?}", err);
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to create feedback".to_owned(),
            }
        })?;

    if !res.status().is_success() {
        return Err(ErrorResponse {
            status: Status::InternalServerError,
            message: "failed to create a report - please try again later".to_owned(),
        });
    }

    Ok("sucesss".to_owned())
}

pub async fn get_all_published_reports(
    user_session: UserSession,
    conn: &mut PgConnection,
) -> Result<Vec<ReportBody>, ErrorResponse> {
    let sql_query = "SELECT * FROM reports WHERE is_published = $1";

    let result = sqlx::query(sql_query)
        .bind(false)
        .fetch_all(conn)
        .await
        .and_then(|rows| {
            let data_rows: Vec<ReportBody> = rows
                .iter()
                .map(|row| {
                    let created_at: DateTime<Utc> = row.try_get("xata_createdat").unwrap();
                    let created_at_str = created_at.to_rfc3339();

                    ReportBody {
                        reportID: row.try_get("xata_id").unwrap(),
                        address: row.try_get("address").unwrap(),
                        lng: row.try_get("lng").unwrap(),
                        lat: row.try_get("lat").unwrap(),
                        duration: row.try_get("duration").unwrap(),
                        userid: row.try_get("userid").unwrap(),
                        media: None,
                        description: row.try_get("description").unwrap(),
                        is_published: row.try_get("is_published").unwrap(),
                        created_at: created_at_str,
                    }
                })
                .collect();

            let user_reports: Vec<ReportBody> = data_rows
                .iter()
                .filter(|row| row.userid == user_session.id)
                .map(|row| row.clone())
                .collect();

            Ok(user_reports)
        })
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        });

    let data = match result {
        Ok(data) => data,
        Err(err) => {
            return Err(ErrorResponse {
                status: Status::InternalServerError,
                message: err.message,
            })
        }
    };

    println!("{data:#?}");

    Ok(data)
}

pub async fn get_report_draft(
    draft_request: ReportRequest,
    conn: &mut PgConnection,
) -> Result<ReportBody, ErrorResponse> {
    let ReportRequest { reportID } = draft_request;

    let sql_query = "SELECT * FROM reports WHERE xata_id = $1";

    let draft = sqlx::query(sql_query)
        .bind(reportID)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let created_at: DateTime<Utc> = row.try_get("xata_createdat").unwrap();
            let created_at_str = created_at.to_rfc3339();

            Ok(ReportBody {
                reportID: row.try_get("xata_id").unwrap(),
                address: row.try_get("address").unwrap(),
                lng: row.try_get("lng").unwrap(),
                lat: row.try_get("lat").unwrap(),
                duration: row.try_get("duration").unwrap(),
                userid: row.try_get("userid").unwrap(),
                media: None,
                description: row.try_get("description").unwrap(),
                is_published: row.try_get("is_published").unwrap(),
                created_at: created_at_str,
            })
        })
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        });

    let result = match draft {
        Ok(data) => data,
        Err(err) => {
            return Err(ErrorResponse {
                status: Status::InternalServerError,
                message: err.message,
            })
        }
    };

    Ok(result)
}

pub async fn delete_draft(
    draft_request: ReportRequest,
    conn: &mut PgConnection,
) -> Result<u64, ErrorResponse> {
    let ReportRequest { reportID } = draft_request;

    let sql_query = "DELETE FROM reports WHERE xata_id = $1";

    let rows_affected = sqlx::query(sql_query)
        .bind(reportID)
        .execute(conn)
        .await
        .and_then(|rows| Ok(rows.rows_affected()))
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        });

    let result = match rows_affected {
        Ok(data) => data,
        Err(err) => {
            return Err(ErrorResponse {
                status: Status::InternalServerError,
                message: err.message,
            })
        }
    };

    Ok(result)
}

pub async fn set_draft_to_publish(
    draft_request: ReportRequest,
    conn: &mut PgConnection,
) -> Result<u64, ErrorResponse> {
    let ReportRequest { reportID } = draft_request;

    let sql_query = "UPDATE reports SET is_published=$1 WHERE xata_id=$2";

    let rows_affected = sqlx::query(sql_query)
        .bind(true)
        .bind(reportID)
        .execute(conn)
        .await
        .and_then(|rows| Ok(rows.rows_affected()))
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        });

    let result = match rows_affected {
        Ok(data) => data,
        Err(err) => {
            return Err(ErrorResponse {
                status: Status::InternalServerError,
                message: err.message,
            })
        }
    };

    Ok(result)
}


#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct ReportLike {
    pub id: String,
    pub liked: Option<bool>,
}
pub async fn user_like_report(
    report_id: String,
    user_id: String,
    user_liked: Option<bool>,
    conn: &mut PgConnection,
) -> Result<(), ErrorResponse> {
    
    let sql_query = "INSERT INTO report_likes (report, userid, liked) VALUES ($1, $2, $3) ON CONFLICT (report, userid) DO UPDATE SET liked = $3";
    if user_liked.is_none() {
        sqlx::query("INSERT INTO report_likes (report, userid, liked) VALUES ($1, $2, NULL) ON CONFLICT (report, userid) DO UPDATE SET liked = NULL")
        .bind(report_id.clone())
        .bind(user_id.clone())
        .execute(conn)
        .await
        .and_then(|_| Ok(()))
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        })
    } else {
        let a = user_liked.unwrap();
        println!("user_id: {user_id}, report_id: {report_id}, user_liked: {a}");
    sqlx::query(sql_query)
        .bind(report_id)
        .bind(user_id)
        .bind(user_liked.unwrap())
        .execute(conn)
        .await
        .and_then(|_| Ok(()))
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        })
    }
}

pub async fn get_report_likes(
    report_id: String,
    conn: &mut PgConnection,
) -> Result<i64, ErrorResponse> {
    sqlx::query("SELECT COUNT(*) AS c FROM report_likes WHERE report = $1 AND liked = true")
        .bind(report_id)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let likes = row.try_get("c")?;
            Ok(likes)
        })
        .map_err(|err| {
            println!("{:?}", err);
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to retrieve likes".to_owned(),
            }
        })
}

pub async fn get_report_dislikes(
    report_id: String,
    conn: &mut PgConnection,
) -> Result<i64, ErrorResponse> {
    sqlx::query("SELECT COUNT(*) AS c FROM report_likes WHERE report = $1 AND liked = false")
        .bind(report_id)
        .fetch_one(conn)
        .await
        .and_then(|row| {
            let dislikes = row.try_get("c")?;
            Ok(dislikes)
        })
        .map_err(|err| {
            println!("{:?}", err);
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to retrieve dislikes".to_owned(),
            }
        })
}

pub async fn get_user_liked_report(
    report_id: String,
    user_id: String,
    conn: &mut PgConnection,
) -> Result<Option<bool>, ErrorResponse> {
    println!("user_id: {user_id}, report_id: {report_id}");
    sqlx::query("SELECT liked FROM report_likes WHERE report = $1 AND userid = $2")
        .bind(report_id)
        .bind(user_id)
        .fetch_optional(conn)
        .await
        .and_then(|row| {
            if row.is_none() {
                return Ok(None);
            }
            let res = row.unwrap().try_get("liked");
            let liked = match res {
                Ok(liked) => liked,
                Err(_) => {
                    return Ok(None)
                }
            };
            Ok(Some(liked))
        })
        .map_err(|err| {
            println!("{:?}", err);
            ErrorResponse {
                status: Status::InternalServerError,
                message: "Failed to retrieve user's like".to_owned(),
            }
        })
}

pub async fn get_report_ids(
    conn: &mut PgConnection,
) -> Result<Vec<BasicReport>, ErrorResponse> {
    let sql_query = "SELECT xata_id, lat, lng FROM reports WHERE is_published = true";

    let report_ids = sqlx::query(sql_query)
        .fetch_all(conn)
        .await
        .and_then(|rows| {
            let data_rows: Vec<BasicReport> = rows
                .iter()
                .map(|row| {
                    BasicReport {
                        id: row.try_get("xata_id").unwrap(),
                        lat: row.try_get("lat").unwrap(),
                        lng: row.try_get("lng").unwrap(),
                    }
                })
                .collect();

            Ok(data_rows)
        })
        .map_err(|err| ErrorResponse {
            status: Status::InternalServerError,
            message: err.to_string(),
        });

    let result = match report_ids {
        Ok(data) => data,
        Err(err) => {
            return Err(ErrorResponse {
                status: Status::InternalServerError,
                message: err.message,
            })
        }
    };

    Ok(result)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct ReportRequestBody {
    pub columns: Vec<String>,
    pub filter: ReportRequestFilter
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct ReportRequestFilter {
    pub id: String,
}
#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Id {
    pub id: String,
}
pub async fn get_report_info(
    report_id: String,
) -> Result<ReportString, ErrorResponse> {

    let client = reqwest::Client::new();
    let body = ReportRequestBody {
        columns: vec![
            "duration".to_owned(),
            "description".to_owned(),
            "media.base64Content".to_owned(),
            "media.mediaType".to_owned(),
            "media.name".to_owned(),
        ],
        filter: ReportRequestFilter {
            id: report_id,
        }
    };

    let res = client.post("https://Striide-cb2s42.us-east-1.xata.sh/db/striide:main/tables/reports/query")
        .bearer_auth(std::env::var("XATA_API_KEY").unwrap_or("".to_owned()))
        .json(&body)
        .send().await.map_err(|err| {
            ErrorResponse {
                status: Status::InternalServerError,
                message: err.to_string(),
            }
        })?;

    if !res.status().is_success() {
        return Err(ErrorResponse {
            status: Status::new(res.status().into()),
            message: res.text().await.unwrap(),
        });
    }

    Ok(ReportString {
        json: res.text().await.unwrap(),
    })
}
/*
 * External imports
 */
use rocket::{http::Status, serde::{Deserialize, Serialize}};
use rocket::serde::json::Json;

/*
 * Internal imports
 */
use shared::response_models::{ErrorResponse, Response, ResponseBody, Media, MediaBody};
use models::user::UserSession;

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FeedbackRequest {
    report_type: String,
    severity: String,
    comments: String,
    stars: i32,
    contact: bool,
    media: Vec<Media>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FeedbackBody {
    userid: String,
    report_type: String,
    severity: String,
    comments: String,
    stars: i32,
    contact: bool,
    media: Vec<MediaBody>,
}

#[post("/feedback", data = "<request>")]
pub async fn submit_feedback(session: UserSession, request: Json<FeedbackRequest>) -> Result<Response, ErrorResponse> {
    let data = request.into_inner();

    let client = reqwest::Client::new();
    let body: FeedbackBody = FeedbackBody {
        userid: session.id,
        report_type: data.report_type,
        severity: data.severity,
        comments: data.comments,
        stars: data.stars,
        contact: data.contact,
        media: data.media.into_iter().map(|m| MediaBody {
            name: m.name,
            mediaType: m.media_type,
            base64Content: m.base64,
        }).collect(),
    };

    let res = client.post("https://Striide-cb2s42.us-east-1.xata.sh/db/striide:main/tables/feedback/data")
        .bearer_auth(std::env::var("XATA_API_KEY").unwrap_or("".to_owned()))
        .json(&body).send().await.map_err(|err| {
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

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::Message("Feedback submitted successfully".to_owned()),
    })
}

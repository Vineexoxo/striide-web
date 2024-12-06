use models::user::Role;
use rocket::http::ContentType;
use rocket::request::Request;
use rocket::response::{self, Responder};
use rocket::serde::{Deserialize, Serialize, Serializer};
use serde_json;
use std::io::Cursor; 

/* ResponseBody: enum defining struct to return */
#[derive(Debug)]
pub enum ResponseBody {
    Message(String),
    Token(TokenResponse),
    NewToken(NewToken),
    UserInfo(UserInfo),
    BusinessResponse(BusinessResponse),
    ReportResponse(ReportResponse),
    ComputedPath(ComputedPath), 
    ClientResponse(ClientResponse),
    Reports(Reports),
    ReportBody(ReportBody),
    BasicReportInfo(BasicReportInfo),
    ReportString(ReportString),
    ReportLikes(UserReportLikes),

}
/* Custom serialize implemented to remove struct name from response body */
impl Serialize for ResponseBody {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            /* Add ResponseBody enums to the following pattern */
            ResponseBody::Message(msg) => msg.serialize(serializer),
            ResponseBody::Token(token_response) => token_response.serialize(serializer),
            ResponseBody::NewToken(new_token) => new_token.serialize(serializer),
            ResponseBody::UserInfo(user_response) => user_response.serialize(serializer),
            ResponseBody::BusinessResponse(business_response) => {
                business_response.serialize(serializer)
            }
            ResponseBody::ReportResponse(report_response) => report_response.serialize(serializer),
            ResponseBody::ComputedPath(path) => path.serialize(serializer),
            ResponseBody::ClientResponse(path) => path.serialize(serializer), 
            ResponseBody::Reports(path) => path.serialize(serializer), 
            ResponseBody::ReportBody(path) => path.serialize(serializer),
            ResponseBody::BasicReportInfo(path) => path.serialize(serializer),
            ResponseBody::ReportString(path) => path.serialize(serializer),
            ResponseBody::ReportLikes(path) => path.serialize(serializer),
        }
    }
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct BasicReportInfo {
    pub reports: Vec<BasicReport>
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct BasicReport {
    pub id: String,
    pub lat: f64,
    pub lng: f64,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ReportString {
    pub json: String,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct TokenResponse {
    pub message: String,
    pub token: String,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct NewToken {
    pub message: String,
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct BusinessResponse {
    pub message: String,
    pub ids: Vec<i64>,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct UserInfo {
    pub email: String,
    pub role: Role,
    pub name: String,
    pub onboard: bool,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ReportResponse {
    pub message: String,
    pub reports: Vec<UserReport>,
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct Response {
    pub status: rocket::http::Status,
    pub body: ResponseBody,
}
#[rocket::async_trait]
impl<'r> Responder<'r, 'static> for Response {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        let res = serde_json::to_string(&self).unwrap();
        response::Response::build()
            .header(ContentType::JSON)
            .status(self.status)
            .sized_body(res.len(), Cursor::new(res))
            .ok()
    }
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ErrorResponse {
    pub status: rocket::http::Status,
    pub message: String,
}
#[rocket::async_trait]
impl<'r> Responder<'r, 'static> for ErrorResponse {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        let res = serde_json::to_string(&self).unwrap();
        response::Response::build()
            .header(ContentType::JSON)
            .status(self.status)
            .sized_body(res.len(), Cursor::new(res))
            .ok()
    }
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ComputedPath {
    pub striide_route: Vec<(f64, f64)>, 
    pub mapbox_route: Vec<(f64, f64)>
}

#[derive(Serialize, Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserReport {
    pub address: String, 
    pub location: Vec<f64>,
    pub description: String,
    pub duration: String,
    pub media: Vec<Media>,
    pub is_published: bool,
}

#[derive(Serialize, Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Reports {
    pub reports: Vec<ReportBody>
}

#[derive(Serialize, Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserReportLikes {
    pub likes: i64,
    pub dislikes: i64,
    pub user_liked: Option<bool>
}

#[derive(Serialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ClientResponse {
    pub is_ok: bool,
    pub status: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Media {
    pub name: String,
    pub media_type: String,
    pub base64: String,
}

#[allow(non_snake_case)]
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(crate = "rocket::serde")]
pub struct MediaBody {
    pub name: String,
    pub mediaType: String,
    pub base64Content: String,
}

#[derive(Serialize, Debug, Deserialize, Clone)]
#[allow(non_snake_case)]
#[serde(crate = "rocket::serde")]
pub struct ReportBody {
    pub reportID: String, 
    pub address: String,
    pub userid: String,
    pub lng: f64,
    pub lat: f64,
    pub duration: String,
    pub description: String,
    pub media: Option<Vec<MediaBody>>,
    pub is_published: bool,
    pub created_at: String, 
}

#[derive(Serialize, Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct InsertReportBody {
    pub address: String,
    pub userid: String,
    pub lng: f64,
    pub lat: f64,
    pub duration: String,
    pub description: String,
    pub media: Option<Vec<MediaBody>>,
    pub is_published: bool,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug)]
#[serde(crate = "rocket::serde")]
pub struct ReportRequest {
    pub reportID: String,
}
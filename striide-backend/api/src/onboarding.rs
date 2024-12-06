use rocket::http::{CookieJar, Status};
use rocket::serde::json::Json;
use rocket::serde::Deserialize;
use rocket_db_pools::{sqlx, Connection};
use chrono::{DateTime, Utc};

use models::onboarding::{UserInfo, Gender, Transport_mode, Commmute_frequency, Travel_time, Feed_type};
use models::user::UserSession;
use infrastructure::database::Db;
use application::{auth, utils, onboarding};
use shared::response_models::{
    ErrorResponse, NewToken, Response, ResponseBody, TokenResponse
};



//make an endpoint for creating a table




#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct OnboardingRequest {
    email: String,
    user_info: UserInfo,
}

#[post("/entry", data = "<request>")]
pub async fn onboarder(
    mut db: Connection<Db>,
    request: Json<OnboardingRequest>,
) -> Result<Response, ErrorResponse> {
    let data = request.into_inner();
    let email = data.email;
    let user_info = data.user_info;
    //create a table
    match onboarding::create_user_info_table(&mut **db).await {
        Ok(_) => {
            println!("Table created successfully");
        },
        Err(e) => {
            println!("Failed to create table");
        }
    }
    //print the user info
    println!("{:?}", user_info);
    
    match onboarding::insert_user(&mut **db, email, user_info).await {
        Ok(_) => {
            // Update the user's onboarding status
            
            Ok(Response {
                status: Status::Ok,
                body: ResponseBody::Message("Onboarding completed successfully".to_owned()),
            })
        },
        Err(e) => Err(ErrorResponse {
            status: Status::InternalServerError,
            message:"Failed to save user information".to_owned()
        }),
    }
}





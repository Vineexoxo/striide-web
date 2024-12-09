/*
 * External imports
 */
use rocket::http::{CookieJar, Status};
use chrono::{Duration, Utc};
use rocket::serde::json::Json;
use rocket::serde::Deserialize;
use rocket_db_pools::{sqlx, Connection};

/*
 * Internal imports
 */
use application::{auth, utils, onboarding};
use infrastructure::database::Db;
use models::session::Session;
use models::user::{RegisterUser, User, UserRequest, UserSession};
use shared::response_models::{
    ErrorResponse, NewToken, Response, ResponseBody, TokenResponse, UserInfo,
};


/*
 * Constants
 */
const TOKEN_LENGTH: usize = 128;
const ACCESS_EXP_MIN: i64 = 15;
const REFRESH_EXP_DAYS: i64 = 30;

#[post("/register", data = "<request>")]
pub async fn register(
    mut db: Connection<Db>,
    request: Json<RegisterUser>,
) -> Result<Response, ErrorResponse> {
    let data = request.into_inner();
    if auth::user_exists(&mut **db, data.email.clone()).await? {
        return Err(ErrorResponse {
            status: Status::Conflict,
            message: "User already exists".to_owned(),
        });
    }

    let session = Session::new(
        utils::create_token(TOKEN_LENGTH),
        Utc::now() + Duration::minutes(ACCESS_EXP_MIN),
        utils::create_token(TOKEN_LENGTH),
        Utc::now() + Duration::days(REFRESH_EXP_DAYS),
    );
    let hashed_password =
        utils::hash_password(data.password.clone()).map_err(|_| ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to hash password".to_owned(),
        })?;
    let user = User::new(data.email, hashed_password, data.name, session.clone());
    let user_id = auth::insert_user(&mut **db, user).await?;
    auth::insert_session(&mut **db, session.clone(), user_id.clone()).await?;
    auth::insert_user_ip(&mut **db, data.ip, user_id).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::NewToken(NewToken {
            message: "Successfully registered user".to_owned(),
            access_token: session.access_token(),
            refresh_token: session.refresh_token(),
        }),
    })
}

#[post("/login", data = "<request>")]
pub async fn login(
    mut db: Connection<Db>,
    request: Json<UserRequest>,
) -> Result<Response, ErrorResponse> {
    let data = request.into_inner();
    let hashed_password = auth::get_user_password(&mut **db, data.email.clone()).await?;
    if !utils::verify_password(hashed_password, data.password.clone()).map_err(|_| {
        ErrorResponse {
            status: Status::InternalServerError,
            message: "Failed to verify password".to_owned(),
        }
    })? {
        return Err(ErrorResponse {
            status: Status::Unauthorized,
            message: "Invalid credentials".to_owned(),
        });
    }
    let user_id = auth::get_user_id(&mut **db, data.email.clone()).await?;
    let response =
        auth::new_refresh_token(&mut **db, user_id.clone(), TOKEN_LENGTH, REFRESH_EXP_DAYS).await;
    let refresh_token = match response {
        Ok(token) => token,
        Err(_) => {
            let session = Session::new(
                utils::create_token(TOKEN_LENGTH),
                Utc::now() + Duration::minutes(ACCESS_EXP_MIN),
                utils::create_token(TOKEN_LENGTH),
                Utc::now() + Duration::days(REFRESH_EXP_DAYS),
            );
            auth::remove_session(&mut **db, user_id.clone()).await?;
            auth::insert_session(&mut **db, session.clone(), user_id.clone()).await?;
            session.refresh_token()
        }
    };
    let access_token = auth::new_access_token(
        &mut **db,
        refresh_token.clone(),
        TOKEN_LENGTH,
        ACCESS_EXP_MIN,
    )
    .await?;

    auth::insert_user_ip(&mut **db, data.ip, user_id).await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::NewToken(NewToken {
            message: "Successfully logged in user".to_owned(),
            access_token,
            refresh_token,
        }),
    })
}

#[get("/check_session")]
pub async fn check_session(session: Option<UserSession>) -> Result<Response, ErrorResponse> {
    if let Some(session) = session {
        Ok(Response {
            status: Status::Ok,
            body: ResponseBody::UserInfo(UserInfo {
                email: session.email,
                role: session.role,
                name: session.name,
                onboard: session.onboard,
            }),
        })
    } else {
        Err(ErrorResponse {
            status: Status::Unauthorized,
            message: "No active session".to_owned(),
        })
    }
}

#[post("/csrf_token")]
pub async fn csrf_token(
    mut db: Connection<Db>,
    session: UserSession,
) -> Result<Response, ErrorResponse> {
    let token = auth::new_csrf_token(&mut **db, session.access_token, TOKEN_LENGTH).await?;
    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::Token(TokenResponse {
            message: "Successfully created CSRF token".to_owned(),
            token,
        }),
    })
}

#[post("/verify_session")]
pub async fn verify_session(session: UserSession) -> Result<Response, ErrorResponse> {
    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::UserInfo(UserInfo {
            email: session.email,
            role: session.role,
            name: session.name,
            onboard: session.onboard,
        }),
    })
}

#[post("/refresh_access")]
pub async fn refresh_access(
    mut db: Connection<Db>,
    jar: &CookieJar<'_>,
) -> Result<Response, ErrorResponse> {
    let refresh_token = jar.get("auth_cookie");
    if refresh_token.is_none() {
        return Err(ErrorResponse {
            status: Status::Unauthorized,
            message: "No refresh token found".to_owned(),
        });
    }
    let refresh_token_str = refresh_token.unwrap().value().to_string();
    if !auth::valid_refresh_token(&mut **db, refresh_token_str.clone()).await? {
        return Err(ErrorResponse {
            status: Status::Unauthorized,
            message: "Invalid refresh token".to_owned(),
        });
    }

    let access_token = auth::new_access_token(
        &mut **db,
        refresh_token_str.clone(),
        TOKEN_LENGTH,
        ACCESS_EXP_MIN,
    )
    .await?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::Token(TokenResponse {
            message: "Successfully refreshed access".to_owned(),
            token: access_token,
        }),
    })
}


/* Temporary API route for landing page */
/* Should eventually find better place for struct and route */
#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct LandingRequest {
    name: String,
    email: String,
    phone: String,
    city: String,
    state: String,
}
#[post("/landing", data = "<request>")]
pub async fn landing(mut db: Connection<Db>, request: Json<LandingRequest>) -> Result<Response, ErrorResponse> {
    let data = request.into_inner();
    sqlx::query(
        "INSERT INTO landing (name, email, phone, city, state) VALUES ($1, $2, $3, $4, $5)"
    ).bind(data.name)
    .bind(data.email)
    .bind(data.phone)
    .bind(data.city)
    .bind(data.state)
    .execute(&mut **db).await.map_err(|_| ErrorResponse {
        status: Status::InternalServerError,
        message: "Failed to insert landing data".to_owned(),
    })?;

    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::Message("Successfully submitted landing data".to_owned()),
    })
}



/*
 * External Imports
 */
use chrono::{DateTime, Utc};
use rocket::http::Status;
use rocket::outcome::try_outcome;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::serde::{Deserialize, Serialize};
use rocket_db_pools::sqlx::Row;
use std::fmt;
/*
 * Internal Imports
 */
use crate::session::Session;
use infrastructure::database::Db;

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
pub enum Role {
    BasicUser,
    Admin,
}
/* required implementation to call the to_string() method on self */
impl fmt::Display for Role {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
impl Role {
    pub fn from_string(role: String) -> Role {
        match role.as_str() {
            "BasicUser" => Role::BasicUser,
            "Admin" => Role::Admin,
            _ => Role::BasicUser,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct User {
    email: String,
    hashed_password: String,
    name: String,
    role: Role,
    session: Session,
}

impl User {
    pub fn new(email: String, hashed_password: String, name: String, session: Session) -> User {
        User {
            email,
            hashed_password,
            name,
            role: Role::BasicUser,
            session,
        }
    }

    pub fn get_email(&self) -> String {
        self.email.to_owned()
    }

    pub fn get_name(&self) -> String {
        self.name.to_owned()
    }

    pub fn get_hashed_password(&self) -> String {
        self.hashed_password.to_owned()
    }

    pub fn get_role(&self) -> String {
        self.role.to_string().to_owned()
    }

    pub fn get_session(&self) -> Session {
        self.session.to_owned()
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct RegisterUser {
    pub email: String,
    pub password: String,
    pub name: String,
    pub ip: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserRequest {
    pub email: String,
    pub password: String,
    pub ip: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct UserSession {
    pub id: String,
    pub email: String,
    pub role: Role,
    pub name: String,
    pub access_token: String,
    pub onboard: bool,
}

/* Request Guard for UserSession */
#[rocket::async_trait]
impl<'r> FromRequest<'r> for UserSession {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<UserSession, ()> {
        let db = try_outcome!(request.guard::<&Db>().await);
        /* Check that the header with access_token exists */
        let access_token = request.headers().get_one("Authorization");
        match access_token {
            Some(token) => match token.strip_prefix("Bearer ") {
                Some(token) => {
                    let user = sqlx::query("SELECT userid, email, role, name, access_token, access_expires, onboard FROM session INNER JOIN users ON session.userid = users.xata_id WHERE access_token = $1")
                            .bind(token.to_string())
                            .fetch_one(&**db)
                            .await
                            .and_then(|row| {
                                let expires: DateTime<Utc> = row.try_get("access_expires")?;
                                if !(expires > Utc::now()) { return Err(sqlx::Error::RowNotFound) }

                                let id: String = row.try_get("userid")?;
                                let email = row.try_get("email")?;
                                let role = row.try_get("role")?;
                                let name = row.try_get("name")?;
                                let access_token = row.try_get("access_token")?;
                                let onboard: bool = row.try_get("onboard")?;
                                Ok(UserSession {
                                    id,
                                    email,
                                    role: Role::from_string(role),
                                    name,
                                    access_token,
                                    onboard
                                })
                            });
                    return match user {
                        Ok(user) => Outcome::Success(user),
                        Err(err) => {
                            println!("{:?}", err);
                            Outcome::Forward(Status::Unauthorized)},
                    };
                }
                None => return Outcome::Forward(Status::Unauthorized),
            },
            None => Outcome::Forward(Status::Unauthorized),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserRouteQuery {
    pub origin: Vec<f64>,
    pub destination: Vec<f64>,
}







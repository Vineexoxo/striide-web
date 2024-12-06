/*
 * External Imports
 */
use chrono::{DateTime, Utc};
use rocket::serde::Serialize;

/*
 * Internal Imports
 */

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Session {
    created: DateTime<Utc>,
    access_expires: DateTime<Utc>,
    access_token: String,
    refresh_expires: DateTime<Utc>,
    refresh_token: String,
}

impl Session {
    pub fn new(
        access_token: String,
        access_exp: DateTime<Utc>,
        refresh_token: String,
        refresh_exp: DateTime<Utc>,
    ) -> Session {
        let current_date = Utc::now();
        Session {
            created: current_date,
            access_expires: access_exp,
            refresh_expires: refresh_exp,
            access_token,
            refresh_token,
        }
    }

    pub fn new_from_values(
        created: DateTime<Utc>,
        access_exp: DateTime<Utc>,
        access_token: String,
        refresh_exp: DateTime<Utc>,
        refresh_token: String,
    ) -> Session {
        Session {
            created,
            access_expires: access_exp,
            refresh_expires: refresh_exp,
            access_token,
            refresh_token,
        }
    }

    pub fn created_at(&self) -> DateTime<Utc> {
        self.created.to_owned()
    }

    pub fn refresh_expires(&self) -> DateTime<Utc> {
        self.refresh_expires.to_owned()
    }

    pub fn access_expires(&self) -> DateTime<Utc> {
        self.access_expires.to_owned()
    }

    pub fn access_token(&self) -> String {
        self.access_token.to_owned()
    }

    pub fn refresh_token(&self) -> String {
        self.refresh_token.to_owned()
    }
}

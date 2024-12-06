use chrono::{DateTime, Utc};
use rocket::http::Status;
use rocket::outcome::try_outcome;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::serde::{Deserialize, Serialize};
use rocket_db_pools::sqlx::Row;
use std::fmt;
use crate::session::Session;
use infrastructure::database::Db;

//create a enum for gender
#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum Gender {
    Male,
    Female,
    NonBinary,
    Other,
    PreferNotToSay,
}

impl fmt::Display for Gender {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum Transport_mode {
    Driving,
    Biking,
    Walking,
    PublicTransport
}
impl fmt::Display for Transport_mode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum Commmute_frequency{
   Daily,
   Weekly,
   Monthly,
   Never,
}
impl fmt::Display for Commmute_frequency {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum Travel_time{
    Morning,
    Afternoon,
    Evening,
    Night,
}
impl fmt::Display for Travel_time {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}



#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum Feed_type{
   Social_media,
   Friends_Family,
   Email_Newsletter,
   Exploring_Apps,
   Other,
}
impl fmt::Display for Feed_type {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}




#[derive(Debug, Clone, Serialize,Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct UserInfo {
    city: String,
    state: String,
    occupation: String,
    gender: Gender,
    birthdate: DateTime<Utc>,
    phone_number: String,
    transport_modes: [Transport_mode; 4],//rank 1,2,3,4
    commute_frequency: Commmute_frequency,
    travel_time: Travel_time,
    feed_type: Feed_type,


}

//Implement the UserInfo struct
impl UserInfo {
    pub fn new(city: String, state: String, occupation: String, gender: Gender, birthdate: DateTime<Utc>, phone_number: String, transport_modes: [Transport_mode; 4], commute_frequency: Commmute_frequency, travel_time: Travel_time, feed_type: Feed_type) -> UserInfo {
        UserInfo {
            city,
            state,
            occupation,
            gender,
            birthdate,
            phone_number,
            transport_modes,
            commute_frequency,
            travel_time,
            feed_type,
        }
    }
    pub fn get_city(&self) -> String {
        self.city.to_owned()
    }
    pub fn get_state(&self) -> String {
        self.state.to_owned()
    }
    pub fn get_occupation(&self) -> String {
        self.occupation.to_owned()
    }
    pub fn get_gender(&self) -> Gender {
        self.gender.to_owned()
    }
    pub fn get_birthdate(&self) -> DateTime<Utc> {
        self.birthdate.to_owned()
    }
    pub fn get_phone_number(&self) -> String {
        self.phone_number.to_owned()
    }
    pub fn get_transport_modes(&self) -> [Transport_mode; 4] {
        self.transport_modes.to_owned()
    }
    pub fn get_commute_frequency(&self) -> Commmute_frequency {
        self.commute_frequency.to_owned()
    }
    pub fn get_travel_time(&self) -> Travel_time {
        self.travel_time.to_owned()
    }
    pub fn get_feed_type(&self) -> Feed_type {
        self.feed_type.to_owned()
    }

    // pub fn to_json(&self) -> serde_json::Value {
    //     serde_json::json!({
    //         "city": self.city,
    //         "state": self.state,
    //         "occupation": self.occupation,
    //         "gender": format!("{:?}", self.gender),
    //         "birthdate": self.birthdate.to_rfc3339(),
    //         "phone_number": self.phone_number,
    //         "transport_modes": self.transport_modes,
    //         "commute_frequency": self.commute_frequency,
    //         "travel_time": self.travel_time,
    //         "feed_type": self.feed_type,
    //     })
    // }
}


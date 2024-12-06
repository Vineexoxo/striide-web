use std::collections::HashMap;
use std::env;
use std::fmt::Debug;

use dotenv::dotenv;
use sqlx::{Connection, PgConnection, Row};
use rayon::iter::{IntoParallelRefIterator, ParallelIterator};
use rocket::serde::Serialize; 
use serde_json;
use serde_json::json;

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
#[allow(dead_code)]
struct Business {
    xata_id: String,
    address: String,
    description: String,
    coordinates: (f64, f64),
    name: String,
    business_hours: Option<Vec<BusinessTime>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(crate = "rocket::serde")]
#[allow(dead_code)]
struct BusinessTime {
    business_id: String,
    open: i64,
    close: i64,
    day: i64,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let postgres_conn_string = match env::var("POSTGRES_CONNECTION") {
        Ok(v) => v,
        Err(err) => panic!("Could not get ENV variable with error: {}", err),
    };

    let mut postgres_conn = match PgConnection::connect(&postgres_conn_string).await {
        Ok(conn) => conn,
        Err(err) => panic!("Could not connect to the database with this error: {}", err),
    };

    let business_data = match fetch_building_data(&mut postgres_conn).await {
        Ok(business) => business,
        Err(err) => panic!("Failed to fetch business data with error: {}", err),
    };

    let business_hours = match fetch_building_hours(&mut postgres_conn).await {
        Ok(hours) => hours,
        Err(err) => panic!("Failed to fetch business hours with error: {}", err),
    };

    let total_building_data = match associate_building_time(business_data, business_hours) {
        Ok(value) => value, 
        Err(err) => panic!("Failed to associate buildings with time with error: {}", err),  
    };

    let json = json!({
        "buildings": total_building_data
    }); 

    println!("{}", serde_json::to_string_pretty(&json).unwrap()); 
}

async fn fetch_building_data(
    conn: &mut PgConnection,
) -> Result<HashMap<String, Business>, sqlx::Error> {
    let sql_query = "SELECT * FROM business_info";

    let business_data = sqlx::query(sql_query)
        .fetch_all(conn)
        .await
        .and_then(|rows| {
            let businesses: Vec<Business> = rows
                .iter()
                .map(|business| Business {
                    xata_id: business.try_get("xata_id").unwrap(),
                    address: business.try_get("address").unwrap(),
                    description: business.try_get("description").unwrap(),
                    coordinates: (
                        business.try_get("longitude").unwrap(),
                        business.try_get("latitude").unwrap(),
                    ),
                    name: business.try_get::<String, &str>("name").unwrap(),
                    business_hours: None,
                })
                .collect();
            Ok(businesses)
        })
        .map_err(|err| panic!("Could not fetch all of the building data with error: {err}"));

    let mut seen_businesses: HashMap<String, Business> = HashMap::new();

    for business in business_data.unwrap() {
        // let entry = seen_businesses
        //     .entry(business.name.clone())
        //     .or_insert_with(|| business.clone());

        // assert!(business.address.len() == 1);
        // if !entry.address.contains(&business.address.clone()[0]) {
        //     entry.address.extend(business.address.clone());
        // }

        // assert!(business.coordinates.len() == 1);
        // if !entry.coordinates.contains(&business.coordinates.clone()[0]) {
        //     entry.coordinates.extend(business.coordinates.clone());
        // }

        match seen_businesses.insert(business.xata_id.clone(), business) {
            Some(_) => panic!("THIS IMPLIES THAT THERE IS A RECYCLED ID"),
            None => continue,
        };
    }

    // Ok(seen_businesses
    //     .iter()
    //     .map(|entry| entry.1.clone())
    //     .collect())
    Ok(seen_businesses)
}

async fn fetch_building_hours(conn: &mut PgConnection) -> Result<Vec<BusinessTime>, sqlx::Error> {
    let sql_query = "SELECT * FROM business_hours";
    let business_hours_data = sqlx::query(&sql_query)
        .fetch_all(conn)
        .await
        .and_then(|rows| {
            let businesses: Vec<BusinessTime> = rows
                .iter()
                .map(|row| BusinessTime {
                    business_id: row.try_get("business").unwrap(),
                    open: row.try_get("open").unwrap(),
                    close: row.try_get("close").unwrap(),
                    day: row.try_get("day").unwrap(),
                })
                .collect();

            Ok(businesses)
        })?;

    Ok(business_hours_data)
}

fn associate_building_time(
    business_data: HashMap<String, Business>,
    business_hours: Vec<BusinessTime>,
) -> Result<Vec<Business>, Box<dyn std::error::Error>> {
    
    let businesses = business_hours
        .par_iter()
        .map(|time| {
            let id = time.business_id.clone(); 
            let curr_business = match business_data.get(&id) {
                Some(business) => {
                    let mut curr_hours = match business.business_hours.clone() {
                        Some(hours) => hours, 
                        None => vec![] 
                    }; 
                    curr_hours.push(time.clone()); 
                    let mut updated_business = business.clone(); 
                    updated_business.business_hours = Some(curr_hours); 
                    updated_business
                }, 
                None => panic!("There was an ID from business time that was not found in the business hashmap - THIS IS A BUG"), 
            }; 
            curr_business
        })
        .collect();

    Ok(businesses)
}

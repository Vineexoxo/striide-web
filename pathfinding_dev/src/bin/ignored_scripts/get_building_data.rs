/*
 *  gets all of the open businesses and stores them in a json file.
 */

use dotenv::dotenv;
use sqlx::postgres::PgRow;
use sqlx::{Connection, PgConnection, Row};

use std::collections::HashMap;
use std::env;

#[derive(Debug, Clone)]
struct Business {
    address: Vec<String>,
    description: String,
    coordinates: Vec<(f64, f64)>,
    name: String,
    business_hours: Option<Vec<BusinessTime>>,
}

#[derive(Debug, Clone)]
struct BusinessTime {
    open: u32,
    close: u32,
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    let conn_string = match env::var("POSTGRES_CONNECTION") {
        Ok(v) => v,
        Err(err) => panic!(
            "failed to find env variable with name POSTGRES_CONNECTION: {}",
            err
        ),
    };

    let businesses = match get_buisnesses(&conn_string).await {
        Ok(value) => value,
        Err(err) => panic!("SOMETHING WENT WRONG QUERYING THE DATABASE: {}", err),
    };

    println!("{businesses:#?}");

    // let _get_buisness_data_query = "SELECT TOP 1 * FROM buisness_hours";
    // println!("{:#?}", business_hours);
}

async fn get_buisnesses(conn_string: &str) -> Result<HashMap<String, Business>, sqlx::Error> {
    let mut postgres_conn = PgConnection::connect(&conn_string).await?;
    let get_buisness_hours_query = "SELECT * FROM business_info";
    let mut business_hashmap: HashMap<String, Business> = std::collections::HashMap::new();

    let businesses_data = sqlx::query(&get_buisness_hours_query)
        .fetch_all(&mut postgres_conn)
        .await
        .and_then(|rows| Ok(rows))
        .map_err(|err| panic!("Error returned from the database: {}", err));

    let businesses: Vec<Business> = businesses_data.unwrap().iter().map(get_business).collect();

    for business in businesses {
        let (address, description, lattitude, longitude, name) = (
            business.try_get("address").unwrap(),
            business.try_get("description").unwrap(),
            business.try_get("latitude").unwrap(),
            business.try_get("longitude").unwrap(),
            business.try_get::<String, &str>("name").unwrap(),
        );

        if business_hashmap.contains_key(&name) {
            eprintln!("within duplicate name case with name: {}", name);
            let mut existing_entry: Business = business_hashmap.get(&name).unwrap().clone();
            eprintln!(
                "Address Vec with name {}: {:#?}",
                name, existing_entry.address
            );
            existing_entry.address.push(address);
            existing_entry.coordinates.push((longitude, lattitude));
        } else {
            let curr_business = Business {
                name: name.clone(),
                address: vec![address],
                description: description,
                coordinates: vec![(longitude, lattitude)],
                business_hours: None,
            };

            business_hashmap.insert(name, curr_business);
        }
    }

    Ok(business_hashmap)
}

fn get_business(row: &PgRow) -> Business {
    todo!();
}
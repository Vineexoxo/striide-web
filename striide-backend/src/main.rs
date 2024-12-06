#[macro_use]
extern crate rocket;

use dotenv::dotenv;

use infrastructure::cors;
use infrastructure::database;
use api;

#[launch]
fn rocket() -> _ {
    // Load environment variables
    dotenv().ok();

    // Build API routes with CORS and database middleware attached
    rocket::build()
        .attach(cors::CORS)
        .attach(database::stage())
        .manage(api::load_graph())
        .mount("/api", api::routes())
}

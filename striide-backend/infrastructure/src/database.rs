use rocket::fairing::AdHoc;
use rocket_db_pools::{sqlx, Database};

#[derive(Database)]
#[database("postgres")]
pub struct Db(sqlx::PgPool);

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("", |rocket| async { rocket.attach(Db::init()) })
}

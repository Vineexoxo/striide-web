/*
 * External imports
 */
use rocket::http::Status;
use rocket_db_pools::Connection;

/*
 * Internal imports
 */
use application::business::get_open_businesses;
use infrastructure::database::Db;
use shared::response_models::{BusinessResponse, ErrorResponse, Response, ResponseBody};

#[get("/open_businesses")]
pub async fn open_businesses(mut db: Connection<Db>) -> Result<Response, ErrorResponse> {
    Ok(Response {
        status: Status::Ok,
        body: ResponseBody::BusinessResponse(BusinessResponse {
            message: "Successfully retrieved open businesses".to_owned(),
            ids: get_open_businesses(&mut **db).await?,
        }),
    })
}

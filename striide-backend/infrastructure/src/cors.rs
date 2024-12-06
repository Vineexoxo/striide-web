use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "CORS",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        let environment = std::env::var("ENV").unwrap_or("development".to_string());
        let origin = match environment.as_str() {
            "development" => "http://localhost:3000",
            "production" => "https://www.striide.co",
            _ => "",
        };

        response.set_header(Header::new("Access-Control-Allow-Origin", origin));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
        ));

        /*  for some reason - OPTIONS need to be handled seperately */
        if request.method() == rocket::http::Method::Options {
            response.set_status(rocket::http::Status::Ok);
        }
    }
}

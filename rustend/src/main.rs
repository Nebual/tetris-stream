#![feature(plugin)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate rocket_cors;

use rocket::http::Method;
use rocket_cors::{AllowedOrigins, AllowedHeaders};

#[get("/")]
fn index() -> &'static str {
    "Hello, world! Boop!!!!!"
}

fn main() {
    let options = rocket_cors::Cors {
        allowed_origins: AllowedOrigins::all(),
        allowed_methods: vec![Method::Get].into_iter().map(From::from).collect(),
        allowed_headers: AllowedHeaders::some(&["Authorization", "Accept"]),
        allow_credentials: true,
        ..Default::default()
    };

    rocket::ignite()
        .mount("/", routes![index])
        .attach(options)
        .launch();
}

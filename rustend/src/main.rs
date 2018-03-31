#![allow(unused_imports)]

#![feature(plugin)]
#![plugin(rocket_codegen)]
#![feature(custom_attribute)]

extern crate rocket;
extern crate rocket_contrib;
extern crate rocket_cors;
extern crate serde_json;
#[macro_use] extern crate serde_derive;

use rocket::Rocket;
use rocket::http::Method;
use rocket_cors::{AllowedOrigins, AllowedHeaders, AllowedMethods};

#[macro_use]
extern crate diesel;
extern crate r2d2;
extern crate r2d2_diesel;

use std::env;

mod pg_pool;
pub use pg_pool::DbConn;

mod schema;
mod models;
mod item;

#[get("/")]
fn index() -> &'static str {
    "Hello, world! Boop!!!!!"
}

fn main() {
    rocket().launch();
}

fn rocket() -> Rocket {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    rocket::ignite()
        .manage(pg_pool::init_pool(database_url))
        .attach(build_cors_fairing())
        .mount("/", routes![index])
        .mount("/item", routes![item::index, item::get, item::create, item::update, item::delete])
}

fn build_cors_fairing() -> rocket_cors::Cors {
    let (allowed_origins, failed_origins) = AllowedOrigins::some(&["http://localhost:3000"]);
    assert!(failed_origins.is_empty());
    rocket_cors::Cors {
        allowed_origins: allowed_origins, //AllowedOrigins::all(),
        //allowed_methods: vec![Method::Get, Method::Post].into_iter().map(From::from).collect(),
        //allowed_headers: AllowedHeaders::some(&["Authorization", "Accept"]),
        allow_credentials: true,
        ..Default::default()
    }
}
#![allow(unused_imports)]

#![feature(plugin, custom_derive)]
#![plugin(rocket_codegen)]
#![feature(custom_attribute)]

extern crate rocket;
#[macro_use]
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
use rocket::config::LoggingLevel;
use rocket::Config;
use rocket::config::Environment;

mod schema;
mod models;
mod item;
mod inventoryitem;

#[get("/")]
fn index() -> &'static str {
    "Hello, world! Boop!!!!!"
}


#[error(400)]
fn error_400() -> rocket_contrib::Json<rocket_contrib::Value> {
    rocket_contrib::Json(json!({
        "status": "error",
        "reason": "Invalid request",
    }))
}

#[error(404)]
fn not_found() -> rocket_contrib::Json<rocket_contrib::Value> {
    rocket_contrib::Json(json!({
        "status": "error",
        "reason": "Resource was not found.",
    }))
}

#[error(500)]
fn error_500() -> rocket_contrib::Json<rocket_contrib::Value> {
    rocket_contrib::Json(json!({
        "status": "error",
        "reason": "Server 500'd",
    }))
}

fn main() {
    rocket(false).launch();
}

fn rocket(is_test: bool) -> Rocket {
    (match is_test {
        true => {
            let mut config = Config::new(Environment::Development).unwrap();
            config.set_log_level(LoggingLevel::Critical);
            rocket::custom(config, true)
        },
        false => rocket::ignite()
    })
        .manage(build_pg_pool())
        .attach(build_cors_fairing())
        .catch(errors![error_400, not_found, error_500])
        .mount("/", routes![index])
        .mount("/item", routes![item::index, item::get, item::create, item::update, item::delete])
        .mount("/inventoryitem", routes![inventoryitem::index, inventoryitem::get, inventoryitem::create, inventoryitem::update, inventoryitem::delete])
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

fn build_pg_pool() -> pg_pool::Pool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    pg_pool::init_pool(database_url)
}

#[cfg(test)]
fn get_connection() -> DbConn {
    let pool = build_pg_pool();
    pg_pool::DbConn(pool.get().unwrap())
}

#[cfg(test)]
mod test {
    use super::get_connection;
    use env;
    use pg_pool;
    use build_pg_pool;
    use std::io::prelude::*;
    use std::fs::File;
    use diesel::connection::SimpleConnection;

    // cargo test -- populate_test_data --ignored
    #[test]
    #[ignore]
    fn populate_test_data() {
        let conn = get_connection();
        let mut file = File::open("/app/rustend/test_data.sql").expect("Unable to open test_data.sql");
        let mut contents = String::new();
        file.read_to_string(&mut contents).expect("Unable to read test_data.sql");
        conn.batch_execute(&contents).unwrap();
    }
}

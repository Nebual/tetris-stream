use diesel;
use diesel::prelude::*;
use diesel::sql_types::{Nullable, Text, Integer};
use diesel::dsl::sql;
use DbConn;

use models::*;
use schema::{inventory, game};

use rocket::http::Status;
use rocket::request::Form;
use rocket::response::status;
use rocket_contrib::json::{Json, JsonValue};

#[get("/")]
pub fn index(conn: DbConn) -> QueryResult<JsonValue> {
    _get(conn, 0)
}

#[derive(Queryable, Debug, Serialize)]
pub struct GameWithPlayers {
    id: i32,
    name: String,
    players: Vec<String>,
}

#[get("/<id>")]
pub fn get(conn: DbConn, id: i32) -> QueryResult<JsonValue> {
    assert!(id > 0);
    _get(conn, id)
}
fn _get(conn: DbConn, id: i32) -> Result<JsonValue, diesel::result::Error> {
    let games = if id == 0 {
        game::table.load::<Game>(&*conn)?
    } else {
        game::table.find(id).load::<Game>(&*conn)?
    };

    let inventories = Inventory::belonging_to(&games)
        .filter(inventory::class.eq("player"))
        .load::<Inventory>(&*conn)?
        .grouped_by(&games);

    let data = games
        .into_iter()
        .enumerate()
        .map(|(x,y)| GameWithPlayers{
        id: y.id,
        name: y.name,
        players: inventories[x].iter().map(|ref inv| inv.name.clone())
            .collect::<Vec<String>>()
    }).collect::<Vec<_>>();

    if id == 0 {
        Ok(json!(data))
    } else {
        Ok(json!(data[0]))
    }
}

#[post("/", data = "<new>")]
pub fn create(conn: DbConn, new: Json<NewGame>) -> QueryResult<Json<Game>> {
    diesel::insert_into(game::table)
        .values(&new.into_inner())
        .get_result::<Game>(&*conn)
        .map(|p| Json(p))
}

#[patch("/<id>", data = "<new>")]
pub fn update(conn: DbConn, id: i32, new: Json<NewGame>) -> QueryResult<Json<GameWithPlayers>> {
    assert!(id > 0);
    diesel::update(game::table.find(id))
        .set(&new.into_inner())
        .get_result::<Game>(&*conn)
        .map(|p| {
            Json(GameWithPlayers {
                id: p.id,
                name: p.name,
                players: Vec::new(),
            })
        })
}

#[delete("/<id>")]
pub fn delete(conn: DbConn, id: i32) -> Result<Status, diesel::result::Error> {
    assert!(id > 0);
    diesel::delete(game::table.find(id))
        .execute(&*conn)?;
    Ok(Status::NoContent)
}

#[cfg(test)]
mod test {
    use super::*;
    use super::super::{rocket, get_connection};
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use serde_json;

}

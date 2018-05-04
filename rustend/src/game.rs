use diesel;
use diesel::prelude::*;
use diesel::sql_types::{Nullable, Text, Integer};
use diesel::dsl::sql;
use DbConn;

use models::*;
use schema::{inventory, game};

use rocket::response::status;
use rocket_contrib::{Json, Value};
use rocket::request::Form;

#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Value>>
{
    _get(conn, 0)
}

#[derive(Queryable, Debug, Serialize)]
struct GameWithPlayers {
    id: i32,
    name: String,
    players: Vec<String>,
}

#[get("/<id>")]
fn get(conn: DbConn, id: i32) -> QueryResult<Json<Value>>
{
    assert!(id > 0);
    _get(conn, id)
}
fn _get(conn: DbConn, id: i32) -> Result<Json<Value>, diesel::result::Error>
{
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
        Ok(Json(json!(data)))
    } else {
        Ok(Json(json!(data[0])))
    }
}

#[post("/", data = "<new>")]
fn create(conn: DbConn, new: Json<NewGame>) -> QueryResult<Json<Game>>
{
    diesel::insert_into(game::table)
        .values(&new.into_inner())
        .get_result::<Game>(&*conn)
        .map(|p| Json(p))
}

#[patch("/<id>", data = "<new>")]
fn update(conn: DbConn, id: i32, new: Json<NewGame>) -> QueryResult<Json<GameWithPlayers>>
{
    assert!(id > 0);
    diesel::update(game::table.find(id))
        .set(&new.into_inner())
        .get_result::<Game>(&*conn)
        .map(|p| Json(GameWithPlayers{id: p.id, name: p.name, players: Vec::new()}))
}

#[delete("/<id>")]
fn delete(conn: DbConn, id: i32) -> Result<status::NoContent, diesel::result::Error>
{
    assert!(id > 0);
    diesel::delete(game::table.find(id))
        .execute(&*conn)?;
    Ok(status::NoContent)
}

#[cfg(test)]
mod test {
    use super::*;
    use super::super::{rocket, get_connection};
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use serde_json;

}

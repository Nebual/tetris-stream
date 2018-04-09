use diesel;
use diesel::prelude::*;
use diesel::sql_types::{Nullable, Text, Integer};
use DbConn;

use models::*;
use schema::{inventory, inventory_item, template_item};

use rocket::response::status;
use rocket_contrib::Json;
use rocket::request::Form;
/*
#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Vec<InventoryItem>>>
{
    let items = InventoryItem::index(conn)?;
    Ok(Json(items))
}
*/

#[post("/", data = "<new>")]
fn create(conn: DbConn, new: Json<NewInventory>) -> QueryResult<Json<Inventory>>
{
    diesel::insert_into(inventory::table)
        .values(&new.into_inner())
        .get_result::<Inventory>(&*conn)
        .map(|p| Json(p))
}

#[patch("/<inv_id>", data = "<new>")]
fn update(conn: DbConn, inv_id: i32, new: Json<NewInventory>) -> QueryResult<Json<Inventory>>
{
    assert!(inv_id > 0);
    diesel::update(inventory::table.find(inv_id))
        .set(&new.into_inner())
        .get_result::<Inventory>(&*conn)
        .map(|p| Json(p))
}

#[delete("/<inv_id>")]
fn delete(conn: DbConn, inv_id: i32) -> Result<status::NoContent, diesel::result::Error>
{
    assert!(inv_id > 0);
    diesel::delete(inventory::table.find(inv_id))
        .execute(&*conn)?;
    Ok(status::NoContent)
}

#[get("/<inv_id>/items")]
fn get_items(conn: DbConn, inv_id: i32) -> Option<Json<Vec<InventoryItem>>>
{
    if let Ok(result) = InventoryItem::get_in_inventory(conn, inv_id) {
        Some(Json(result))
    } else {
        None
    }
}


#[derive(FromForm)]
struct MoveItemRequest {
    inventory_item_id: i32,
    source_inventory_id: i32, // can be self
    x: i32,
    y: i32
}
#[post("/<dest_inv_id>/items/move", data = "<req>")]
fn move_item(conn: DbConn, dest_inv_id: i32, req: Form<MoveItemRequest>) -> Result<status::NoContent, diesel::result::Error>
{
    // todo
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

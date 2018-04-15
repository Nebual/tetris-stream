use diesel;
use diesel::prelude::*;
use diesel::sql_types::{Nullable, Text, Integer};
use DbConn;

use models::*;
use schema::{inventory, inventory_item, template_item};

use rocket::response::status;
use rocket_contrib::{Json, Value};
use rocket::request::Form;

#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Vec<Inventory>>>
{
    let inventories = inventory::table.load(&*conn)?;
    Ok(Json(inventories))
}

#[derive(FromForm)]
struct SearchParams {
    class: Option<String>,
}
#[get("/?<params>")]
fn search(conn: DbConn, params: SearchParams) -> QueryResult<Json<Vec<Inventory>>>
{
    let mut sql = inventory::table.into_boxed();
    if let Some(class) = params.class {
        sql = sql.filter(inventory::dsl::class.eq(class));
    }
    let item_request = sql.load(&*conn)?;
    Ok(Json(item_request))
}

#[get("/<inv_id>")]
fn get(conn: DbConn, inv_id: i32) -> Option<Json<Value>>
{
    assert!(inv_id > 0);
    if let Ok(result) = inventory::table.find(inv_id).get_result(&*conn) {
        let result: Inventory = result;
        Some(Json(json!({
            "id": result.id,
            "name": result.name,
            "width": result.width,
            "height": result.height,
            "items": InventoryItem::get_in_inventory(conn, inv_id).unwrap(),
        })))
    } else {
        None
    }
}

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


#[derive(Deserialize)]
struct MoveItemRequest {
    inventory_item_id: i32,
    source_inventory_id: i32, // can be self
    x: i32,
    y: i32
}
#[post("/<dest_inv_id>/items/move", data = "<req>")]
fn move_item(conn: DbConn, dest_inv_id: i32, req: Json<MoveItemRequest>) -> Result<status::NoContent, status::NotFound<String>>
{
    if let Ok(updated_rows) = diesel::update(inventory_item::table.find(req.0.inventory_item_id))
        .set((
            inventory_item::inventory_id.eq(dest_inv_id),
            inventory_item::x.eq(req.0.x),
            inventory_item::y.eq(req.0.y),
         ))
        .filter(inventory_item::inventory_id.eq(req.0.source_inventory_id))
        .execute(&*conn)
    {
        if updated_rows == 1 {
            return Ok(status::NoContent)
        }
    }
    Err(status::NotFound("not found".into()))
}

#[cfg(test)]
mod test {
    use super::*;
    use super::super::{rocket, get_connection};
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use serde_json;

}

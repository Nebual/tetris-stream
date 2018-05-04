use diesel;
use diesel::prelude::*;
use diesel::sql_types::{Nullable, Text, Integer};
use DbConn;

use std::collections::HashMap;
use {WSSocketData, WSSocketDataMutexVec};
use std::sync::{Arc, Mutex};

use models::*;
use schema::{inventory, inventory_item, template_item};

use rocket::response::status;
use rocket_contrib::{Json, Value};
use rocket::request::{State, Form};

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
            "items": InventoryItem::get_in_inventory(&conn, inv_id).unwrap(),
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

#[post("/<inv_id>/game", data = "<new>")]
fn change_game(conn: DbConn, ws_connections: State<WSSocketDataMutexVec>, inv_id: i32, new: Json<InventoryGameChange>) -> QueryResult<Json<Inventory>>
{
    assert!(inv_id > 0);
    let game_id = new.game_id.unwrap_or(0);
    let result = diesel::update(inventory::table.find(inv_id))
        .set(&new.into_inner())
        .get_result::<Inventory>(&*conn)
        .map(|p| Json(p));

    if let Ok(ws_connections) = ws_connections.lock() {
        ws_connections.iter().for_each(move |ws| {
            if *ws.game_id.read().unwrap() == game_id {
                ws.ws.send(json!({
                    "action": "openInventory",
                    "value": inv_id,
                }).to_string()).unwrap();
            }
        });
    }

    result
}

#[get("/<inv_id>/items")]
fn get_items(conn: DbConn, inv_id: i32) -> Option<Json<Vec<InventoryItem>>>
{
    if let Ok(result) = InventoryItem::get_in_inventory(&conn, inv_id) {
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
fn move_item(conn: DbConn, dest_inv_id: i32, req: Json<MoveItemRequest>, ws_connections: State<WSSocketDataMutexVec>) -> Result<status::NoContent, status::NotFound<String>>
{
    let source_inv_id = req.0.source_inventory_id;
    if let Ok(updated_rows) = diesel::update(inventory_item::table.find(req.0.inventory_item_id))
        .set((
            inventory_item::inventory_id.eq(dest_inv_id),
            inventory_item::x.eq(req.0.x),
            inventory_item::y.eq(req.0.y),
         ))
        .filter(inventory_item::inventory_id.eq(source_inv_id))
        .execute(&*conn)
    {
        if updated_rows == 1 {
            broadcast_inventory_changes(conn, ws_connections, source_inv_id, dest_inv_id);
            return Ok(status::NoContent)
        }
    }
    Err(status::NotFound("not found".into()))
}

fn broadcast_inventory_changes(conn: DbConn, ws_connections: State<WSSocketDataMutexVec>, source_inv_id: i32, dest_inv_id: i32) {
    let source_inv_items = InventoryItem::get_in_inventory(&conn, source_inv_id).unwrap_or(Vec::new());
    let dest_inv_items = InventoryItem::get_in_inventory(&conn, dest_inv_id).unwrap_or(Vec::new());
    if let Ok(ws_connections) = ws_connections.lock() {
        ws_connections.iter().for_each(move |wsdata| {
            let subscribed_inventories = wsdata.subscribed_inventories.read().unwrap();
            if subscribed_inventories.iter().any(|&x| x == source_inv_id || x == dest_inv_id) {
                // they're likely not subscribed to both inventories
                let mut updates = HashMap::with_capacity(2);
                if subscribed_inventories.contains(&source_inv_id) {
                    updates.insert(source_inv_id.to_string(), &source_inv_items);
                }
                if source_inv_id != dest_inv_id && subscribed_inventories.contains(&dest_inv_id) {
                    updates.insert(dest_inv_id.to_string(), &dest_inv_items);
                }
                wsdata.ws.send(json!({
                    "action": "inventoryItems",
                    "value": updates
                }).to_string()).unwrap();
            }
        });
    } else {
        println!("Failed to get ws_connections lock in inventory.move_item");
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use super::super::{rocket, get_connection};
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use serde_json;

}

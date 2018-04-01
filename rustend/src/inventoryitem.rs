use diesel;
use diesel::prelude::*;
use diesel::types::{Nullable, Text, Integer};
use DbConn;

use models::*;
use schema::{inventory_item, template_item};
use schema::inventory_item::dsl::*;

use rocket::response::status;
use rocket_contrib::Json;

#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Vec<InventoryItem>>>
{
    let items = InventoryItem::index(conn)?;
    Ok(Json(items))
}


#[get("/<item_id>")]
fn get(item_id: i32, conn: DbConn) -> Option<Json<InventoryItem>>
{
    if let Ok(result) = InventoryItem::load(conn, item_id) {
        Some(Json(result))
    } else {
        None
    }
}

#[post("/", data = "<new_item>")]
fn create(conn: DbConn, new_item: Json<NewInventoryItem>) -> QueryResult<Json<InventoryItem>>
{
    let result: i32 = diesel::insert_into(inventory_item)
        .values(&new_item.into_inner())
        .returning(inventory_item::id)
        .get_result::<i32>(&*conn)?;

    let item = InventoryItem::load(conn, result)?;
    Ok(Json(item))
}

#[patch("/<item_id>", data = "<new_item>")]
fn update(conn: DbConn, item_id: i32, new_item: Json<NewInventoryItem>) -> QueryResult<Json<InventoryItem>>
{
    assert!(item_id > 0);
    let result: i32 = diesel::update(inventory_item::table.find(item_id))
        .set(&new_item.into_inner())
        .returning(inventory_item::id)
        .get_result::<i32>(&*conn)?;

    let item = InventoryItem::load(conn, result)?;
    Ok(Json(item))
}

#[delete("/<item_id>")]
fn delete(conn: DbConn, item_id: i32) -> Result<status::NoContent, diesel::result::Error>
{
    assert!(item_id > 0);
    diesel::delete(inventory_item::table.find(item_id))
        .execute(&*conn)?;
    Ok(status::NoContent)
}



use diesel::dsl::sql;
use super::schema::inventory_item::dsl as ii;
use super::schema::template_item::dsl as ti;
sql_function!(coalesce, Coalesce, (x: Nullable<Text>, y: Text) -> Text);

macro_rules! inventory_item_select {() => {
    inventory_item::table
        .inner_join(template_item::table)
        /*
        .select(sql("\
            inventory_item.id, \
            inventory_item.template_id, \
            coalesce(inventory_item.name, template_item.name),\
            coalesce(inventory_item.public_description, template_item.public_description),\
            coalesce(inventory_item.mechanical_description, template_item.mechanical_description),\
            coalesce(inventory_item.hidden_description, template_item.hidden_description),\
            coalesce(inventory_item.price, template_item.price),\
            coalesce(inventory_item.width, template_item.width),\
            coalesce(inventory_item.height, template_item.height),\
            coalesce(inventory_item.image_url, template_item.image_url)\
         "))
         */
        .select((
            ii::id,
            ii::template_id,
            coalesce(ii::name, ti::name),
            coalesce(ii::public_description, ti::public_description),
            coalesce(ii::mechanical_description, ti::mechanical_description),
            coalesce(ii::hidden_description, ti::hidden_description),
            sql("coalesce(inventory_item.price, template_item.price)"),
            sql("coalesce(inventory_item.width, template_item.width)"),
            sql("coalesce(inventory_item.height, template_item.height)"),
            //coalesce_i32(ii::price, 3),
            //coalesce_i32(ii::width, 3),
            //coalesce_i32(ii::height, 3),
            coalesce(ii::image_url, ti::image_url),
        ))
        .group_by((inventory_item::id, template_item::id))
}}

impl InventoryItem {
    pub fn load(conn: DbConn, inv_id: i32) -> QueryResult<InventoryItem> {
        inventory_item_select!()
            .filter(inventory_item::id.eq(inv_id))
            .get_result(&*conn)
    }
    pub fn index(conn: DbConn) -> QueryResult<Vec<InventoryItem>> {
        inventory_item_select!()
            .get_results(&*conn)
    }
}


#[cfg(test)]
mod test {
    use super::*;
    use super::super::{rocket, get_connection};
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use serde_json;

    #[test]
    fn load_inventory_item() {
        let conn = get_connection();
        let item = InventoryItem::load(conn, 9000).unwrap();
        assert_eq!("test item override", item.name);
        assert_eq!("pub desc", item.public_description);
        assert_eq!(3, item.price);
        assert_eq!(42, item.width);
        //println!("Loaded InventoryItem: {:?}", item);
    }

    #[test]
    fn create() {
        let client = Client::new(rocket(true)).expect("valid rocket instance");
        let mut response = client.post("/inventoryitem")
            .body(serde_json::to_string(&NewInventoryItem{
                template_id: 9000,
                name: Some("test invitem 1".to_string()),
                price: Some(56),
                ..NewInventoryItem::default()
            }).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let mut item: InventoryItem = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert!(item.id > 0);
        assert_eq!(item.name, "test invitem 1");
        assert_eq!(item.price, 56);
        assert_eq!(item.public_description, "pub desc");

        item.name = "test invitem 2".to_string();
        let mut response = client.patch(format!("/inventoryitem/{}", item.id))
            .body(serde_json::to_string(&item).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let item2: InventoryItem = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert_eq!(item.id, item2.id);
        assert_eq!(item2.name, "test invitem 2");

        let response = client.delete(format!("/inventoryitem/{}", item2.id))
            .dispatch();
        assert_eq!(response.status(), Status::NoContent);
    }
}

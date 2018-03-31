use diesel;
use diesel::prelude::*;
use DbConn;

use models::*;
use schema::item;
use schema::item::dsl::*;

use rocket::response::status;
use rocket_contrib::Json;

#[get("/")]
fn index(conn: DbConn) -> QueryResult<Json<Vec<Item>>> {
    let item_request = item.load(&*conn)?;
    Ok(Json(item_request))
}


#[get("/<item_id>")]
fn get(item_id: i32, conn: DbConn) -> Option<Json<Item>> {
    if let Ok(result) = item.find(item_id).get_result(&*conn) {
        Some(Json(result))
    } else {
        None
    }
}

#[post("/", data = "<new_item>")]
fn create(conn: DbConn, new_item: Json<NewItem>) -> QueryResult<Json<Item>> {

    diesel::insert_into(item)
        .values(&new_item.into_inner())
        .get_result::<Item>(&*conn)
        .map(|p| Json(p))
}

#[patch("/", data = "<new_item>")]
fn update(conn: DbConn, new_item: Json<Item>) -> QueryResult<Json<Item>> {

    let i = new_item.into_inner();
    diesel::update(item::table.find(i.id))
        .set(&i)
        .get_result::<Item>(&*conn)
        .map(|p| Json(p))
}

#[delete("/<item_id>")]
fn delete(conn: DbConn, item_id: i32) -> Result<status::NoContent, diesel::result::Error> {
    assert!(item_id > 0);
    diesel::delete(item::table.find(item_id))
        .execute(&*conn)?;
    Ok(status::NoContent)
}

#[cfg(test)]
mod test {
    use super::super::rocket;
    use rocket::local::Client;
    use rocket::http::{Status, ContentType};
    use super::{Json, Item, NewItem};
    use serde_json;

    #[test]
    fn create() {
        let client = Client::new(rocket()).expect("valid rocket instance");
        let mut response = client.post("/item")
            .body(serde_json::to_string(&NewItem{
                name: "test item".to_string(),
                price: 4,
                description: "test desc".to_string(),
            }).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let mut item: Item = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert_eq!(item.name, "test item");
        println!("beepz: {}", item.id);

        item.name = "test item 2".to_string();
        let mut response = client.patch("/item")
            .body(serde_json::to_string(&item).unwrap())
            .header(ContentType::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        let item2: Item = serde_json::from_str(&response.body_string().unwrap()).unwrap();
        assert_eq!(item.id, item2.id);
        assert_eq!(item2.name, "test item 2");
        println!("beep: {}", item2.id);
        assert!(item2.id > 0);

        let response = client.delete(format!("/item/{}", item2.id))
            .dispatch();
        assert_eq!(response.status(), Status::NoContent);
    }
}
